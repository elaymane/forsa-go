import "server-only";
import { sql } from "./client";
import { ensureDb } from "./schema";

/**
 * Simple fixed-window rate limiter backed by Postgres — no Redis or other
 * external service needed. Good enough for auth-related actions, which are
 * low-frequency by nature (nobody legitimately logs in 20 times a minute).
 *
 * Returns true if the action is allowed, false if the caller has exceeded
 * maxAttempts within the current window and should be blocked.
 */
export async function checkRateLimit(key: string, maxAttempts: number, windowMinutes: number): Promise<boolean> {
  await ensureDb();

  const rows = (await sql`SELECT attempts, window_start FROM rate_limits WHERE key = ${key}`) as Array<{
    attempts: number;
    window_start: unknown;
  }>;

  const now = Date.now();
  const existing = rows[0];

  if (!existing) {
    await sql`INSERT INTO rate_limits (key, attempts, window_start) VALUES (${key}, 1, now())`;
    return true;
  }

  const windowStart = existing.window_start instanceof Date ? existing.window_start.getTime() : new Date(existing.window_start as string).getTime();
  const windowExpired = now - windowStart > windowMinutes * 60 * 1000;

  if (windowExpired) {
    await sql`UPDATE rate_limits SET attempts = 1, window_start = now() WHERE key = ${key}`;
    return true;
  }

  if (existing.attempts >= maxAttempts) {
    return false;
  }

  await sql`UPDATE rate_limits SET attempts = attempts + 1 WHERE key = ${key}`;
  return true;
}
