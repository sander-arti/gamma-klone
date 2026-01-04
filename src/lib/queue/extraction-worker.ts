/**
 * Extraction Worker
 *
 * BullMQ worker that processes file extraction jobs.
 * Downloads files from S3, extracts text content, and publishes events via Redis Pub/Sub.
 */

import { Worker, Job } from "bullmq";
import { createWorkerConnection } from "./redis";
import { EXTRACTION_QUEUE_NAME, type ExtractionJobData } from "./extraction-queue";
import {
  getUploadedFile,
  markFileProcessing,
  setExtractionResult,
  markFileFailed,
} from "@/lib/db/uploaded-file";
import { downloadFile } from "@/lib/storage/s3-client";
import { extractContent, isSupportedMimeType } from "@/lib/extraction";
import {
  createPublisher,
  publishExtractionEvent,
  closeConnection,
} from "@/lib/streaming/extraction-pubsub";
import type Redis from "ioredis";

/**
 * Process a single extraction job
 */
async function processExtractionJob(job: Job<ExtractionJobData>, publisher: Redis): Promise<void> {
  const { uploadId, s3Key, mimeType } = job.data;

  console.log(`[Extraction] Processing job ${uploadId} for file ${s3Key}`);

  // Check if file record exists
  const file = await getUploadedFile(uploadId);
  if (!file) {
    throw new Error(`Upload record not found: ${uploadId}`);
  }

  // Mark as processing
  await markFileProcessing(uploadId);

  // Publish processing event
  await publishExtractionEvent(publisher, uploadId, {
    type: "processing",
    uploadId,
    timestamp: Date.now(),
    data: { message: "Ekstraherer tekst fra fil..." },
  });

  try {
    // Validate MIME type
    if (!isSupportedMimeType(mimeType)) {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    // Download file from S3
    console.log(`[Extraction] Downloading file from S3: ${s3Key}`);
    const buffer = await downloadFile(s3Key);

    // Extract content
    console.log(`[Extraction] Extracting content from ${mimeType} file`);
    const result = await extractContent(buffer, mimeType);

    // Save extraction result
    await setExtractionResult(uploadId, {
      extractedText: result.text,
      charCount: result.charCount,
      truncated: result.truncated,
    });

    // Publish completed event
    await publishExtractionEvent(publisher, uploadId, {
      type: "completed",
      uploadId,
      timestamp: Date.now(),
      data: {
        extractedText: result.text,
        charCount: result.charCount,
        truncated: result.truncated,
        metadata: result.metadata,
      },
    });

    console.log(`[Extraction] Successfully extracted ${result.charCount} characters from ${s3Key}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown extraction error";
    const errorCode = getErrorCode(error);

    console.error(`[Extraction] Failed to extract ${s3Key}:`, errorMessage);

    // Mark file as failed
    await markFileFailed(uploadId, {
      errorCode,
      errorMessage,
    });

    // Publish failed event
    await publishExtractionEvent(publisher, uploadId, {
      type: "failed",
      uploadId,
      timestamp: Date.now(),
      data: {
        error: {
          code: errorCode,
          message: errorMessage,
        },
      },
    });

    throw error;
  }
}

/**
 * Map error to error code
 */
function getErrorCode(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("not found") || message.includes("nosuchkey")) {
      return "FILE_NOT_FOUND";
    }
    if (message.includes("unsupported mime")) {
      return "INVALID_FILE_TYPE";
    }
    if (message.includes("timeout")) {
      return "EXTRACTION_TIMEOUT";
    }
  }

  return "EXTRACTION_ERROR";
}

/**
 * Create the extraction worker
 */
export function createExtractionWorker(): Worker<ExtractionJobData> {
  const connection = createWorkerConnection();
  const publisher = createPublisher();

  // Connect publisher
  publisher.connect().catch((err) => {
    console.error("Failed to connect Redis publisher:", err);
  });

  const worker = new Worker<ExtractionJobData>(
    EXTRACTION_QUEUE_NAME,
    async (job) => {
      await processExtractionJob(job, publisher);
    },
    {
      connection,
      concurrency: parseInt(process.env.EXTRACTION_WORKER_CONCURRENCY ?? "2", 10),
      // Lock settings for file processing (large files can take a while)
      lockDuration: 180000, // 3 minutes
      lockRenewTime: 30000, // 30 seconds
      stalledInterval: 60000, // 1 minute
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Extraction] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Extraction] Job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("[Extraction] Worker error:", err);
  });

  // Store publisher reference for shutdown
  (worker as Worker<ExtractionJobData> & { publisher?: Redis }).publisher = publisher;

  return worker;
}

/**
 * Shutdown the worker gracefully
 */
export async function shutdownExtractionWorker(worker: Worker<ExtractionJobData>): Promise<void> {
  console.log("[Extraction] Shutting down worker...");

  // Close publisher if attached
  const workerWithPublisher = worker as Worker<ExtractionJobData> & {
    publisher?: Redis;
  };
  if (workerWithPublisher.publisher) {
    await closeConnection(workerWithPublisher.publisher);
  }

  await worker.close();
  console.log("[Extraction] Worker shutdown complete");
}
