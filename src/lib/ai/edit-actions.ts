/**
 * AI Edit Actions
 *
 * Utility functions for AI-driven slide editing operations.
 * Used by the editor for "Kort ned" (shorten) and "Del i to" (split) actions.
 */

import { z } from "zod";
import type { Slide } from "@/lib/schemas/slide";
import { SlideSchema } from "@/lib/schemas/slide";
import type { ConstraintViolation as ValidationViolation } from "@/lib/validation/constraints";
import type { ConstraintViolation as EditorViolation } from "@/lib/editor/types";
import { getLLMClient, LLMError } from "./llm-client";
import {
  buildRepairSystemPrompt,
  buildRepairUserPrompt,
  buildSplitSystemPrompt,
  buildSplitUserPrompt,
} from "./prompts/repair";
import { assignLayoutVariant } from "./layout";
import { validateSlideConstraints } from "@/lib/validation/constraints";
import { validateBlock, BLOCK_CONSTRAINTS } from "@/lib/editor/constraints";

// ============================================================================
// Types
// ============================================================================

export interface AIEditResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AIEditOptions {
  /** Maximum attempts for the operation */
  maxAttempts?: number;
}

// ============================================================================
// Violation Conversion
// ============================================================================

/**
 * Convert editor violation format to AI validation format
 */
export function toValidationViolation(v: EditorViolation): ValidationViolation {
  return {
    field: v.blockId,
    message: v.message,
    current: v.current,
    limit: v.max,
    action: v.type === "max_items" || v.type === "max_rows" ? "split" : "shorten",
  };
}

/**
 * Get violations for a slide by validating its content
 * Uses validateBlock to check ALL block types including newer ones
 * (numbered_card, icon_card, stat_block, timeline_step)
 */
export function getSlideViolations(slide: Slide): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  // Check each block using the comprehensive validateBlock function
  slide.blocks.forEach((block, blockIndex) => {
    const blockViolations = validateBlock(block, 0, blockIndex);

    // Convert editor violations to validation violation format
    for (const v of blockViolations) {
      violations.push({
        field: `block-${blockIndex}-${block.kind}`,
        message: v.message,
        current: v.current,
        limit: v.max,
        action: v.type === "max_items" || v.type === "max_rows" ? "split" : "shorten",
      });
    }
  });

  // Also run the original slide-type-specific validation for broader checks
  const content: {
    title?: string;
    subtitle?: string;
    text?: string;
    bullets?: string[];
    columns?: string[];
    items?: string[];
    tableRows?: string[][];
  } = {};

  for (const block of slide.blocks) {
    switch (block.kind) {
      case "title":
        if (!content.title) {
          content.title = block.text ?? "";
        } else {
          content.subtitle = block.text ?? "";
        }
        break;
      case "text":
        content.text = block.text ?? "";
        break;
      case "bullets":
        content.bullets = block.items ?? [];
        break;
      case "callout":
        content.text = block.text ?? "";
        break;
      case "table":
        content.tableRows = block.rows ?? [];
        break;
    }
  }

  // Add slide-type-specific violations (but avoid duplicates)
  const slideViolations = validateSlideConstraints(slide.type, content);
  for (const v of slideViolations) {
    // Only add if not already captured by block validation
    if (!violations.some((existing) => existing.message === v.message)) {
      violations.push(v);
    }
  }

  return violations;
}

// ============================================================================
// AI Actions
// ============================================================================

/**
 * Shorten a slide's content to fit within constraints.
 * Uses AI to intelligently reduce text while preserving meaning.
 */
