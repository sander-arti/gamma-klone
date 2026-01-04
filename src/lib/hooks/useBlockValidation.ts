/**
 * useBlockValidation Hook
 *
 * Provides real-time validation for block content.
 * Returns violations, approaching status, and remaining characters.
 */

import { useMemo } from "react";
import type { Block } from "@/lib/schemas/block";
import type { ConstraintViolation } from "@/lib/editor/types";
import {
  BLOCK_CONSTRAINTS,
  validateBlock,
  isApproachingLimit,
  getRemainingChars,
  createBlockId,
} from "@/lib/editor/constraints";

// ============================================================================
// Types
// ============================================================================

export interface BlockValidationResult {
  /** List of constraint violations */
  violations: ConstraintViolation[];
  /** Whether block is approaching limit (>80%) */
  isApproaching: boolean;
  /** Characters remaining (for text-based blocks) */
  remaining: number;
  /** Maximum allowed value */
  max: number;
  /** Current usage value */
  current: number;
  /** Usage percentage (0-100+) */
  percentage: number;
  /** Whether block exceeds limit */
  exceedsLimit: boolean;
  /** Suggested action based on violations */
  suggestedAction: "shorten" | "split" | null;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for validating block content in real-time.
 *
 * @param block - The block to validate
 * @param slideIndex - Index of the slide containing the block
 * @param blockIndex - Index of the block within the slide
 * @returns Validation result with violations, status, and suggestions
 */
export function useBlockValidation(
  block: Block,
  slideIndex: number,
  blockIndex: number
): BlockValidationResult {
  return useMemo(() => {
    // Validate block and get violations
    const violations = validateBlock(block, slideIndex, blockIndex);

    // Get current and max values based on block kind
    const { current, max } = getBlockMetrics(block);

    // Calculate percentage
    const percentage = max > 0 ? Math.round((current / max) * 100) : 0;

    // Check if approaching limit
    const approaching = isApproachingLimit(current, max);

    // Check if exceeds limit
    const exceeds = current > max;

    // Determine suggested action
    const suggestedAction = getSuggestedAction(violations, percentage);

    return {
      violations,
      isApproaching: approaching,
      remaining: getRemainingChars(current, max),
      max,
      current,
      percentage,
      exceedsLimit: exceeds,
      suggestedAction,
    };
  }, [block, slideIndex, blockIndex]);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get current and max values for a block based on its kind.
 */
function getBlockMetrics(block: Block): { current: number; max: number } {
  switch (block.kind) {
    case "title": {
      const text = block.text ?? "";
      return {
        current: text.length,
        max: BLOCK_CONSTRAINTS.title.maxChars,
      };
    }

    case "text": {
      const text = block.text ?? "";
      return {
        current: text.length,
        max: BLOCK_CONSTRAINTS.text.maxChars,
      };
    }

    case "callout": {
      const text = block.text ?? "";
      return {
        current: text.length,
        max: BLOCK_CONSTRAINTS.callout.maxChars,
      };
    }

    case "bullets": {
      const items = block.items ?? [];
      return {
        current: items.length,
        max: BLOCK_CONSTRAINTS.bullets.maxItems,
      };
    }

    case "table": {
      const rows = block.rows ?? [];
      return {
        current: rows.length,
        max: BLOCK_CONSTRAINTS.table.maxRows,
      };
    }

    case "image": {
      // Images don't have editable content in MVP
      return { current: 0, max: 0 };
    }

    default:
      return { current: 0, max: 0 };
  }
}

/**
 * Determine suggested action based on violations.
 * - Multiple violations or >150% → split
 * - Single violation or >100% → shorten
 */
function getSuggestedAction(
  violations: ConstraintViolation[],
  percentage: number
): "shorten" | "split" | null {
  if (violations.length === 0 && percentage <= 100) {
    return null;
  }

  // Multiple violations or severely over limit → suggest split
  if (violations.length >= 3 || percentage > 150) {
    return "split";
  }

  // Single or few violations → suggest shorten
  if (violations.length > 0 || percentage > 100) {
    return "shorten";
  }

  return null;
}

// ============================================================================
// Export for bullet item validation
// ============================================================================

/**
 * Get validation result for a single bullet item.
 */
export function getBulletItemValidation(item: string, itemIndex: number): {
  current: number;
  max: number;
  remaining: number;
  percentage: number;
  isApproaching: boolean;
  exceedsLimit: boolean;
} {
  const max = BLOCK_CONSTRAINTS.bullets.maxItemChars;
  const current = item.length;
  const percentage = Math.round((current / max) * 100);

  return {
    current,
    max,
    remaining: getRemainingChars(current, max),
    percentage,
    isApproaching: isApproachingLimit(current, max),
    exceedsLimit: current > max,
  };
}
