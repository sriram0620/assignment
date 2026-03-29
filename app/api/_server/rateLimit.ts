/**
 * rateLimit.ts — In-memory sliding-window rate limiter
 *
 * Tracks attempts per key (e.g. "login:email:ip").
 * No external dependency — works on Vercel Node.js runtime.
 *
 * Evicts stale buckets every 10 minutes to prevent memory growth.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const store = new Map<string, Bucket>();
let lastCleanup = Date.now();

function maybeEvict(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < 10 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, bucket] of store.entries()) {
    if (now - bucket.windowStart > windowMs) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Check and record a rate-limit attempt.
 *
 * @param key      Unique string, e.g. `login:${email}:${ip}`
 * @param max      Maximum allowed calls inside the window
 * @param windowMs Sliding window duration in milliseconds
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  maybeEvict(windowMs);

  const now = Date.now();
  const bucket = store.get(key);

  // Start a fresh window
  if (!bucket || now - bucket.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: max - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  bucket.count += 1;

  const resetInSeconds = Math.ceil(
    (bucket.windowStart + windowMs - now) / 1000
  );

  if (bucket.count > max) {
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  return {
    allowed: true,
    remaining: Math.max(0, max - bucket.count),
    resetInSeconds,
  };
}
