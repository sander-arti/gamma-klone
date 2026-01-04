/**
 * Redis Pub/Sub Utilities for Real-time Streaming
 *
 * Enables real-time communication between the BullMQ worker
 * (which generates slides) and the SSE API endpoint
 * (which streams to the client).
 *
 * Architecture:
 * [Worker] --publish--> Redis --subscribe--> [SSE Endpoint] --stream--> [Client]
 */

import Redis from "ioredis";
import type { StreamEvent } from "./types";

const CHANNEL_PREFIX = "generation:";

/**
 * Get Redis URL from environment
 */
function getRedisUrl(): string {
  return process.env.REDIS_URL ?? "redis://localhost:6379";
}

/**
 * Create a Redis publisher connection
 * Used by the worker to publish events
 */
export function createPublisher(): Redis {
  return new Redis(getRedisUrl(), {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  });
}

/**
 * Create a Redis subscriber connection
 * Used by the SSE endpoint to subscribe to events
 *
 * Note: Subscribers must be separate connections from publishers
 * because Redis enters subscribe mode and can't execute other commands
 */
export function createSubscriber(): Redis {
  return new Redis(getRedisUrl(), {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  });
}

/**
 * Get the channel name for a generation
 */
export function getChannelName(generationId: string): string {
  return `${CHANNEL_PREFIX}${generationId}`;
}

/**
 * Publish a stream event to Redis
 *
 * @param publisher - Redis publisher connection
 * @param generationId - Generation ID
 * @param event - Stream event to publish
 */
export async function publishEvent(
  publisher: Redis,
  generationId: string,
  event: StreamEvent
): Promise<void> {
  const channel = getChannelName(generationId);
  console.log(`[Redis] Publishing ${event.type} to channel ${channel}`);
  const numSubscribers = await publisher.publish(channel, JSON.stringify(event));
  console.log(`[Redis] Published ${event.type} - ${numSubscribers} subscriber(s) received it`);
}

/**
 * Subscribe to a generation's stream events
 *
 * @param subscriber - Redis subscriber connection
 * @param generationId - Generation ID to subscribe to
 * @param onMessage - Callback for each received event
 * @returns Promise that resolves to cleanup function to unsubscribe
 */
export async function subscribeToGeneration(
  subscriber: Redis,
  generationId: string,
  onMessage: (event: StreamEvent) => void
): Promise<() => void> {
  const channel = getChannelName(generationId);
  console.log(`[Redis] Subscribing to channel: ${channel}`);

  // Set up message handler BEFORE subscribing
  const messageHandler = (ch: string, message: string) => {
    console.log(`[Redis] Message received on channel ${ch}`);
    if (ch === channel) {
      try {
        const event = JSON.parse(message) as StreamEvent;
        console.log(`[Redis] Parsed event: ${event.type}`);
        onMessage(event);
      } catch (err) {
        console.error("Failed to parse stream event:", err);
      }
    }
  };

  subscriber.on("message", messageHandler);

  // Wait for subscription to be ready
  try {
    await subscriber.subscribe(channel);
    console.log(`[Redis] Successfully subscribed to ${channel}`);
  } catch (err) {
    console.error(`Failed to subscribe to ${channel}:`, err);
    throw err;
  }

  // Return cleanup function
  return () => {
    console.log(`[Redis] Unsubscribing from ${channel}`);
    subscriber.off("message", messageHandler);
    subscriber.unsubscribe(channel).catch(() => {
      // Ignore errors during cleanup
    });
  };
}

/**
 * Helper to safely close a Redis connection
 */
export async function closeConnection(connection: Redis): Promise<void> {
  try {
    await connection.quit();
  } catch {
    // Force close if quit fails
    connection.disconnect();
  }
}
