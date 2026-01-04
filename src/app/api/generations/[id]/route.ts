/**
 * GET /api/generations/[id]
 *
 * Internal endpoint to get generation job status.
 */

import { NextRequest, NextResponse } from "next/server";
import { getGenerationJob } from "@/lib/db/generation-job";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const job = await getGenerationJob(id);

    if (!job) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Generation not found" } },
        { status: 404 }
      );
    }

    // Build response based on status
    const response: {
      generationId: string;
      status: string;
      progress?: number;
      deckId?: string; // Added: return deckId for live redirect
      viewUrl?: string;
      error?: { code: string; message: string };
    } = {
      generationId: job.id,
      status: job.status,
    };

    // Add progress if available
    if (job.progress !== null) {
      response.progress = job.progress;
    }

    // Add deckId if available (for live redirect during generation)
    if (job.deckId) {
      response.deckId = job.deckId;
    }

    // Add viewUrl if completed
    if (job.status === "completed" && job.deckId) {
      response.viewUrl = `/deck/${job.deckId}`;
    }

    // Add error if failed
    if (job.status === "failed" && job.errorCode) {
      response.error = {
        code: job.errorCode,
        message: job.errorMessage ?? "Generation failed",
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get generation error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get generation status",
        },
      },
      { status: 500 }
    );
  }
}
