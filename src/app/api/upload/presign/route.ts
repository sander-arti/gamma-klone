/**
 * POST /api/upload/presign
 *
 * Generate a presigned URL for uploading a file to S3.
 * Creates a pending UploadedFile record in the database.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUploadedFile } from "@/lib/db/uploaded-file";
import {
  generateUploadPresignedUrl,
  generateUploadKey,
} from "@/lib/storage/s3-client";
import { validateFile, SUPPORTED_MIME_TYPES } from "@/lib/extraction";

// Default workspace ID for MVP (single-tenant)
const DEFAULT_WORKSPACE_ID = "ws_default";

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Presigned URL expiry: 15 minutes
const PRESIGN_EXPIRY_SECONDS = 15 * 60;

const PresignRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.enum(SUPPORTED_MIME_TYPES as unknown as [string, ...string[]]),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Invalid JSON body" } },
        { status: 400 }
      );
    }

    const parseResult = PresignRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "Validation failed",
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { filename, mimeType, size } = parseResult.data;

    // 2. Validate file (double-check)
    const validation = validateFile(mimeType, size, MAX_FILE_SIZE);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: {
            code: validation.errorCode,
            message: validation.error,
          },
        },
        { status: 400 }
      );
    }

    // 3. Create UploadedFile record
    const uploadedFile = await createUploadedFile({
      workspaceId: DEFAULT_WORKSPACE_ID,
      filename,
      mimeType,
      size,
      s3Key: "", // Will be set after we generate the key
    });

    // 4. Generate S3 key
    const s3Key = generateUploadKey(
      DEFAULT_WORKSPACE_ID,
      uploadedFile.id,
      filename
    );

    // 5. Generate presigned PUT URL
    const presignedUrl = await generateUploadPresignedUrl(
      s3Key,
      mimeType,
      PRESIGN_EXPIRY_SECONDS
    );

    // 6. Update the record with the S3 key
    const { prisma } = await import("@/lib/db/prisma");
    await prisma.uploadedFile.update({
      where: { id: uploadedFile.id },
      data: { s3Key },
    });

    // 7. Calculate expiry time
    const expiresAt = new Date(
      Date.now() + PRESIGN_EXPIRY_SECONDS * 1000
    ).toISOString();

    return NextResponse.json({
      uploadId: uploadedFile.id,
      presignedUrl,
      expiresAt,
    });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to generate presigned URL",
        },
      },
      { status: 500 }
    );
  }
}
