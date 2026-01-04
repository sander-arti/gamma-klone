/**
 * Export Job Status API
 *
 * GET /api/decks/[id]/export/[jobId] - Get export job status
 */

import { NextRequest, NextResponse } from "next/server";
import { getExportJobById } from "@/lib/db/export-job";

// ============================================================================
// GET /api/decks/[id]/export/[jobId] - Get export job status
// ============================================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  try {
    const { id, jobId } = await params;

    // Get export job from database
    const exportJob = await getExportJobById(jobId);

    if (!exportJob) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Eksportjobb ikke funnet" } },
        { status: 404 }
      );
    }

    // Verify the job belongs to the specified deck
    if (exportJob.deckId !== id) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Eksportjobb ikke funnet" } },
        { status: 404 }
      );
    }

    // Build response based on status
    const response: Record<string, unknown> = {
      status: exportJob.status,
      format: exportJob.format,
      createdAt: exportJob.createdAt.toISOString(),
    };

    if (exportJob.status === "completed" && exportJob.fileUrl) {
      response.fileUrl = exportJob.fileUrl;
      response.expiresAt = exportJob.expiresAt?.toISOString();
    }

    if (exportJob.status === "failed") {
      response.error = {
        code: exportJob.errorCode ?? "EXPORT_ERROR",
        message: exportJob.errorMessage ?? "Eksporten feilet",
      };
    }

    if (exportJob.completedAt) {
      response.completedAt = exportJob.completedAt.toISOString();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/decks/[id]/export/[jobId] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Kunne ikke hente eksportstatus" } },
      { status: 500 }
    );
  }
}
