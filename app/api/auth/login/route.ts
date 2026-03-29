import { NextResponse } from "next/server";
import { loginUser } from "@/app/api/_server/db";
import { signToken } from "@/app/api/_server/auth";
import { rateLimit } from "@/app/api/_server/rateLimit";

// 5 attempts per 15 minutes per (email + IP) combination
const MAX_ATTEMPTS = 5;
const WINDOW_MS    = 15 * 60 * 1000;

/** Build a Set-Cookie string for the JWT (httpOnly, no JS access). */
function buildTokenCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === "production";
  return [
    `hrms_token=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    "Max-Age=604800", // 7 days
    ...(isProduction ? ["Secure"] : []),
  ].join("; ");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // ── Rate limiting ─────────────────────────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const limitKey = `login:${email.toLowerCase()}:${ip}`;
    const limit    = rateLimit(limitKey, MAX_ATTEMPTS, WINDOW_MS);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${limit.resetInSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After":          String(limit.resetInSeconds),
            "X-RateLimit-Limit":    String(MAX_ATTEMPTS),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // ── Authenticate ──────────────────────────────────────────────────────────
    const result = await loginUser(email, password);
    if (!result) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // ── Issue JWT ─────────────────────────────────────────────────────────────
    const token = signToken({
      userId:   result.rawUser.id,
      orgId:    result.rawUser.org_id,
      role:     result.rawUser.role,
      email:    result.rawUser.email,
      fullName: result.rawUser.full_name,
    });

    // ── Set httpOnly cookie (XSS-proof) ───────────────────────────────────────
    const response = NextResponse.json(
      { user: result.user, token, expires_in: 604800 },
      { status: 200 }
    );
    response.headers.set("Set-Cookie", buildTokenCookie(token));

    return response;
  } catch (err) {
    console.error("[login] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: `${err}` },
      { status: 500 }
    );
  }
}
