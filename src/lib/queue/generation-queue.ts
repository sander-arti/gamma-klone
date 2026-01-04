/**
 * Generation Queue
 *
 * BullMQ queue for asynchronous presentation generation jobs.
 */

import { Queue } from "bullmq";
import { getRedisConnection } from "./redis";
import type { GenerationRequest } from "@/lib/schemas/deck";

/**
 * Data structure for generation jobs in the queue
 */
export interface GenerationJobData {
  generationId: string;
  workspaceId: string;
  request: GenerationRequest;
}

/**
 * Queue name constant
 */
export const GENERATION_QUEUE_NAME = "generation";

let generationQueue: Queue<GenerationJobData> | null = null;

/**
 * Get the generation queue instance (singleton)
 */
export function getGenerationQueue(): Queue<GenerationJobData> {
  if (generationQueue) {
    return generationQueue;
  }

  generationQueue = new Queue<GenerationJobData>(GENERATION_QUEUE_NAME, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: {
        age: 24 * 60 * 60, // Keep completed jobs for 24 hours
        count: 1000, // Keep max 1000 completed jobs
      },
      removeOnFail: {
        age: 7 * 24 * 60 * 60, // Keep failed jobs for 7 days
      },
    },
  });

  return generationQueue;
}

/**
 * Add a generation job to the queue
 */
export async function addGenerationJob(data: GenerationJobData): Promise<string> {
  const queue = getGenerationQueue();

  const job = await queue.add(
    "generate", // Job name
    data,
    {
      jobId: data.generationId, // Use generationId as job ID for easy lookup
    }
  );

  return job.id ?? data.generationId;
}

/**
 * Get job status from the queue
 */
export async function getQueueJobStatus(jobId: string): Promise<{
  state: string;
  progress: number;
  failedReason?: string;
} | null> {
  const queue = getGenerationQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = typeof job.progress === "number" ? job.progress : 0;

  return {
    state,
    progress,
    failedReason: job.failedReason,
  };
}

/**
 * Close the queue (for graceful shutdown)
 */
export async function closeGenerationQueue(): Promise<void> {
  if (generationQueue) {
    await generationQueue.close();
    generationQueue = null;
  }
}
