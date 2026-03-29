import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 *
 * Clears the httpOnly session cookie.
 * Frontend should also clear its local Zustand state on success.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  // Max-Age=0 immediately expires the cookie
  response.headers.set(
    "Set-Cookie",
    "hrms_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0"
  );
  return response;
}
