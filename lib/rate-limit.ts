// lib/rate-limit.ts
// Simple in-memory rate limiter (use Redis for production)

type RateLimitStore = Map<string, { count: number; lastReset: number }>;

const rateLimitMap: RateLimitStore = new Map();

/**
 * Check if request is allowed based on IP rate limiting
 * @returns true if allowed, false if blocked
 */
export function rateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  // Reset counter if window has passed
  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }

  // Block if over limit
  if (record.count >= limit) {
    return false;
  }

  // Allow and increment
  record.count += 1;
  rateLimitMap.set(ip, record);
  return true;
}
