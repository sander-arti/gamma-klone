/**
 * Block Constraints Utilities
 *
 * Utilities for enforcing and validating block content constraints.
 * Constraints are defined in block.ts schema.
 */

import type { Block, BlockKind } from "@/lib/schemas/block";
import type { ConstraintViolation } from "./types";

// ============================================================================
// Constraint Constants (from block.ts schema)
// ============================================================================

export const BLOCK_CONSTRAINTS = {
  title: {
    maxChars: 120,
  },
  text: {
    maxChars: 500,
  },
  bullets: {
    minItems: 1,
    maxItems: 8,
    minItemChars: 1,
    maxItemChars: 150,
  },
  callout: {
    maxChars: 300,
  },
  table: {
    minColumns: 1,
    maxColumns: 5,
    minRows: 1,
    maxRows: 10,
  },
  image: {
    maxAltChars: 200,
  },
  // Phase 7: stat_block constraints
  stat_block: {
    maxValueChars: 20,
    maxLabelChars: 50,
    maxSublabelChars: 100,
  },
  // Phase 7: timeline_step constraints
  timeline_step: {
    maxTitleChars: 80,
    maxDescriptionChars: 200,
    minStep: 1,
    maxStep: 10,
  },
  // Phase 7: icon_card constraints
  icon_card: {
    maxTextChars: 60,
    maxDescriptionChars: 150,
  },
  // Phase 7: numbered_card constraints
  numbered_card: {
    minNumber: 1,
    maxNumber: 99,
    maxTextChars: 60,
    maxDescriptionChars: 150,
  },
} as const;

// ============================================================================
// Text Utilities
// ============================================================================

/**
 * Truncate text to a maximum length, preserving word boundaries when possible.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Try to truncate at word boundary
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  // If space found in last 20% of text, truncate there
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace).trimEnd();
  }

  return truncated;
}

/**
 * Get the constraint max for a text-based block.
 */
export function getTextConstraint(kind: BlockKind): number {
  switch (kind) {
    case "title":
      return BLOCK_CONSTRAINTS.title.maxChars;
    case "text":
      return BLOCK_CONSTRAINTS.text.maxChars;
    case "callout":
      return BLOCK_CONSTRAINTS.callout.maxChars;
    default:
      return 500; // Default fallback
  }
}

// ============================================================================
// Bullets Utilities
// ============================================================================

/**
 * Enforce bullet items constraints.
 * - Truncates items to maxItemChars
 * - Limits array to maxItems
 * - Ensures at least minItems (adds placeholder if needed)
 */
export function enforceBulletsConstraints(items: string[]): string[] {
  const { minItems, maxItems, maxItemChars } = BLOCK_CONSTRAINTS.bullets;

  // Truncate each item
  let enforced = items.map((item) => truncateText(item, maxItemChars));

  // Limit to max items
  if (enforced.length > maxItems) {
    enforced = enforced.slice(0, maxItems);
  }

  // Ensure minimum items
  while (enforced.length < minItems) {
    enforced.push("Nytt punkt");
  }

  return enforced;
}

// ============================================================================
// Table Utilities
// ============================================================================

interface TableData {
  columns: string[];
  rows: string[][];
}

/**
 * Enforce table constraints.
 * - Limits columns to maxColumns
 * - Limits rows to maxRows
 * - Ensures at least minimum columns and rows
 */
