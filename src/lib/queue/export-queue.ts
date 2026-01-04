/**
 * Export Queue
 *
 * BullMQ queue for asynchronous PDF and PPTX export jobs.
 * Separate from generation queue for independent scaling.
 */

import { Queue } from "bullmq";
import { getRedisConnection } from "./redis";
import type { ThemeId, BrandKitOverrides } from "@/lib/themes";

/**
 * Supported export formats
 */
export type ExportFormat = "pdf" | "pptx";

/**
 * Data structure for export jobs in the queue
 */
export interface ExportJobData {
  exportJobId: string;
  generationJobId: string;
  deckId: string;
  format: ExportFormat;
  themeId: ThemeId;
  brandKit?: BrandKitOverrides;
}

/**
 * Queue name constant
 */
export const EXPORT_QUEUE_NAME = "export";

let exportQueue: Queue<ExportJobData> | null = null;

/**
 * Get the export queue instance (singleton)
 */
export function getExportQueue(): Queue<ExportJobData> {
  if (exportQueue) {
    return exportQueue;
  }

  exportQueue = new Queue<ExportJobData>(EXPORT_QUEUE_NAME, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000, // Longer initial delay for resource-intensive exports
      },
      removeOnComplete: {
        age: 24 * 60 * 60, // Keep completed jobs for 24 hours
        count: 500, // Keep max 500 completed export jobs
      },
      removeOnFail: {
        age: 7 * 24 * 60 * 60, // Keep failed jobs for 7 days
      },
    },
  });

  return exportQueue;
}

/**
 * Add an export job to the queue
 *
 * @param data - Export job data
 * @returns The job ID
 */
export async function addExportJob(data: ExportJobData): Promise<string> {
  const queue = getExportQueue();

  const job = await queue.add(
    `export-${data.format}`, // Job name includes format
    data,
    {
      jobId: data.exportJobId, // Use exportJobId as job ID for easy lookup
      priority: data.format === "pdf" ? 1 : 2, // PDF has higher priority (faster)
    }
  );

  return job.id ?? data.exportJobId;
}

/**
 * Get export job status from the queue
 *
 * @param jobId - The export job ID
 * @returns Job state, progress, and any error
 */
export async function getExportJobStatus(jobId: string): Promise<{
  state: string;
  progress: number;
  failedReason?: string;
} | null> {
  const queue = getExportQueue();
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
 * Close the export queue (for graceful shutdown)
 */
export async function closeExportQueue(): Promise<void> {
  if (exportQueue) {
    await exportQueue.close();
    exportQueue = null;
  }
}
