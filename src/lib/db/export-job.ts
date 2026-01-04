/**
 * ExportJob CRUD operations
 *
 * Manages PDF and PPTX export job records in the database.
 */

import { prisma } from "./prisma";
import type { ExportJob } from "@prisma/client";

// Export job status type
export type ExportJobStatus = "queued" | "running" | "completed" | "failed";

// Export format type
export type ExportFormat = "pdf" | "pptx";

// Input type for creating an export job
export interface CreateExportJobInput {
  deckId: string;
  format: ExportFormat;
}

// Input type for updating export job status
export interface UpdateExportJobStatusInput {
  status: ExportJobStatus;
  errorCode?: string;
  errorMessage?: string;
}

// Input type for setting export job result
export interface SetExportJobResultInput {
  fileUrl: string;
  expiresAt: Date;
}

/**
 * Create a new export job
 */
export async function createExportJob(input: CreateExportJobInput): Promise<ExportJob> {
  const { deckId, format } = input;

  return prisma.exportJob.create({
    data: {
      deckId,
      format,
      status: "queued",
    },
  });
}

/**
 * Get an export job by ID
 */
export async function getExportJobById(id: string): Promise<ExportJob | null> {
  return prisma.exportJob.findUnique({
    where: { id },
  });
}

/**
 * Get export jobs for a deck
 */
export async function getExportJobsByDeckId(
  deckId: string,
  format?: ExportFormat
): Promise<ExportJob[]> {
  return prisma.exportJob.findMany({
    where: {
      deckId,
      ...(format && { format }),
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get the latest export job for a deck and format
 */
export async function getLatestExportJob(
  deckId: string,
  format: ExportFormat
): Promise<ExportJob | null> {
  return prisma.exportJob.findFirst({
    where: {
      deckId,
      format,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get the latest completed export job for a deck and format
 * Useful for getting the current export URL
 */
export async function getLatestCompletedExport(
  deckId: string,
  format: ExportFormat
): Promise<ExportJob | null> {
  return prisma.exportJob.findFirst({
    where: {
      deckId,
      format,
      status: "completed",
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Update export job status
 */
export async function updateExportJobStatus(
  id: string,
  input: UpdateExportJobStatusInput
): Promise<ExportJob> {
  const { status, errorCode, errorMessage } = input;

  const updateData: Record<string, unknown> = {
    status,
  };

  if (status === "completed" || status === "failed") {
    updateData.completedAt = new Date();
  }

  if (errorCode !== undefined) {
    updateData.errorCode = errorCode;
  }

  if (errorMessage !== undefined) {
    updateData.errorMessage = errorMessage;
  }

  return prisma.exportJob.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Set export job result when export completes successfully
 */
export async function setExportJobResult(
  id: string,
  input: SetExportJobResultInput
): Promise<ExportJob> {
  const { fileUrl, expiresAt } = input;

  return prisma.exportJob.update({
    where: { id },
    data: {
      fileUrl,
      expiresAt,
      status: "completed",
      completedAt: new Date(),
    },
  });
}

/**
 * Mark export job as failed with error details
 */
export async function markExportJobFailed(
  id: string,
  errorCode: string,
  errorMessage: string
): Promise<ExportJob> {
  return prisma.exportJob.update({
    where: { id },
    data: {
      status: "failed",
      errorCode,
      errorMessage,
      completedAt: new Date(),
    },
  });
}

/**
 * Delete expired export jobs
 * Call this periodically to clean up old records
 */
export async function deleteExpiredExportJobs(): Promise<number> {
  const result = await prisma.exportJob.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}

/**
 * Get pending export jobs (for worker recovery)
 */
export async function getPendingExportJobs(limit: number = 10): Promise<ExportJob[]> {
  return prisma.exportJob.findMany({
    where: {
      status: {
        in: ["queued", "running"],
      },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}
