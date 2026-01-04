/**
 * Extraction Queue
 *
 * BullMQ queue for asynchronous file content extraction jobs.
 */

import { Queue } from "bullmq";
import { getRedisConnection } from "./redis";

/**
 * Data structure for extraction jobs in the queue
 */
export interface ExtractionJobData {
  uploadId: string;
  workspaceId: string;
  s3Key: string;
  mimeType: string;
}

/**
 * Queue name constant
 */
export const EXTRACTION_QUEUE_NAME = "extraction";

let extractionQueue: Queue<ExtractionJobData> | null = null;

/**
 * Get the extraction queue instance (singleton)
 */
export function getExtractionQueue(): Queue<ExtractionJobData> {
  if (extractionQueue) {
    return extractionQueue;
  }

  extractionQueue = new Queue<ExtractionJobData>(EXTRACTION_QUEUE_NAME, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: {
        age: 24 * 60 * 60, // Keep completed jobs for 24 hours
        count: 500,
      },
      removeOnFail: {
        age: 7 * 24 * 60 * 60, // Keep failed jobs for 7 days
      },
    },
  });

  return extractionQueue;
}

/**
 * Add an extraction job to the queue
 */
export async function addExtractionJob(data: ExtractionJobData): Promise<string> {
  const queue = getExtractionQueue();

  const job = await queue.add(
    "extract", // Job name
    data,
    {
      jobId: data.uploadId, // Use uploadId as job ID for easy lookup
    }
  );

  return job.id ?? data.uploadId;
}

/**
 * Get job status from the queue
 */
export async function getExtractionJobStatus(jobId: string): Promise<{
  state: string;
  failedReason?: string;
} | null> {
  const queue = getExtractionQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();

  return {
    state,
    failedReason: job.failedReason,
  };
}

/**
 * Close the queue (for graceful shutdown)
 */
export async function closeExtractionQueue(): Promise<void> {
  if (extractionQueue) {
    await extractionQueue.close();
    extractionQueue = null;
  }
}