export function enforceTableConstraints(columns: string[], rows: string[][]): TableData {
  const { minColumns, maxColumns, minRows, maxRows } = BLOCK_CONSTRAINTS.table;

  // Enforce column constraints
  let enforcedColumns = columns.slice(0, maxColumns);
  while (enforcedColumns.length < minColumns) {
    enforcedColumns.push(`Kolonne ${enforcedColumns.length + 1}`);
  }

  // Enforce row constraints
  let enforcedRows = rows.slice(0, maxRows);
  while (enforcedRows.length < minRows) {
    enforcedRows.push(enforcedColumns.map(() => ""));
  }

  // Ensure each row has correct number of cells
  enforcedRows = enforcedRows.map((row) => {
    const enforcedRow = row.slice(0, enforcedColumns.length);
    while (enforcedRow.length < enforcedColumns.length) {
      enforcedRow.push("");
    }
    return enforcedRow;
  });

  return { columns: enforcedColumns, rows: enforcedRows };
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Create a block ID from slide and block indices.
 */
export function createBlockId(slideIndex: number, blockIndex: number): string {
  return `${slideIndex}-${blockIndex}`;
}

/**
 * Parse a block ID back to indices.
 */
export function parseBlockId(blockId: string): { slideIndex: number; blockIndex: number } | null {
  const parts = blockId.split("-");
  if (parts.length !== 2) return null;

  const slideIndex = parseInt(parts[0], 10);
  const blockIndex = parseInt(parts[1], 10);

  if (isNaN(slideIndex) || isNaN(blockIndex)) return null;

  return { slideIndex, blockIndex };
}

/**
 * Validate a block and return any constraint violations.
 */
export function validateBlock(
  block: Block,
  slideIndex: number,
  blockIndex: number
): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  const blockId = createBlockId(slideIndex, blockIndex);

  switch (block.kind) {
    case "title": {
      const text = block.text ?? "";
      const max = BLOCK_CONSTRAINTS.title.maxChars;
      if (text.length > max) {
        violations.push({
          blockId,
          type: "max_chars",
          current: text.length,
          max,
          message: `Tittel er for lang (${text.length}/${max} tegn)`,
        });
      }
      break;
    }

    case "text": {
      const text = block.text ?? "";
      const max = BLOCK_CONSTRAINTS.text.maxChars;
      if (text.length > max) {
        violations.push({
          blockId,
          type: "max_chars",
          current: text.length,
          max,
          message: `Tekst er for lang (${text.length}/${max} tegn)`,
        });
      }
      break;
    }

    case "callout": {
      const text = block.text ?? "";
      const max = BLOCK_CONSTRAINTS.callout.maxChars;
      if (text.length > max) {
        violations.push({
          blockId,
          type: "max_chars",
          current: text.length,
          max,
          message: `Callout er for lang (${text.length}/${max} tegn)`,
        });
      }
      break;
    }

    case "bullets": {
      const items = block.items ?? [];
      const { maxItems, maxItemChars } = BLOCK_CONSTRAINTS.bullets;

      if (items.length > maxItems) {
        violations.push({
          blockId,
          type: "max_items",
          current: items.length,
          max: maxItems,
          message: `For mange punkter (${items.length}/${maxItems})`,
        });
      }

      // Check individual items
      items.forEach((item, idx) => {
        if (item.length > maxItemChars) {
          violations.push({
            blockId: `${blockId}-item-${idx}`,
            type: "max_chars",
            current: item.length,
            max: maxItemChars,
            message: `Punkt ${idx + 1} er for langt (${item.length}/${maxItemChars} tegn)`,
          });
        }
      });
      break;
    }

    case "table": {
      const columns = block.columns ?? [];
      const rows = block.rows ?? [];
      const { maxColumns, maxRows } = BLOCK_CONSTRAINTS.table;

      if (columns.length > maxColumns) {
        violations.push({
          blockId,
          type: "overflow",
          current: columns.length,
          max: maxColumns,
          message: `For mange kolonner (${columns.length}/${maxColumns})`,
        });
      }

      if (rows.length > maxRows) {
        violations.push({
          blockId,
          type: "max_rows",
          current: rows.length,
          max: maxRows,
          message: `For mange rader (${rows.length}/${maxRows})`,
        });
      }
      break;
    }

    // Image blocks are read-only, no validation needed
    case "image":
      break;

    // Phase 7: stat_block validation
    case "stat_block": {
      const value = block.value ?? "";
      const label = block.label ?? "";
      const sublabel = block.sublabel ?? "";
      const { maxValueChars, maxLabelChars, maxSublabelChars } = BLOCK_CONSTRAINTS.stat_block;

      if (value.length > maxValueChars) {
        violations.push({
          blockId,
          type: "max_chars",
          current: value.length,
          max: maxValueChars,
          message: `Verdi er for lang (${value.length}/${maxValueChars} tegn)`,
        });
      }

      if (label.length > maxLabelChars) {
        violations.push({
          blockId: `${blockId}-label`,
          type: "max_chars",
          current: label.length,
          max: maxLabelChars,
          message: `Etikett er for lang (${label.length}/${maxLabelChars} tegn)`,
        });
      }

      if (sublabel.length > maxSublabelChars) {
        violations.push({
          blockId: `${blockId}-sublabel`,
          type: "max_chars",
          current: sublabel.length,
          max: maxSublabelChars,
          message: `Underetikett er for lang (${sublabel.length}/${maxSublabelChars} tegn)`,
        });
      }
      break;
    }

    // Phase 7: timeline_step validation
    case "timeline_step": {
      const title = block.text ?? "";
      const description = block.description ?? "";
      const step = block.step ?? 1;
      const { maxTitleChars, maxDescriptionChars, minStep, maxStep } =
        BLOCK_CONSTRAINTS.timeline_step;

      if (title.length > maxTitleChars) {
        violations.push({
          blockId,
          type: "max_chars",
          current: title.length,
          max: maxTitleChars,
          message: `Tittel er for lang (${title.length}/${maxTitleChars} tegn)`,
        });
      }

      if (description.length > maxDescriptionChars) {
        violations.push({
          blockId: `${blockId}-description`,
          type: "max_chars",
          current: description.length,
          max: maxDescriptionChars,
          message: `Beskrivelse er for lang (${description.length}/${maxDescriptionChars} tegn)`,
        });
      }

      if (step < minStep || step > maxStep) {
        violations.push({
          blockId,
          type: "overflow",
          current: step,
          max: maxStep,
          message: `Steg må være mellom ${minStep} og ${maxStep}`,
        });
      }
      break;
    }

    // Phase 7: icon_card validation
    case "icon_card": {
      const text = block.text ?? "";
      const description = block.description ?? "";
      const { maxTextChars, maxDescriptionChars } = BLOCK_CONSTRAINTS.icon_card;

      if (text.length > maxTextChars) {
        violations.push({
          blockId,
          type: "max_chars",
          current: text.length,
          max: maxTextChars,
          message: `Korttittel er for lang (${text.length}/${maxTextChars} tegn)`,
        });
      }

      if (description.length > maxDescriptionChars) {
        violations.push({
          blockId: `${blockId}-description`,
          type: "max_chars",
          current: description.length,
          max: maxDescriptionChars,
          message: `Kortbeskrivelse er for lang (${description.length}/${maxDescriptionChars} tegn)`,
        });
      }
      break;
    }

    // Phase 7: numbered_card validation
    case "numbered_card": {
      const text = block.text ?? "";
      const description = block.description ?? "";
      const number = block.number ?? 1;
      const { minNumber, maxNumber, maxTextChars, maxDescriptionChars } =
        BLOCK_CONSTRAINTS.numbered_card;

      if (text.length > maxTextChars) {
        violations.push({
          blockId,
          type: "max_chars",
          current: text.length,
          max: maxTextChars,
          message: `Korttittel er for lang (${text.length}/${maxTextChars} tegn)`,
        });
      }

      if (description.length > maxDescriptionChars) {
        violations.push({
          blockId: `${blockId}-description`,
          type: "max_chars",
          current: description.length,
          max: maxDescriptionChars,
          message: `Kortbeskrivelse er for lang (${description.length}/${maxDescriptionChars} tegn)`,
        });
      }

      if (number < minNumber || number > maxNumber) {
        violations.push({
          blockId,
          type: "overflow",
          current: number,
          max: maxNumber,
          message: `Nummer må være mellom ${minNumber} og ${maxNumber}`,
        });
      }
      break;
    }
  }

  return violations;
}

