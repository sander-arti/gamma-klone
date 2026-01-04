/**
 * Redis Pub/Sub for Extraction Status
 *
 * Enables real-time communication for file extraction progress
 * between the extraction worker and the SSE API endpoint.
 */

import Redis from "ioredis";
import { createPublisher as createBasePublisher, createSubscriber, closeConnection } from "./redis-pubsub";

export { createSubscriber, closeConnection };

const CHANNEL_PREFIX = "extraction:";

/**
 * Extraction event types
 */
export type ExtractionEventType = "processing" | "completed" | "failed";

/**
 * Extraction event data structure
 */
export interface ExtractionEvent {
  type: ExtractionEventType;
  uploadId: string;
  timestamp: number;
  data?: {
    message?: string;
    extractedText?: string;
    charCount?: number;
    truncated?: boolean;
    metadata?: {
      pageCount?: number;
      wordCount?: number;
    };
    error?: {
      code: string;
      message: string;
    };
  };
}

/**
 * Create a Redis publisher for extraction events
 */
export function createPublisher(): Redis {
  return createBasePublisher();
}

/**
 * Get the channel name for an extraction job
 */
export function getExtractionChannelName(uploadId: string): string {
  return `${CHANNEL_PREFIX}${uploadId}`;
}

/**
 * Publish an extraction event to Redis
 *
 * @param publisher - Redis publisher connection
 * @param uploadId - Upload ID
 * @param event - Extraction event to publish
 */
export async function publishExtractionEvent(
  publisher: Redis,
  uploadId: string,
  event: ExtractionEvent
): Promise<void> {
  const channel = getExtractionChannelName(uploadId);
  console.log(`[Redis] Publishing extraction ${event.type} to channel ${channel}`);
  const numSubscribers = await publisher.publish(channel, JSON.stringify(event));
  console.log(`[Redis] Published extraction ${event.type} - ${numSubscribers} subscriber(s) received it`);
}

/**
 * Subscribe to an extraction job's events
 *
 * @param subscriber - Redis subscriber connection
 * @param uploadId - Upload ID to subscribe to
 * @param onMessage - Callback for each received event
 * @returns Promise that resolves to cleanup function
 */
export async function subscribeToExtraction(
  subscriber: Redis,
  uploadId: string,
  onMessage: (event: ExtractionEvent) => void
): Promise<() => void> {
  const channel = getExtractionChannelName(uploadId);
  console.log(`[Redis] Subscribing to extraction channel: ${channel}`);

  // Set up message handler BEFORE subscribing
  const messageHandler = (ch: string, message: string) => {
    console.log(`[Redis] Extraction message received on channel ${ch}`);
    if (ch === channel) {
      try {
        const event = JSON.parse(message) as ExtractionEvent;
        console.log(`[Redis] Parsed extraction event: ${event.type}`);
        onMessage(event);
      } catch (err) {
        console.error("Failed to parse extraction event:", err);
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
