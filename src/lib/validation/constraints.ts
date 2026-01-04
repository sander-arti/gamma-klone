import type { SlideType } from "@/lib/schemas/slide";

/**
 * Content constraints per slide type (PRD §9)
 *
 * These constraints are critical for maintaining "premium look" and
 * must be enforced in the validation layer.
 */
export interface SlideConstraints {
  title?: {
    maxChars: number;
  };
  subtitle?: {
    maxChars: number;
  };
  text?: {
    maxChars: number;
  };
  bullets?: {
    min: number;
    max: number;
    maxCharsPerBullet: number;
    /** Minimum characters per bullet (optional, for quality) */
    minCharsPerBullet?: number;
  };
  columns?: {
    maxCharsPerColumn: number;
  };
  items?: {
    min: number;
    max: number;
    maxCharsPerItem: number;
    /** Minimum characters per item (for card-based layouts) */
    minCharsPerItem?: number;
  };
  table?: {
    maxRows: number;
    maxColumns: number;
  };
}

/**
 * Constraint definitions per slide type
 */
export const SLIDE_CONSTRAINTS: Record<SlideType, SlideConstraints> = {
  cover: {
    title: { maxChars: 60 },
    subtitle: { maxChars: 120 },
  },

  agenda: {
    title: { maxChars: 50 },
    bullets: { min: 2, max: 8, maxCharsPerBullet: 80 },
  },

  section_header: {
    title: { maxChars: 60 },
    subtitle: { maxChars: 100 },
  },

  bullets: {
    title: { maxChars: 70 },
    bullets: { min: 3, max: 6, maxCharsPerBullet: 120 },
  },

  two_column_text: {
    title: { maxChars: 70 },
    columns: { maxCharsPerColumn: 350 },
  },

  text_plus_image: {
    title: { maxChars: 70 },
    text: { maxChars: 450 },
  },

  decisions_list: {
    title: { maxChars: 70 },
    items: { min: 3, max: 7, maxCharsPerItem: 140 },
  },

  action_items_table: {
    title: { maxChars: 70 },
    table: { maxRows: 8, maxColumns: 3 }, // task, owner, deadline
  },

  summary_next_steps: {
    title: { maxChars: 70 },
    bullets: { min: 3, max: 6, maxCharsPerBullet: 120 },
  },

  quote_callout: {
    text: { maxChars: 300 },
    subtitle: { maxChars: 80 }, // attribution
  },

  timeline_roadmap: {
    title: { maxChars: 80 },
    items: { min: 1, max: 10, maxCharsPerItem: 100 }, // step titles (relaxed)
  },

  numbered_grid: {
    title: { maxChars: 80 },
    items: { min: 2, max: 6, minCharsPerItem: 30, maxCharsPerItem: 120 }, // card descriptions need substance
  },

  icon_cards_with_image: {
    title: { maxChars: 80 },
    items: { min: 2, max: 6, minCharsPerItem: 30, maxCharsPerItem: 120 }, // card descriptions need substance
  },

  summary_with_stats: {
    title: { maxChars: 80 },
    text: { maxChars: 400 },
    items: { min: 1, max: 4, maxCharsPerItem: 60 }, // max 4 stats to prevent overflow
  },

  // Premium slide types (Phase 5)
  hero_stats: {
    title: { maxChars: 80 },
    items: { min: 1, max: 4, maxCharsPerItem: 60 }, // max 4 stats to prevent overflow
  },

  split_with_callouts: {
    title: { maxChars: 80 },
    items: { min: 2, max: 5, minCharsPerItem: 25, maxCharsPerItem: 100 }, // callout descriptions need substance
  },

  person_spotlight: {
    title: { maxChars: 80 },
    text: { maxChars: 200 }, // person name and role (relaxed)
    bullets: { min: 1, max: 6, maxCharsPerBullet: 100 }, // bio points (relaxed)
  },
};

/**
 * Check if a value exceeds the character limit
 */
export function exceedsCharLimit(value: string, maxChars: number): boolean {
  return value.length > maxChars;
}

/**
 * Check if a list exceeds the item limits
 */
export function exceedsItemLimit(items: string[], min: number, max: number): boolean {
  return items.length < min || items.length > max;
}

/**
 * Validation result for a single field
 */
export interface ConstraintViolation {
  field: string;
  message: string;
  current: number;
  limit: number;
  action: "shorten" | "split" | "adjust_title" | "expand";
}

/**
 * Norwegian number words mapping (for title-count validation)
 */
const NORWEGIAN_NUMBERS: Record<string, number> = {
  en: 1,
  ett: 1,
  én: 1,
  to: 2,
  tre: 3,
  fire: 4,
  fem: 5,
  seks: 6,
  syv: 7,
  sju: 7,
  åtte: 8,
  ni: 9,
  ti: 10,
};

/**
 * Extract a number from a title (e.g., "Fire USP-er" → 4, "3 punkter" → 3)
 * Returns null if no number is found
 */
export function extractNumberFromTitle(title: string): number | null {
  if (!title) return null;

  const lowerTitle = title.toLowerCase().trim();

  // Pattern 1: Digit at start (e.g., "3 punkter", "5 tips")
  const digitMatch = lowerTitle.match(/^(\d+)\s+/);
  if (digitMatch) {
    return parseInt(digitMatch[1], 10);
  }

  // Pattern 2: Norwegian number word at start (e.g., "Fire USP-er", "Tre steg")
  for (const [word, num] of Object.entries(NORWEGIAN_NUMBERS)) {
    const pattern = new RegExp(`^${word}\\s+`, "i");
    if (pattern.test(lowerTitle)) {
      return num;
    }
  }

  // Pattern 3: Number word anywhere with common patterns
  // e.g., "De fire viktigste...", "Våre tre hovedpunkter"
  for (const [word, num] of Object.entries(NORWEGIAN_NUMBERS)) {
    const pattern = new RegExp(`\\b${word}\\s+(viktigste|beste|største|hovedpunkter?|punkter?|steg|trinn|tips|grunner?|fordeler?|usp|elementer?)\\b`, "i");
    if (pattern.test(lowerTitle)) {
      return num;
    }
  }

  return null;
}