// ============================================================================
// Deterministic Constraint Enforcement
// ============================================================================

/**
 * Enforce constraints on a block by truncating any oversized fields.
 * Returns a new block with all fields within limits.
 * This is deterministic and does not use AI.
 */
export function enforceBlockConstraints(block: Block): Block {
  const enforced = { ...block };

  switch (block.kind) {
    case "title": {
      const max = BLOCK_CONSTRAINTS.title.maxChars;
      if (enforced.text && enforced.text.length > max) {
        enforced.text = truncateText(enforced.text, max);
      }
      break;
    }

    case "text": {
      const max = BLOCK_CONSTRAINTS.text.maxChars;
      if (enforced.text && enforced.text.length > max) {
        enforced.text = truncateText(enforced.text, max);
      }
      break;
    }

    case "callout": {
      const max = BLOCK_CONSTRAINTS.callout.maxChars;
      if (enforced.text && enforced.text.length > max) {
        enforced.text = truncateText(enforced.text, max);
      }
      break;
    }

    case "bullets": {
      const { maxItems, maxItemChars } = BLOCK_CONSTRAINTS.bullets;
      if (enforced.items) {
        // Truncate each item and limit count
        enforced.items = enforced.items
          .slice(0, maxItems)
          .map((item) => truncateText(item, maxItemChars));
      }
      break;
    }

    case "table": {
      const { maxColumns, maxRows } = BLOCK_CONSTRAINTS.table;
      if (enforced.columns && enforced.columns.length > maxColumns) {
        enforced.columns = enforced.columns.slice(0, maxColumns);
      }
      if (enforced.rows && enforced.rows.length > maxRows) {
        enforced.rows = enforced.rows.slice(0, maxRows);
        // Also truncate columns in rows
        if (enforced.columns) {
          enforced.rows = enforced.rows.map((row) => row.slice(0, enforced.columns!.length));
        }
      }
      break;
    }

    case "stat_block": {
      const { maxValueChars, maxLabelChars, maxSublabelChars } = BLOCK_CONSTRAINTS.stat_block;
      if (enforced.value && enforced.value.length > maxValueChars) {
        enforced.value = truncateText(enforced.value, maxValueChars);
      }
      if (enforced.label && enforced.label.length > maxLabelChars) {
        enforced.label = truncateText(enforced.label, maxLabelChars);
      }
      if (enforced.sublabel && enforced.sublabel.length > maxSublabelChars) {
        enforced.sublabel = truncateText(enforced.sublabel, maxSublabelChars);
      }
      break;
    }

    case "timeline_step": {
      const { maxTitleChars, maxDescriptionChars } = BLOCK_CONSTRAINTS.timeline_step;
      if (enforced.text && enforced.text.length > maxTitleChars) {
        enforced.text = truncateText(enforced.text, maxTitleChars);
      }
      if (enforced.description && enforced.description.length > maxDescriptionChars) {
        enforced.description = truncateText(enforced.description, maxDescriptionChars);
      }
      break;
    }

    case "icon_card": {
      const { maxTextChars, maxDescriptionChars } = BLOCK_CONSTRAINTS.icon_card;
      if (enforced.text && enforced.text.length > maxTextChars) {
        enforced.text = truncateText(enforced.text, maxTextChars);
      }
      if (enforced.description && enforced.description.length > maxDescriptionChars) {
        enforced.description = truncateText(enforced.description, maxDescriptionChars);
      }
      break;
    }

    case "numbered_card": {
      const { maxTextChars, maxDescriptionChars } = BLOCK_CONSTRAINTS.numbered_card;
      if (enforced.text && enforced.text.length > maxTextChars) {
        enforced.text = truncateText(enforced.text, maxTextChars);
      }
      if (enforced.description && enforced.description.length > maxDescriptionChars) {
        enforced.description = truncateText(enforced.description, maxDescriptionChars);
      }
      break;
    }

    // image blocks have no text constraints that need enforcement
    case "image":
      break;
  }

  return enforced;
}

/**
 * Enforce constraints on all blocks in a slide.
 * Returns a new slide with all blocks within limits.
 */
export function enforceSlideConstraints(slide: {
  blocks: Block[];
  [key: string]: unknown;
}): typeof slide {
  return {
    ...slide,
    blocks: slide.blocks.map(enforceBlockConstraints),
  };
}

/**
 * Check if text is approaching the limit (>80% of max).
 */
export function isApproachingLimit(current: number, max: number): boolean {
  return current > max * 0.8;
}

/**
 * Check if text exceeds the limit.
 */
export function exceedsLimit(current: number, max: number): boolean {
  return current > max;
}

/**
 * Get remaining characters.
 */
export function getRemainingChars(current: number, max: number): number {
  return Math.max(0, max - current);
}
