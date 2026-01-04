/**
 * GET /v1/generations/{id}
 *
 * Get generation job status.
 */

import { NextRequest } from "next/server";
import { validateApiKey } from "@/lib/api/auth";
import { errorResponse, successResponse, mapErrorToApiError } from "@/lib/api/errors";
import { getGenerationJobById } from "@/lib/db/generation-job";
import type { GenerationResponse } from "@/lib/schemas/deck";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate
    const auth = await validateApiKey(request);

    // 2. Get job ID from params
    const { id } = await context.params;

    // 3. Get job with workspace isolation
    const job = await getGenerationJobById(id, auth.workspaceId);

    // 4. Return 404 if not found (includes multi-tenant isolation)
    if (!job) {
      return errorResponse("NOT_FOUND", "Generation not found");
    }

    // 5. Build response based on status
    const response: GenerationResponse = {
      generationId: job.id,
      status: job.status as GenerationResponse["status"],
    };

    // Add progress if running
    if (job.status === "running") {
      response.progress = job.progress;
    }

    // Add result URLs if completed
    if (job.status === "completed") {
      if (job.viewUrl) {
        response.viewUrl = job.viewUrl;
      }

      // Include export URLs if available
      if (job.pdfUrl) {
        response.pdfUrl = job.pdfUrl;
      }
      if (job.pptxUrl) {
        response.pptxUrl = job.pptxUrl;
      }
      if (job.exportExpiresAt) {
        response.expiresAt = job.exportExpiresAt.toISOString();
      }
    }

    // Add error if failed
    if (job.status === "failed") {
      response.error = {
        code: job.errorCode ?? "INTERNAL_ERROR",
        message: job.errorMessage ?? "An error occurred during generation",
      };
    }

    return successResponse(response);
  } catch (error) {
    const apiError = mapErrorToApiError(error);
    return apiError.toResponse();
  }
}
