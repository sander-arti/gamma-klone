/**
 * Rate Limiting
 *
 * Redis-based sliding window rate limiting per API key.
 */

import { getRedisConnection } from "@/lib/queue/redis";
import { ApiError } from "./errors";

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  perMinute: number;
  perDay: number;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number; // Unix timestamp
  limit: number;
}

/**
 * Default rate limits (from environment or hardcoded defaults)
 */
export function getRateLimitConfig(): RateLimitConfig {
  return {
    perMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE ?? "10", 10),
    perDay: parseInt(process.env.RATE_LIMIT_PER_DAY ?? "100", 10),
  };
}

/**
 * Check rate limit for an API key
 * Uses sliding window counters in Redis
 */
export async function checkRateLimit(
  apiKeyId: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedisConnection();
  const { perMinute, perDay } = config ?? getRateLimitConfig();

  const now = Date.now();
  const minuteWindow = Math.floor(now / 60000); // Current minute
  const dayDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const minuteKey = `ratelimit:${apiKeyId}:minute:${minuteWindow}`;
  const dayKey = `ratelimit:${apiKeyId}:day:${dayDate}`;

  // Use multi for atomic operations
  const pipeline = redis.multi();

  // Get current counts
  pipeline.get(minuteKey);
  pipeline.get(dayKey);

  const results = await pipeline.exec();

  if (!results) {
    // Redis error, allow the request but log
    console.error("Rate limit check failed: Redis pipeline returned null");
    return { allowed: true, remaining: perMinute, reset: now + 60000, limit: perMinute };
  }

  const minuteCount = parseInt((results[0][1] as string) ?? "0", 10);
  const dayCount = parseInt((results[1][1] as string) ?? "0", 10);

  // Check if over limit
  if (minuteCount >= perMinute) {
    return {
      allowed: false,
      remaining: 0,
      reset: (minuteWindow + 1) * 60000, // Next minute
      limit: perMinute,
    };
  }

  if (dayCount >= perDay) {
    // Day limit exceeded - reset at midnight UTC
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0);
    return {
      allowed: false,
      remaining: 0,
      reset: tomorrow.getTime(),
      limit: perDay,
    };
  }

  // Increment counters
  const incrPipeline = redis.multi();
  incrPipeline.incr(minuteKey);
  incrPipeline.expire(minuteKey, 120); // 2 minutes TTL
  incrPipeline.incr(dayKey);
  incrPipeline.expire(dayKey, 86400 * 2); // 2 days TTL

  await incrPipeline.exec();

  return {
    allowed: true,
    remaining: Math.min(perMinute - minuteCount - 1, perDay - dayCount - 1),
    reset: (minuteWindow + 1) * 60000,
    limit: perMinute,
  };
}

/**
 * Apply rate limit check and throw if exceeded
 */
export async function enforceRateLimit(apiKeyId: string): Promise<RateLimitResult> {
  const result = await checkRateLimit(apiKeyId);

  if (!result.allowed) {
    throw new ApiError(
      "RATE_LIMITED",
      `Rate limit exceeded. Try again at ${new Date(result.reset).toISOString()}`
    );
  }

  return result;
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.reset / 1000).toString(),
  };
}
