/**
 * GET /api/health
 *
 * Quick connectivity check for all external services.
 * Open this in your browser or run:
 *   curl http://localhost:3000/api/health | jq
 *
 * Returns 200 if everything is reachable, 503 if any dependency is down.
 */

import { NextResponse } from "next/server";
import { testSupabaseConnection } from "@/app/api/_server/supabase";

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // ── Supabase check ────────────────────────────────────────────────────────
  let supabase: { reachable: boolean; status?: number; error?: string; hint?: string } = {
    reachable: false,
    error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in environment.",
  };

  if (supabaseUrl && supabaseKey) {
    const result = await testSupabaseConnection(supabaseUrl, supabaseKey);
    supabase = {
      reachable: result.ok,
      status: result.status,
      error: result.error,
      hint: result.ok
        ? undefined
        : (() => {
            const e = result.error ?? "";
            if (e.includes("ETIMEDOUT") || e.includes("AbortError"))
              return "TCP connection timed out. Likely causes: (1) Supabase project is PAUSED — resume at https://supabase.com/dashboard, (2) local network/VPN is blocking outbound HTTPS to supabase.co";
            if (e.includes("ECONNREFUSED"))
              return "Connection refused. Check SUPABASE_URL in .env.local.";
            if (e.includes("ENOTFOUND"))
              return "DNS lookup failed. SUPABASE_URL may be wrong or your network has no internet access.";
            if (e.includes("ECONNRESET"))
              return "Connection reset. Possible TLS issue or intermittent network problem.";
            return "Unknown network error. Run: curl -I " + supabaseUrl + "/rest/v1/";
          })(),
    };
  }

  // ── JWT config check ──────────────────────────────────────────────────────
  const jwtOk = Boolean(process.env.JWT_SECRET);

  // ── Gemini check (optional) ───────────────────────────────────────────────
  const geminiOk = Boolean(process.env.GEMINI_API_KEY);

  // ── Overall status ────────────────────────────────────────────────────────
  const allOk = supabase.reachable && jwtOk;
  const httpStatus = allOk ? 200 : 503;

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      checks: {
        supabase: {
          url: supabaseUrl
            ? supabaseUrl.replace(/\/\/(.{8}).*\.supabase/, "//$1***.supabase")
            : "(not set)",
          reachable: supabase.reachable,
          http_status: supabase.status,
          error: supabase.error,
          hint: supabase.hint,
        },
        jwt_secret: { configured: jwtOk },
        gemini_api: { configured: geminiOk },
      },
    },
    { status: httpStatus }
  );
}
