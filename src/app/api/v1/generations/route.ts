/**
 * POST /v1/generations
 *
 * Create a new generation job.
 */

import { NextRequest } from "next/server";
import { validateApiKey } from "@/lib/api/auth";
import { enforceRateLimit, getRateLimitHeaders } from "@/lib/api/rate-limit";
import { ApiError, errorResponse, successResponse, mapErrorToApiError } from "@/lib/api/errors";
import { GenerationRequestSchema } from "@/lib/schemas/deck";
import {
  createGenerationJob,
  getJobByIdempotencyKey,
} from "@/lib/db/generation-job";
import { addGenerationJob } from "@/lib/queue/generation-queue";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const auth = await validateApiKey(request);

    // 2. Rate limit
    const rateLimitResult = await enforceRateLimit(auth.apiKeyId);
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

    // 3. Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("INVALID_REQUEST", "Invalid JSON body");
    }

    const parseResult = GenerationRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(
        "INVALID_REQUEST",
        "Validation failed",
        parseResult.error.flatten().fieldErrors
      );
    }

    const generationRequest = parseResult.data;

    // 4. Check idempotency key
    const idempotencyKey = request.headers.get("Idempotency-Key");
    if (idempotencyKey) {
      const existingJob = await getJobByIdempotencyKey(
        idempotencyKey,
        auth.workspaceId
      );
      if (existingJob) {
        // Return existing job (idempotent response)
        const response = successResponse({
          generationId: existingJob.id,
          status: existingJob.status,
        });
        Object.entries(rateLimitHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }
    }

    // 5. Create job in database
    const job = await createGenerationJob({
      workspaceId: auth.workspaceId,
      request: generationRequest,
      idempotencyKey: idempotencyKey ?? undefined,
    });

    // 6. Add to queue
    await addGenerationJob({
      generationId: job.id,
      workspaceId: auth.workspaceId,
      request: generationRequest,
    });

    // 7. Return response
    const response = successResponse(
      {
        generationId: job.id,
        status: "queued" as const,
      },
      200
    );

    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    const apiError = mapErrorToApiError(error);
    return apiError.toResponse();
  }
}
