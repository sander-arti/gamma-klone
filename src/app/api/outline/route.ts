/**
 * POST /api/outline
 *
 * Generates an AI-powered outline for a presentation.
 * This is a synchronous endpoint (no queue) for quick outline generation.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPipeline, PipelineError } from "@/lib/ai/pipeline";
import { GenerationRequestSchema } from "@/lib/schemas/deck";

// Subset of GenerationRequest needed for outline generation
const OutlineRequestSchema = z.object({
  inputText: z.string().min(1).max(50000),
  textMode: z.enum(["generate", "condense", "preserve"]),
  language: z.string().default("no"),
  amount: z.enum(["brief", "medium", "detailed"]).default("medium"),
  tone: z.string().optional(),
  audience: z.string().optional(),
  numSlides: z.number().int().min(1).max(50).optional(),
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

    const parseResult = OutlineRequestSchema.safeParse(body);
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

    const outlineRequest = parseResult.data;

    // 2. Create pipeline and generate outline
    const pipeline = createPipeline();

    // Build a GenerationRequest-compatible object for the pipeline
    const generationRequest = GenerationRequestSchema.parse({
      inputText: outlineRequest.inputText,
      textMode: outlineRequest.textMode,
      language: outlineRequest.language,
      amount: outlineRequest.amount,
      tone: outlineRequest.tone,
      audience: outlineRequest.audience,
      numSlides: outlineRequest.numSlides,
    });

    const outline = await pipeline.generateOutline(generationRequest);

    // 3. Sanitize outline to ensure constraints are met
    // (defensive measure in case AI exceeds limits)
    const sanitizedOutline = {
      ...outline,
      slides: outline.slides.map(slide => ({
        ...slide,
        // Truncate hints to max 3 items
        hints: slide.hints?.slice(0, 3),
      })),
    };

    // 4. Return outline
    return NextResponse.json({ outline: sanitizedOutline });
  } catch (error) {
    console.error("Outline generation error:", error);

    if (error instanceof PipelineError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Outline generation failed",
        },
      },
      { status: 500 }
    );
  }
}
