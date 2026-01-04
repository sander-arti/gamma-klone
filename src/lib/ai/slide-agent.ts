/**
 * Slide Transform Agent
 *
 * AI agent for transforming slides based on natural language instructions.
 * Supports streaming for real-time feedback.
 */

import { z } from "zod";
import type { Slide } from "@/lib/schemas/slide";
import { SlideSchema } from "@/lib/schemas/slide";
import type { LLMClient, StreamingCallback } from "./llm-client";
import { getLLMClient, LLMError } from "./llm-client";
import {
  buildTransformSystemPrompt,
  buildTransformUserPrompt,
  getTransformInstruction,
  type TransformationType,
} from "./prompts/slide-transform";
import { assignLayoutVariant } from "./layout";
import { getSlideViolations } from "./edit-actions";

// ============================================================================
// Types
// ============================================================================

/**
 * Request for slide transformation
 */
export interface SlideTransformRequest {
  /** The slide to transform */
  slide: Slide;
  /** Natural language instruction for transformation */
  instruction: string;
  /** Optional context for better results */
  context?: {
    deckTitle?: string;
    previousSlides?: Slide[];
    nextSlides?: Slide[];
  };
}

/**
 * Description of a change made during transformation
 */
export interface ChangeDescription {
  blockIndex: number;
  field: string;
  oldValue: string;
  newValue: string;
}

/**
 * Result of a slide transformation
 */
export interface SlideTransformResult {
  /** The transformed slide */
  slide: Slide;
  /** List of changes made */
  changes: ChangeDescription[];
  /** Human-readable explanation of what was done */
  explanation: string;
}

/**
 * Streaming callbacks for transformation
 */
export interface TransformStreamingCallback {
  /** Called when partial result is available */
  onPartial?: (partial: Partial<SlideTransformResult>) => void;
  /** Called when transformation completes */
  onComplete?: (result: SlideTransformResult) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Called for raw token streaming */
  onToken?: (token: string) => void;
}

// ============================================================================
// Schema for LLM Response
// ============================================================================

const ChangeDescriptionSchema = z.object({
  blockIndex: z.number(),
  field: z.string(),
  oldValue: z.string(),
  newValue: z.string(),
});

const TransformResultSchema = z.object({
  slide: SlideSchema,
  changes: z.array(ChangeDescriptionSchema),
  explanation: z.string(),
});

// ============================================================================
// Agent
// ============================================================================

/**
 * Agent for AI-powered slide transformations
 */
export class SlideTransformAgent {
  private llmClient: LLMClient;
  private maxRepairAttempts: number;

  constructor(options?: { llmClient?: LLMClient; maxRepairAttempts?: number }) {
    this.llmClient = options?.llmClient ?? getLLMClient();
    this.maxRepairAttempts = options?.maxRepairAttempts ?? 2;
  }

  /**
   * Transform a slide based on natural language instruction
   */
  async transform(
    request: SlideTransformRequest,
    callbacks?: TransformStreamingCallback
  ): Promise<SlideTransformResult> {
    const { slide, instruction, context } = request;

    // Build prompts
    const systemPrompt = buildTransformSystemPrompt(slide.type);
    let userPrompt = buildTransformUserPrompt(slide, instruction);

    // Add context if provided
    if (context) {
      const contextParts: string[] = [];
      if (context.deckTitle) {
        contextParts.push(`Presentasjonstittel: "${context.deckTitle}"`);
      }
      if (context.previousSlides?.length) {
        contextParts.push(
          `Forrige slide-titler: ${context.previousSlides
            .map((s) => s.blocks.find((b) => b.kind === "title")?.text)
            .filter(Boolean)
            .join(", ")}`
        );
      }
      if (contextParts.length > 0) {
        userPrompt = `Kontekst:\n${contextParts.join("\n")}\n\n${userPrompt}`;
      }
    }

    try {
      let result: SlideTransformResult;

      if (callbacks?.onToken || callbacks?.onPartial) {
        // Use streaming
        const streamingCallbacks: StreamingCallback = {
          onToken: callbacks.onToken,
          onPartialJSON: (partial) => {
            try {
              // Try to extract partial result
              const p = partial as Partial<z.infer<typeof TransformResultSchema>>;
              if (p && typeof p === "object") {
                callbacks.onPartial?.({
                  slide: p.slide as Slide | undefined,
                  changes: p.changes as ChangeDescription[] | undefined,
                  explanation: p.explanation,
                });
              }
            } catch {
              // Ignore partial parsing errors
            }
          },
          onComplete: (data) => {
            // Will be handled after generateJSONStreaming returns
          },
          onError: callbacks.onError,
        };

        result = await this.llmClient.generateJSONStreaming(
          systemPrompt,
          userPrompt,
          TransformResultSchema,
          streamingCallbacks
        );
      } else {
        // Non-streaming
        result = await this.llmClient.generateJSON(
          systemPrompt,
          userPrompt,
          TransformResultSchema
        );
      }

      // Post-process result
      const processedResult = await this.postProcessResult(result, slide);

      // Notify completion
      callbacks?.onComplete?.(processedResult);

      return processedResult;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callbacks?.onError?.(err);
      throw error;
    }
  }

