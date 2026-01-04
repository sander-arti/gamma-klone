/**
 * POST /api/generations
 *
 * Internal endpoint for frontend wizard to create generation jobs.
 * Uses default workspace (no API key required for internal use).
 */

import { NextRequest, NextResponse } from "next/server";
import { GenerationRequestSchema } from "@/lib/schemas/deck";
import {
  createGenerationJob,
} from "@/lib/db/generation-job";
import { addGenerationJob } from "@/lib/queue/generation-queue";

// Default workspace ID for MVP (single-tenant)
const DEFAULT_WORKSPACE_ID = "ws_default";

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

    const parseResult = GenerationRequestSchema.safeParse(body);
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

    const generationRequest = parseResult.data;

    // 2. Create job in database
    const job = await createGenerationJob({
      workspaceId: DEFAULT_WORKSPACE_ID,
      request: generationRequest,
    });

    // 3. Add to queue
    await addGenerationJob({
      generationId: job.id,
      workspaceId: DEFAULT_WORKSPACE_ID,
      request: generationRequest,
    });

    // 4. Return response
    return NextResponse.json({
      generationId: job.id,
      status: "queued",
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Generation failed",
        },
      },
      { status: 500 }
    );
  }
}
