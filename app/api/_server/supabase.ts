import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

// ─── Network error unwrapper ──────────────────────────────────────────────────
// Node.js fetch wraps OS-level errors (ETIMEDOUT, ECONNREFUSED…) in the
// `.cause` chain of the thrown Error. The Supabase SDK then re-wraps that
// into a PostgrestError, losing the cause.  `throwDbError` in db.ts calls
// this on the ORIGINAL error object (not a new Error created from its message)
// so we can walk the full chain and surface the real OS error code.
export function unwrapFetchError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);

  let cursor: unknown = err;
  const seen = new Set<unknown>();
  const parts: string[] = [];

  while (cursor instanceof Error && !seen.has(cursor)) {
    seen.add(cursor);
    parts.push(cursor.message);
    const code = (cursor as NodeJS.ErrnoException).code;
    if (code) parts.push(`[${code}]`);
    cursor = cursor.cause;
  }

  return parts.join(" ← ");
}

/**
 * Probe the Supabase REST endpoint with a 5-second timeout.
 * Used by GET /api/health for instant connectivity diagnosis.
 */
export async function testSupabaseConnection(
  url: string,
  key: string
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status };
  } catch (err: unknown) {
    clearTimeout(timer);
    const msg =
      err instanceof Error
        ? `${err.name}: ${err.message}${(err as NodeJS.ErrnoException).code ? ` [${(err as NodeJS.ErrnoException).code}]` : ""}`
        : String(err);
    return { ok: false, error: msg };
  }
}

/** Server-side Supabase admin client (service role — bypasses RLS). */
export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables."
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _client;
}