import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const checkRateLimit = async (identifier: string) => {
  // If keys are missing, we skip rate limiting (fail open) to avoid blocking legitimate users during dev
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Upstash Redis credentials not found. Rate limiting is disabled.");
    return { success: true, limit: 10, remaining: 10, reset: 0 };
  }

  try {
    return await ratelimit.limit(identifier);
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open if Redis is down
    return { success: true, limit: 10, remaining: 10, reset: 0 };
  }
};
