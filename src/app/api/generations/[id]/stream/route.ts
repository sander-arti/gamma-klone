/**
 * GET /api/generations/[id]/stream
 *
 * SSE (Server-Sent Events) endpoint for real-time generation updates.
 * Subscribes to Redis Pub/Sub channel for the specified generation.
 *
 * Events:
 * - connected: Initial connection established
 * - generation_started: Generation has begun
 * - outline_complete: Outline has been generated
 * - slide_content: A slide has been generated
 * - generation_complete: All slides generated, deck ready
 * - generation_failed: An error occurred
 */

import { NextRequest } from "next/server";
import {
  createSubscriber,
  subscribeToGeneration,
  closeConnection,
} from "@/lib/streaming/redis-pubsub";
import { formatSSE, createStreamEvent } from "@/lib/streaming/types";
import { getGenerationJob } from "@/lib/db/generation-job";

// Use Node.js runtime for Redis support
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: generationId } = await params;
  console.log(`[SSE ${generationId}] Stream request received`);

  // Verify the generation exists
  const job = await getGenerationJob(generationId);
  if (!job) {
    console.log(`[SSE ${generationId}] Job not found`);
    return new Response(
      JSON.stringify({ error: { code: "NOT_FOUND", message: "Generation not found" } }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log(`[SSE ${generationId}] Job status: ${job.status}`);

  // If already completed or failed, return current state immediately
  if (job.status === "completed" || job.status === "failed") {
    console.log(`[SSE ${generationId}] Job already ${job.status}, returning immediately`);
    const encoder = new TextEncoder();

    // For completed jobs, include the deckId and viewUrl so frontend can navigate
    const eventData =
      job.status === "completed"
        ? {
            progress: 100,
            deckId: job.deckId ?? undefined,
            viewUrl: job.viewUrl ?? undefined,
          }
        : {
            error: {
              code: job.errorCode ?? "UNKNOWN",
              message: job.errorMessage ?? "Unknown error",
            },
          };

    const event = createStreamEvent(
      job.status === "completed" ? "generation_complete" : "generation_failed",
      generationId,
      eventData
    );

    return new Response(encoder.encode(formatSSE(event)), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  // Create subscriber for this generation
  console.log(`[SSE ${generationId}] Creating Redis subscriber...`);
  const subscriber = createSubscriber();
  const encoder = new TextEncoder();

  // Set up heartbeat to keep connection alive
  let heartbeatInterval: NodeJS.Timeout | null = null;
  let isClosing = false;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Connect to Redis
        console.log(`[SSE ${generationId}] Connecting to Redis...`);
        await subscriber.connect();
        console.log(`[SSE ${generationId}] Redis connected`);

        // Send connected event
        controller.enqueue(
          encoder.encode(formatSSE(createStreamEvent("connected", generationId, { progress: 0 })))
        );
        console.log(`[SSE ${generationId}] Sent connected event`);

        // Set up heartbeat every 15 seconds
        heartbeatInterval = setInterval(() => {
          if (!isClosing) {
            try {
              // Send comment as heartbeat (SSE comment format)
              controller.enqueue(encoder.encode(": heartbeat\n\n"));
            } catch {
              // Controller closed, stop heartbeat
              if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
                heartbeatInterval = null;
              }
            }
          }
        }, 15000);

        // Subscribe to generation events
        console.log(`[SSE ${generationId}] Subscribing to Redis channel...`);
        const unsubscribe = await subscribeToGeneration(subscriber, generationId, (event) => {
          console.log(`[SSE ${generationId}] Received event: ${event.type}`);
          if (isClosing) return;

          try {
            controller.enqueue(encoder.encode(formatSSE(event)));
            console.log(`[SSE ${generationId}] Forwarded event to client: ${event.type}`);

            // Close stream when generation completes or fails
            if (event.type === "generation_complete" || event.type === "generation_failed") {
              isClosing = true;
              console.log(`[SSE ${generationId}] Closing stream (${event.type})`);

              // Clean up after a short delay to ensure client receives the final event
              setTimeout(async () => {
                if (heartbeatInterval) {
                  clearInterval(heartbeatInterval);
                  heartbeatInterval = null;
                }
                unsubscribe();
                await closeConnection(subscriber);
                try {
                  controller.close();
                } catch {
                  // Already closed
                }
              }, 100);
            }
          } catch {
            // Client disconnected
            isClosing = true;
          }
        });
        console.log(`[SSE ${generationId}] Subscribed to channel`);

        // Handle client disconnect
        request.signal.addEventListener("abort", async () => {
          isClosing = true;
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
          }
          unsubscribe();
          await closeConnection(subscriber);
        });
      } catch (err) {
        console.error("SSE stream error:", err);
        isClosing = true;
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
        await closeConnection(subscriber);
        controller.error(err);
      }
    },

    async cancel() {
      isClosing = true;
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      await closeConnection(subscriber);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
