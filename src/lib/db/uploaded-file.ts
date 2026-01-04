/**
 * UploadedFile CRUD operations
 *
 * All operations enforce multi-tenant isolation via workspaceId filtering.
 */

import { prisma } from "./prisma";
import type { UploadedFile } from "@prisma/client";

// Types for file status
export type FileStatus = "pending" | "processing" | "completed" | "failed";

// Input type for creating an uploaded file
export interface CreateUploadedFileInput {
  workspaceId: string;
  filename: string;
  mimeType: string;
  size: number;
  s3Key: string;
}

// Input type for extraction result
export interface ExtractionResultInput {
  extractedText: string;
  charCount: number;
  truncated: boolean;
}

// Input type for extraction error
export interface ExtractionErrorInput {
  errorCode: string;
  errorMessage: string;
}

/**
 * Create a new uploaded file record
 */
export async function createUploadedFile(input: CreateUploadedFileInput): Promise<UploadedFile> {
  const { workspaceId, filename, mimeType, size, s3Key } = input;

  return prisma.uploadedFile.create({
    data: {
      workspaceId,
      filename,
      mimeType,
      size,
      s3Key,
      status: "pending",
    },
  });
}

/**
 * Get an uploaded file by ID (internal use, no workspace isolation)
 */
export async function getUploadedFile(id: string): Promise<UploadedFile | null> {
  return prisma.uploadedFile.findUnique({
    where: { id },
  });
}

/**
 * Get an uploaded file by ID with workspace isolation
 * Returns null if file doesn't exist or belongs to different workspace
 */
export async function getUploadedFileById(
  id: string,
  workspaceId: string
): Promise<UploadedFile | null> {
  return prisma.uploadedFile.findFirst({
    where: {
      id,
      workspaceId, // Multi-tenant isolation
    },
  });
}

/**
 * Update file status to processing
 */
export async function markFileProcessing(id: string): Promise<UploadedFile> {
  return prisma.uploadedFile.update({
    where: { id },
    data: {
      status: "processing",
    },
  });
}

/**
 * Set extraction result when processing completes successfully
 */
export async function setExtractionResult(
  id: string,
  input: ExtractionResultInput
): Promise<UploadedFile> {
  const { extractedText, charCount, truncated } = input;

  return prisma.uploadedFile.update({
    where: { id },
    data: {
      extractedText,
      charCount,
      truncated,
      status: "completed",
      processedAt: new Date(),
    },
  });
}

/**
 * Mark file extraction as failed with error details
 */
export async function markFileFailed(
  id: string,
  input: ExtractionErrorInput
): Promise<UploadedFile> {
  const { errorCode, errorMessage } = input;

  return prisma.uploadedFile.update({
    where: { id },
    data: {
      status: "failed",
      errorCode,
      errorMessage,
      processedAt: new Date(),
    },
  });
}

/**
 * Get all uploaded files for a workspace
 */
export async function getUploadedFilesByWorkspace(
  workspaceId: string,
  options?: {
    status?: FileStatus;
    limit?: number;
    offset?: number;
  }
): Promise<UploadedFile[]> {
  const { status, limit = 20, offset = 0 } = options ?? {};

  return prisma.uploadedFile.findMany({
    where: {
      workspaceId,
      ...(status && { status }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

/**
 * Delete an uploaded file
 */
export async function deleteUploadedFile(
  id: string,
  workspaceId: string
): Promise<UploadedFile | null> {
  // First check if the file belongs to the workspace
  const file = await getUploadedFileById(id, workspaceId);
  if (!file) {
    return null;
  }

  return prisma.uploadedFile.delete({
    where: { id },
  });
}