export async function aiShortenSlide(
  slide: Slide,
  violations?: ValidationViolation[],
  options: AIEditOptions = {}
): Promise<AIEditResult<Slide>> {
  const llm = getLLMClient();
  const maxAttempts = options.maxAttempts ?? 2;

  // Get violations if not provided
  const slideViolations = violations ?? getSlideViolations(slide);

  // Filter to only shortening violations
  const shortenViolations = slideViolations.filter((v) => v.action === "shorten");

  if (shortenViolations.length === 0) {
    // No violations to fix, return original
    return { success: true, data: slide };
  }

  let lastError: string | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const systemPrompt = buildRepairSystemPrompt(shortenViolations);
      const userPrompt = buildRepairUserPrompt(slide);

      const repaired = await llm.generateJSON(systemPrompt, userPrompt, SlideSchema);

      // Assign layout variant
      const repairedWithLayout = {
        ...repaired,
        layoutVariant: assignLayoutVariant(repaired),
      };

      // Verify violations are fixed
      const remainingViolations = getSlideViolations(repairedWithLayout);
      const stillHasShortenViolations = remainingViolations.some((v) => v.action === "shorten");

      if (!stillHasShortenViolations) {
        return { success: true, data: repairedWithLayout };
      }

      // Continue trying
      lastError = `Still has ${remainingViolations.length} violations after repair`;
    } catch (error) {
      if (error instanceof LLMError) {
        lastError = error.message;
      } else {
        lastError = "AI repair failed";
      }
    }
  }

  return {
    success: false,
    error: lastError ?? "Could not shorten slide after multiple attempts",
  };
}

/**
 * Split a slide into multiple slides.
 * Uses AI to intelligently distribute content across 2-3 slides.
 */
export async function aiSplitSlide(
  slide: Slide,
  violations?: ValidationViolation[],
  options: AIEditOptions = {}
): Promise<AIEditResult<Slide[]>> {
  const llm = getLLMClient();
  const maxAttempts = options.maxAttempts ?? 2;

  // Get violations if not provided
  const slideViolations = violations ?? getSlideViolations(slide);

  // Get original title for the split prompt
  const titleBlock = slide.blocks.find((b) => b.kind === "title");
  const originalTitle = titleBlock?.text ?? "Slide";

  let lastError: string | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const systemPrompt = buildSplitSystemPrompt(originalTitle);
      const userPrompt = buildSplitUserPrompt(slide, slideViolations);

      // Schema for split result
      const SplitResultSchema = z.object({
        slides: z.array(SlideSchema).min(2).max(4),
      });

      const result = await llm.generateJSON(systemPrompt, userPrompt, SplitResultSchema);

      // Assign layout variants to all split slides
      const slidesWithLayout = result.slides.map((s) => ({
        ...s,
        layoutVariant: assignLayoutVariant(s),
      }));

      // Verify each slide is valid
      let allValid = true;
      for (const splitSlide of slidesWithLayout) {
        const violations = getSlideViolations(splitSlide);
        if (violations.length > 0) {
          allValid = false;
          break;
        }
      }

      if (allValid) {
        return { success: true, data: slidesWithLayout };
      }

      lastError = "Split slides still have violations";
    } catch (error) {
      if (error instanceof LLMError) {
        lastError = error.message;
      } else {
        lastError = "AI split failed";
      }
    }
  }

  return {
    success: false,
    error: lastError ?? "Could not split slide after multiple attempts",
  };
}

/**
 * Automatically repair a slide - decides whether to shorten or split based on violations.
 */
export async function aiRepairSlide(
  slide: Slide,
  options: AIEditOptions = {}
): Promise<AIEditResult<Slide[]>> {
  const violations = getSlideViolations(slide);

  if (violations.length === 0) {
    return { success: true, data: [slide] };
  }

  // Decide: split if many violations or explicit split action
  const shouldSplit = violations.some((v) => v.action === "split") || violations.length >= 3;

  if (shouldSplit) {
    return aiSplitSlide(slide, violations, options);
  }

  // Try shortening
  const shortenResult = await aiShortenSlide(slide, violations, options);
  if (shortenResult.success && shortenResult.data) {
    return { success: true, data: [shortenResult.data] };
  }

  // If shortening failed, try split as fallback
  return aiSplitSlide(slide, violations, options);
}
