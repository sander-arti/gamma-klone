/**
 * Redis Connection Singleton
 *
 * Provides a shared Redis connection for BullMQ queues and rate limiting.
 * Uses IORedis with automatic reconnection.
 */

import Redis from "ioredis";

let redisConnection: Redis | null = null;

/**
 * Get the shared Redis connection
 * Creates a new connection if one doesn't exist
 */
export function getRedisConnection(): Redis {
  if (redisConnection) {
    return redisConnection;
  }

  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

  redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false, // Faster startup
    retryStrategy(times) {
      // Exponential backoff with max 30s
      const delay = Math.min(times * 100, 30000);
      console.log(`Redis connection attempt ${times}, retrying in ${delay}ms`);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = "READONLY";
      if (err.message.includes(targetError)) {
        // Reconnect when Redis is in read-only mode (failover)
        return true;
      }
      return false;
    },
  });

  redisConnection.on("connect", () => {
    console.log("Redis connected");
  });

  redisConnection.on("error", (err) => {
    console.error("Redis error:", err.message);
  });

  redisConnection.on("close", () => {
    console.log("Redis connection closed");
  });

  return redisConnection;
}

/**
 * Close the Redis connection (for graceful shutdown)
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
    console.log("Redis connection closed gracefully");
  }
}

/**
 * Create a new Redis connection for BullMQ worker
 * Workers need separate connections from the main app
 */
export function createWorkerConnection(): Redis {
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}