/**
 * Validate a slide against its constraints
 * Returns list of violations, empty if valid
 */
export function validateSlideConstraints(
  slideType: SlideType,
  content: {
    title?: string;
    subtitle?: string;
    text?: string;
    bullets?: string[];
    columns?: string[];
    items?: string[];
    tableRows?: string[][];
  }
): ConstraintViolation[] {
  const constraints = SLIDE_CONSTRAINTS[slideType];
  const violations: ConstraintViolation[] = [];

  // Title check
  if (constraints.title && content.title) {
    if (exceedsCharLimit(content.title, constraints.title.maxChars)) {
      violations.push({
        field: "title",
        message: `Title exceeds ${constraints.title.maxChars} characters`,
        current: content.title.length,
        limit: constraints.title.maxChars,
        action: "shorten",
      });
    }
  }

  // Subtitle check
  if (constraints.subtitle && content.subtitle) {
    if (exceedsCharLimit(content.subtitle, constraints.subtitle.maxChars)) {
      violations.push({
        field: "subtitle",
        message: `Subtitle exceeds ${constraints.subtitle.maxChars} characters`,
        current: content.subtitle.length,
        limit: constraints.subtitle.maxChars,
        action: "shorten",
      });
    }
  }

  // Text check
  if (constraints.text && content.text) {
    if (exceedsCharLimit(content.text, constraints.text.maxChars)) {
      violations.push({
        field: "text",
        message: `Text exceeds ${constraints.text.maxChars} characters`,
        current: content.text.length,
        limit: constraints.text.maxChars,
        action: "shorten",
      });
    }
  }

  // Bullets check
  if (constraints.bullets && content.bullets) {
    if (content.bullets.length < constraints.bullets.min) {
      violations.push({
        field: "bullets",
        message: `Needs at least ${constraints.bullets.min} bullet points`,
        current: content.bullets.length,
        limit: constraints.bullets.min,
        action: "split",
      });
    }
    if (content.bullets.length > constraints.bullets.max) {
      violations.push({
        field: "bullets",
        message: `Exceeds maximum ${constraints.bullets.max} bullet points`,
        current: content.bullets.length,
        limit: constraints.bullets.max,
        action: "split",
      });
    }
    content.bullets.forEach((bullet, i) => {
      if (exceedsCharLimit(bullet, constraints.bullets!.maxCharsPerBullet)) {
        violations.push({
          field: `bullets[${i}]`,
          message: `Bullet ${i + 1} exceeds ${constraints.bullets!.maxCharsPerBullet} characters`,
          current: bullet.length,
          limit: constraints.bullets!.maxCharsPerBullet,
          action: "shorten",
        });
      }
    });
  }

  // Items check (for decisions_list, icon_cards, numbered_grid, etc.)
  if (constraints.items && content.items) {
    if (content.items.length < constraints.items.min) {
      violations.push({
        field: "items",
        message: `Needs at least ${constraints.items.min} items`,
        current: content.items.length,
        limit: constraints.items.min,
        action: "split",
      });
    }
    if (content.items.length > constraints.items.max) {
      violations.push({
        field: "items",
        message: `Exceeds maximum ${constraints.items.max} items`,
        current: content.items.length,
        limit: constraints.items.max,
        action: "split",
      });
    }
    content.items.forEach((item, i) => {
      // Check max length
      if (exceedsCharLimit(item, constraints.items!.maxCharsPerItem)) {
        violations.push({
          field: `items[${i}]`,
          message: `Item ${i + 1} exceeds ${constraints.items!.maxCharsPerItem} characters`,
          current: item.length,
          limit: constraints.items!.maxCharsPerItem,
          action: "shorten",
        });
      }
      // Check min length (for card-based layouts that need substance)
      const minChars = constraints.items!.minCharsPerItem;
      if (minChars && item.length < minChars) {
        violations.push({
          field: `items[${i}]`,
          message: `Item ${i + 1} is too short (minimum ${minChars} characters for quality)`,
          current: item.length,
          limit: minChars,
          action: "expand",
        });
      }
    });
  }

  // Table check
  if (constraints.table && content.tableRows) {
    if (content.tableRows.length > constraints.table.maxRows) {
      violations.push({
        field: "tableRows",
        message: `Exceeds maximum ${constraints.table.maxRows} rows`,
        current: content.tableRows.length,
        limit: constraints.table.maxRows,
        action: "split",
      });
    }
    if (content.tableRows[0] && content.tableRows[0].length > constraints.table.maxColumns) {
      violations.push({
        field: "tableColumns",
        message: `Exceeds maximum ${constraints.table.maxColumns} columns`,
        current: content.tableRows[0].length,
        limit: constraints.table.maxColumns,
        action: "split",
      });
    }
  }

  // Columns check (for two_column_text)
  if (constraints.columns && content.columns) {
    content.columns.forEach((col, i) => {
      if (exceedsCharLimit(col, constraints.columns!.maxCharsPerColumn)) {
        violations.push({
          field: `columns[${i}]`,
          message: `Column ${i + 1} exceeds ${constraints.columns!.maxCharsPerColumn} characters`,
          current: col.length,
          limit: constraints.columns!.maxCharsPerColumn,
          action: "shorten",
        });
      }
    });
  }

  return violations;
}