  /**
   * Post-process transformation result
   * - Assign layout variant
   * - Validate constraints
   * - Attempt repair if needed
   */
  private async postProcessResult(
    result: SlideTransformResult,
    originalSlide: Slide
  ): Promise<SlideTransformResult> {
    let slide = result.slide;

    // Ensure slide type is preserved
    if (slide.type !== originalSlide.type) {
      slide = { ...slide, type: originalSlide.type };
    }

    // Assign layout variant
    slide = {
      ...slide,
      layoutVariant: assignLayoutVariant(slide),
    };

    // Check for constraint violations
    const violations = getSlideViolations(slide);

    if (violations.length > 0 && this.maxRepairAttempts > 0) {
      // Attempt to repair
      const { aiShortenSlide } = await import("./edit-actions");
      const repairResult = await aiShortenSlide(slide, violations, {
        maxAttempts: this.maxRepairAttempts,
      });

      if (repairResult.success && repairResult.data) {
        slide = repairResult.data;
        // Update explanation to note repair
        result.explanation += " (automatisk tilpasset til constraints)";
      }
    }

    return {
      ...result,
      slide,
    };
  }

  // ============================================================================
  // Convenience Methods
  // ============================================================================

  /**
   * Simplify slide content - make it shorter and more concise
   */
  async simplify(
    slide: Slide,
    callbacks?: TransformStreamingCallback
  ): Promise<SlideTransformResult> {
    return this.transform(
      {
        slide,
        instruction: getTransformInstruction("simplify"),
      },
      callbacks
    );
  }

  /**
   * Expand slide content - add more details and context
   */
  async expand(
    slide: Slide,
    callbacks?: TransformStreamingCallback
  ): Promise<SlideTransformResult> {
    return this.transform(
      {
        slide,
        instruction: getTransformInstruction("expand"),
      },
      callbacks
    );
  }

  /**
   * Make language more professional/formal
   */
  async makeProfessional(
    slide: Slide,
    callbacks?: TransformStreamingCallback
  ): Promise<SlideTransformResult> {
    return this.transform(
      {
        slide,
        instruction: getTransformInstruction("professional"),
      },
      callbacks
    );
  }

  /**
   * Make language more casual/informal
   */
  async makeCasual(
    slide: Slide,
    callbacks?: TransformStreamingCallback
  ): Promise<SlideTransformResult> {
    return this.transform(
      {
        slide,
        instruction: getTransformInstruction("casual"),
      },
      callbacks
    );
  }

  /**
   * Make content more visual - convert text to bullets, highlight stats
   */
  async makeVisual(
    slide: Slide,
    callbacks?: TransformStreamingCallback
  ): Promise<SlideTransformResult> {
    return this.transform(
      {
        slide,
        instruction: getTransformInstruction("visualize"),
      },
      callbacks
    );
  }

  /**
   * Translate slide to English
   */
  async translateToEnglish(
    slide: Slide,
    callbacks?: TransformStreamingCallback
  ): Promise<SlideTransformResult> {
    return this.transform(
      {
        slide,
        instruction: getTransformInstruction("translate_en"),
      },
      callbacks
    );
  }

  /**
   * Translate slide to Norwegian
   */
  async translateToNorwegian(
    slide: Slide,
    callbacks?: TransformStreamingCallback
  ): Promise<SlideTransformResult> {
    return this.transform(
      {
        slide,
        instruction: getTransformInstruction("translate_no"),
      },
      callbacks
    );
  }

  /**
   * Apply a predefined transformation type
   */
  async applyTransformation(
    slide: Slide,
    type: TransformationType,
    callbacks?: TransformStreamingCallback
  ): Promise<SlideTransformResult> {
    return this.transform(
      {
        slide,
        instruction: getTransformInstruction(type),
      },
      callbacks
    );
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Get default slide transform agent
 */
export function getSlideTransformAgent(): SlideTransformAgent {
  return new SlideTransformAgent();
}

// ============================================================================
// Static Helper for API Routes
// ============================================================================

/**
 * Server-side AI transformation helper
 * Used by API routes to avoid client-side instantiation issues
 */
export async function transformSlideServer(
  slide: Slide,
  instruction: string,
  context?: { deckTitle?: string }
): Promise<{
  success: boolean;
  data?: SlideTransformResult;
  error?: string;
}> {
  try {
    const agent = new SlideTransformAgent();
    const result = await agent.transform({
      slide,
      instruction,
      context,
    });
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof LLMError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Ukjent feil under AI-transformasjon";
    console.error("transformSlideServer error:", error);
    return { success: false, error: message };
  }
}
