/**
 * GenerationJob CRUD operations
 *
 * All operations enforce multi-tenant isolation via workspaceId filtering.
 */

import { prisma } from "./prisma";
import type { GenerationRequest } from "@/lib/schemas/deck";
import type { GenerationJob } from "@prisma/client";

// Types for job status
export type JobStatus = "queued" | "running" | "completed" | "failed";

// Input type for creating a generation job
export interface CreateJobInput {
  workspaceId: string;
  request: GenerationRequest;
  idempotencyKey?: string;
}

// Input type for updating job status
export interface UpdateJobStatusInput {
  status: JobStatus;
  progress?: number;
  errorCode?: string;
  errorMessage?: string;
}

// Input type for setting job result
export interface SetJobResultInput {
  deckId: string;
  viewUrl: string;
}

/**
 * Sanitize text to remove null bytes (PostgreSQL doesn't allow them in text columns)
 */
function sanitizeText(text: string): string {
  return text.replace(/\x00/g, "");
}

/**
 * Create a new generation job
 */
export async function createGenerationJob(input: CreateJobInput): Promise<GenerationJob> {
  const { workspaceId, request, idempotencyKey } = input;

  return prisma.generationJob.create({
    data: {
      workspaceId,
      inputText: sanitizeText(request.inputText),
      textMode: request.textMode,
      language: request.language ?? "no",
      tone: request.tone,
      audience: request.audience,
      amount: request.amount ?? "medium",
      numSlides: request.numSlides,
      themeId: request.themeId,
      imageMode: request.imageMode ?? "none",
      imageStyle: request.imageStyle,
      templateId: request.templateId,
      exportAs: request.exportAs ?? [],
      idempotencyKey,
      status: "queued",
      progress: 0,
    },
  });
}

/**
 * Get a generation job by ID (internal use, no workspace isolation)
 */
export async function getGenerationJob(id: string): Promise<GenerationJob | null> {
  return prisma.generationJob.findUnique({
    where: { id },
  });
}

/**
 * Get a generation job by ID with workspace isolation
 * Returns null if job doesn't exist or belongs to different workspace
 */
export async function getGenerationJobById(
  id: string,
  workspaceId: string
): Promise<GenerationJob | null> {
  return prisma.generationJob.findFirst({
    where: {
      id,
      workspaceId, // Multi-tenant isolation
    },
  });
}

/**
 * Get a generation job by idempotency key with workspace isolation
 */
export async function getJobByIdempotencyKey(
  idempotencyKey: string,
  workspaceId: string
): Promise<GenerationJob | null> {
  return prisma.generationJob.findFirst({
    where: {
      idempotencyKey,
      workspaceId, // Multi-tenant isolation
    },
  });
}

/**
 * Update job status, progress, and error information
 */
export async function updateJobStatus(
  id: string,
  input: UpdateJobStatusInput
): Promise<GenerationJob> {
  const { status, progress, errorCode, errorMessage } = input;

  const updateData: Record<string, unknown> = {
    status,
  };

  if (progress !== undefined) {
    updateData.progress = progress;
  }

  if (status === "running") {
    updateData.startedAt = new Date();
  }

  if (status === "completed" || status === "failed") {
    updateData.completedAt = new Date();
  }

  if (errorCode !== undefined) {
    updateData.errorCode = errorCode;
  }

  if (errorMessage !== undefined) {
    updateData.errorMessage = errorMessage;
  }

  return prisma.generationJob.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Set job result when generation completes successfully
 */
export async function setJobResult(id: string, input: SetJobResultInput): Promise<GenerationJob> {
  const { deckId, viewUrl } = input;

  return prisma.generationJob.update({
    where: { id },
    data: {
      deckId,
      viewUrl,
      status: "completed",
      progress: 100,
      completedAt: new Date(),
    },
  });
}

/**
 * Update job progress (for incremental progress updates during generation)
 */
export async function updateJobProgress(id: string, progress: number): Promise<GenerationJob> {
  return prisma.generationJob.update({
    where: { id },
    data: { progress },
  });
}

/**
 * Mark job as failed with error details
 */
export async function markJobFailed(
  id: string,
  errorCode: string,
  errorMessage: string
): Promise<GenerationJob> {
  return prisma.generationJob.update({
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
 * Set the deckId early (before generation completes)
 * This allows frontend to redirect to deck view during generation
 */
export async function setJobDeckId(id: string, deckId: string): Promise<GenerationJob> {
  return prisma.generationJob.update({
    where: { id },
    data: { deckId },
  });
}

/**
 * Get all jobs for a workspace (for dashboard/listing)
 */
export async function getJobsByWorkspace(
  workspaceId: string,
  options?: {
    status?: JobStatus;
    limit?: number;
    offset?: number;
  }
): Promise<GenerationJob[]> {
  const { status, limit = 20, offset = 0 } = options ?? {};

  return prisma.generationJob.findMany({
    where: {
      workspaceId,
      ...(status && { status }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}
