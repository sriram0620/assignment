import { NextResponse } from "next/server";
import { registerUser } from "@/app/api/_server/db";
import { signToken } from "@/app/api/_server/auth";
import { unwrapFetchError } from "@/app/api/_server/supabase";

/** Build a Set-Cookie string for the JWT (httpOnly, no JS access). */
function buildTokenCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === "production";
  return [
    `hrms_token=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    "Max-Age=604800",
    ...(isProduction ? ["Secure"] : []),
  ].join("; ");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgName, fullName, email, password } = body as {
      orgName?: string;
      fullName?: string;
      email?: string;
      password?: string;
    };

    if (!orgName || !fullName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: orgName, fullName, email, password" },
        { status: 400 }
      );
    }

    const result = await registerUser({ orgName, fullName, email, password });
    if (!result) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const token = signToken({
      userId: result.rawUser.id,
      orgId: result.rawUser.org_id,
      role: result.rawUser.role,
      email: result.rawUser.email,
      fullName: result.rawUser.full_name,
    });

    // ── Set httpOnly cookie (XSS-proof) ─────────────────────────────────────
    const response = NextResponse.json(
      { user: result.user, token, expires_in: 604800 },
      { status: 201 }
    );
    response.headers.set("Set-Cookie", buildTokenCookie(token));
    return response;
  } catch (err) {
    const rawMessage = `${err}`;
    const fullCause = unwrapFetchError(err instanceof Error ? err : new Error(rawMessage));

    // ── Network / connectivity errors ─────────────────────────────────────────
    // Node.js fetch wraps ETIMEDOUT / ECONNREFUSED etc. as "fetch failed".
    // Detect them so we return a 503 with actionable guidance instead of
    // a vague 500 "Internal server error".
    if (
      rawMessage.includes("fetch failed") ||
      fullCause.includes("ETIMEDOUT") ||
      fullCause.includes("ECONNREFUSED") ||
      fullCause.includes("ENOTFOUND") ||
      fullCause.includes("ECONNRESET") ||
      fullCause.includes("AbortError") ||
      rawMessage.includes("SUPABASE_MISCONFIGURED")
    ) {
      const isDev = process.env.NODE_ENV === "development";
      console.error(
        "[register] ❌ Supabase connectivity failure\n" +
          `  Error chain: ${fullCause}\n` +
          (isDev
            ? "  → Check your terminal for the detailed [Supabase] probe output.\n" +
              "  → Run: curl -I " +
              (process.env.SUPABASE_URL ?? "<SUPABASE_URL>") +
              "/rest/v1/"
            : "")
      );
      return NextResponse.json(
        {
          error: "Cannot connect to the database. The service may be temporarily unavailable.",
          cause: isDev ? fullCause : undefined,
          hint: isDev
            ? "Check your terminal for [Supabase] probe output. Common fix: resume your Supabase project at https://supabase.com/dashboard"
            : undefined,
        },
        { status: 503 }
      );
    }

    // ── Misc / unexpected errors ──────────────────────────────────────────────
    console.error("[register] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: rawMessage },
      { status: 500 }
    );
  }
}
