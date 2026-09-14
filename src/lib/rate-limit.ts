/**
 * Lightweight in-memory sliding-window rate limiter.
 * Protects public mutation endpoints from automated spam and abuse.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired keys every 60 seconds
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

export interface RateLimitOptions {
  limit: number;    // Max requests allowed in window
  windowMs: number; // Duration of window in milliseconds
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetInMs: options.windowMs,
    };
  }

  if (record.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: options.limit - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}
