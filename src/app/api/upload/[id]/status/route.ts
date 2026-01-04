/**
 * GET /api/upload/{id}/status
 *
 * Server-Sent Events endpoint for real-time extraction status updates.
 * Subscribes to Redis Pub/Sub for extraction events.
 */

import { NextRequest } from "next/server";
import { getUploadedFileById, getUploadedFile } from "@/lib/db/uploaded-file";
import {
  createSubscriber,
  subscribeToExtraction,
  closeConnection,
  type ExtractionEvent,
} from "@/lib/streaming/extraction-pubsub";

// Default workspace ID for MVP (single-tenant)
const DEFAULT_WORKSPACE_ID = "ws_default";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;

  // 1. Verify the upload exists and belongs to workspace
  const file = await getUploadedFileById(id, DEFAULT_WORKSPACE_ID);
  if (!file) {
    return new Response(
      JSON.stringify({
        error: { code: "NOT_FOUND", message: "Upload not found" },
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 2. If already completed or failed, return result immediately
  if (file.status === "completed") {
    const encoder = new TextEncoder();
    const body = encoder.encode(
      `event: completed\ndata: ${JSON.stringify({
        status: "completed",
        extractedText: file.extractedText,
        charCount: file.charCount,
        truncated: file.truncated,
      })}\n\n`
    );

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  if (file.status === "failed") {
    const encoder = new TextEncoder();
    const body = encoder.encode(
      `event: failed\ndata: ${JSON.stringify({
        status: "failed",
        error: {
          code: file.errorCode,
          message: file.errorMessage,
        },
      })}\n\n`
    );

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // 3. Create SSE stream
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // 4. Set up Redis subscriber
  const subscriber = createSubscriber();

  const cleanup = async () => {
    try {
      await closeConnection(subscriber);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await writer.close();
    } catch {
      // Ignore close errors
    }
  };

  // 5. Handle client disconnect
  request.signal.addEventListener("abort", () => {
    cleanup();
  });

  // 6. Start streaming
  (async () => {
    try {
      // Connect to Redis
      await subscriber.connect();

      // Send initial status
      await writer.write(
        encoder.encode(
          `event: processing\ndata: ${JSON.stringify({
            status: "processing",
            message: "Ekstraherer tekst fra fil...",
          })}\n\n`
        )
      );

      // Subscribe to extraction events
      const unsubscribe = await subscribeToExtraction(
        subscriber,
        id,
        async (event: ExtractionEvent) => {
          try {
            const eventData = JSON.stringify({
              status: event.type,
              ...event.data,
            });

            await writer.write(
              encoder.encode(`event: ${event.type}\ndata: ${eventData}\n\n`)
            );

            // Close stream on completion or failure
            if (event.type === "completed" || event.type === "failed") {
              await cleanup();
            }
          } catch (err) {
            console.error("Error writing SSE event:", err);
          }
        }
      );

      // Timeout after 5 minutes
      const timeout = setTimeout(async () => {
        unsubscribe();
        await writer.write(
          encoder.encode(
            `event: timeout\ndata: ${JSON.stringify({
              status: "timeout",
              message: "Extraction timed out",
            })}\n\n`
          )
        );
        await cleanup();
      }, 5 * 60 * 1000);

      // Clean up timeout on abort
      request.signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        unsubscribe();
      });

      // Poll database for completion (in case we miss the Redis event)
      const pollInterval = setInterval(async () => {
        try {
          const updatedFile = await getUploadedFile(id);
          if (updatedFile?.status === "completed" || updatedFile?.status === "failed") {
            clearInterval(pollInterval);
            clearTimeout(timeout);
            unsubscribe();

            const eventType = updatedFile.status;
            const eventData = JSON.stringify({
              status: eventType,
              extractedText: updatedFile.extractedText,
              charCount: updatedFile.charCount,
              truncated: updatedFile.truncated,
              error: updatedFile.errorCode
                ? { code: updatedFile.errorCode, message: updatedFile.errorMessage }
                : undefined,
            });

            await writer.write(
              encoder.encode(`event: ${eventType}\ndata: ${eventData}\n\n`)
            );
            await cleanup();
          }
        } catch (err) {
          console.error("Error polling database:", err);
        }
      }, 2000);

      request.signal.addEventListener("abort", () => {
        clearInterval(pollInterval);
      });
    } catch (err) {
      console.error("SSE stream error:", err);
      await cleanup();
    }
  })();

  return new Response(stream.readable, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
