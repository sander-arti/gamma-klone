/**
 * POST /api/upload/{id}/confirm
 *
 * Confirm that a file has been uploaded to S3.
 * Verifies the file exists, updates status, and queues extraction.
 */

import { NextRequest, NextResponse } from "next/server";
import { getUploadedFileById, markFileProcessing } from "@/lib/db/uploaded-file";
import { fileExists } from "@/lib/storage/s3-client";
import { addExtractionJob } from "@/lib/queue/extraction-queue";

// Default workspace ID for MVP (single-tenant)
const DEFAULT_WORKSPACE_ID = "ws_default";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // 1. Get the uploaded file record
    const file = await getUploadedFileById(id, DEFAULT_WORKSPACE_ID);
    if (!file) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Upload not found",
          },
        },
        { status: 404 }
      );
    }

    // 2. Check if already processed
    if (file.status !== "pending") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_STATE",
            message: `Upload already in state: ${file.status}`,
          },
        },
        { status: 400 }
      );
    }

    // 3. Verify file exists in S3
    const exists = await fileExists(file.s3Key);
    if (!exists) {
      return NextResponse.json(
        {
          error: {
            code: "FILE_NOT_FOUND",
            message: "File not found in storage. Upload may have expired.",
          },
        },
        { status: 400 }
      );
    }

    // 4. Update status to processing
    await markFileProcessing(file.id);

    // 5. Add extraction job to queue
    await addExtractionJob({
      uploadId: file.id,
      workspaceId: file.workspaceId,
      s3Key: file.s3Key,
      mimeType: file.mimeType,
    });

    return NextResponse.json({
      uploadId: file.id,
      status: "processing",
    });
  } catch (error) {
    console.error("Confirm error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Failed to confirm upload",
        },
      },
      { status: 500 }
    );
  }
}
