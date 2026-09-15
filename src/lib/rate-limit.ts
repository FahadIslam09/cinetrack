import { db } from "@/lib/db";
import { rateLimits } from "@/lib/db/schema";
import { sql, lt } from "drizzle-orm";

export interface RateLimitOptions {
  limit: number;    // Max requests allowed in window
  windowMs: number; // Duration of window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * PostgreSQL-backed distributed rate limiter.
 * Protects public mutation endpoints across serverless instances and cold starts.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60000 }
): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + options.windowMs);

  try {
    // Atomic upsert: if window expired, reset count to 1 and update resetAt.
    // Otherwise increment count.
    const [record] = await db
      .insert(rateLimits)
      .values({
        key: identifier,
        count: 1,
        resetAt,
      })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`case
            when ${rateLimits.resetAt} <= ${now} then 1
            else ${rateLimits.count} + 1
          end`,
          resetAt: sql`case
            when ${rateLimits.resetAt} <= ${now} then ${resetAt}
            else ${rateLimits.resetAt}
          end`,
        },
      })
      .returning({
        count: rateLimits.count,
        resetAt: rateLimits.resetAt,
      });

    // Probabilistic prune: 5% chance on request to clean expired keys (non-blocking)
    if (Math.random() < 0.05) {
      db.delete(rateLimits)
        .where(lt(rateLimits.resetAt, now))
        .catch(() => {});
    }

    const currentCount = record?.count ?? 1;
    const currentResetAt = record?.resetAt
      ? new Date(record.resetAt).getTime()
      : resetAt.getTime();
    const allowed = currentCount <= options.limit;
    const remaining = Math.max(0, options.limit - currentCount);
    const resetInMs = Math.max(0, currentResetAt - now.getTime());

    return { allowed, remaining, resetInMs };
  } catch (err) {
    // Fail-open strategy on database error to avoid locking out legitimate users
    console.error("Rate limit check failed, failing open:", err);
    return {
      allowed: true,
      remaining: 1,
      resetInMs: options.windowMs,
    };
  }
}
