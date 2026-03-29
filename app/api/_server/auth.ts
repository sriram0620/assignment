/**
 * auth.ts — JWT-based authentication helpers
 *
 * Signs and verifies tokens using JWT_SECRET from env.
 * requireUser() is used by all protected route handlers.
 */

import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import type { InternalUser } from "./db";
import type { Role } from "@/lib/types";

// ─── JWT Payload ──────────────────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  orgId: string;
  role: Role;
  email: string;
  fullName: string;
  iat?: number;
  exp?: number;
}

const VALID_ROLES: Role[] = ["admin", "hr_manager", "manager", "employee"];

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set in environment variables.");
  return s;
}

// ─── Sign ─────────────────────────────────────────────────────────────────────
export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

// ─── Verify ───────────────────────────────────────────────────────────────────
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

// ─── Extract Bearer token ─────────────────────────────────────────────────────
export function getBearerToken(request: Request | NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice("Bearer ".length).trim();
}

/** Extract the JWT from the httpOnly cookie set by login/register. */
export function getCookieToken(request: Request | NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)hrms_token=([^;]+)/);
  return match?.[1] ?? null;
}

// ─── requireUser ──────────────────────────────────────────────────────────────
/**
 * Validates the JWT from the httpOnly cookie (preferred) or Authorization
 * header (legacy / Postman / curl fallback).
 *
 * If the token has a valid `role` field → returns the user from the token
 * (no DB lookup needed — fast path).
 *
 * If `role` is missing or invalid (stale token from an older code version) →
 * falls back to a DB lookup using the userId embedded in the token. This
 * makes the function resilient to JWT structure changes between deployments.
 */
export async function requireUser(
  request: Request | NextRequest
): Promise<InternalUser | null> {
  // Prefer httpOnly cookie — not accessible to JS, XSS-proof
  const token = getCookieToken(request) ?? getBearerToken(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // ── Fast path: role is present and valid ──────────────────────────────────
  if (payload.role && VALID_ROLES.includes(payload.role)) {
    return {
      id: payload.userId,
      email: payload.email,
      password: "",        // never exposed to route handlers
      role: payload.role,
      org_id: payload.orgId,
      full_name: payload.fullName,
    };
  }

  // ── Slow path: role missing / invalid — look up user in DB ───────────────
  // This handles stale tokens issued before `role` was added to the JWT
  // (e.g., tokens from the previous in-memory / old-Supabase code version).
  console.warn(
    "[requireUser] Token missing or invalid role for userId:",
    payload.userId,
    "— falling back to DB lookup"
  );

  try {
    // Lazy import to avoid circular dep at module load time
    const { getUserById } = await import("./db");
    const dbUser = await getUserById(payload.userId);
    if (!dbUser) {
      console.warn("[requireUser] DB fallback: user not found:", payload.userId);
      return null;
    }
    // Verify org_id consistency (basic sanity check)
    if (dbUser.org_id !== payload.orgId) {
      console.warn("[requireUser] DB fallback: org_id mismatch for user:", payload.userId);
      return null;
    }
    console.info(
      "[requireUser] DB fallback succeeded — role resolved:",
      dbUser.role,
      "for user:",
      payload.userId
    );
    return dbUser;
  } catch (err) {
    console.error("[requireUser] DB fallback failed:", err);
    return null;
  }
}
