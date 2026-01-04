import type { Deck } from "@/lib/schemas/deck";
import type { Slide, SlideType } from "@/lib/schemas/slide";
import type { Block } from "@/lib/schemas/block";
import {
  validateSlideConstraints,
  extractNumberFromTitle,
  type ConstraintViolation,
} from "@/lib/validation/constraints";

/**
 * Validation result for a single slide
 */
export interface SlideValidationResult {
  slideIndex: number;
  isValid: boolean;
  violations: ConstraintViolation[];
}

/**
 * Validation result for an entire deck
 */
export interface DeckValidationResult {
  isValid: boolean;
  slideResults: SlideValidationResult[];
  totalViolations: number;
}

/**
 * Extract content from slide blocks for constraint validation
 */
function extractSlideContent(slide: Slide): {
  title?: string;
  subtitle?: string;
  text?: string;
  bullets?: string[];
  columns?: string[];
  items?: string[];
  tableRows?: string[][];
} {
  const content: {
    title?: string;
    subtitle?: string;
    text?: string;
    bullets?: string[];
    columns?: string[];
    items?: string[];
    tableRows?: string[][];
  } = {};

  const textBlocks: string[] = [];
  const iconCardTexts: string[] = [];
  const numberedCardTexts: string[] = [];
  const timelineTexts: string[] = [];
  const statLabels: string[] = [];

  for (const block of slide.blocks) {
    switch (block.kind) {
      case "title":
        content.title = block.text;
        break;
      case "text":
        textBlocks.push(block.text ?? "");
        break;
      case "bullets":
        content.bullets = block.items;
        break;
      case "table":
        content.tableRows = block.rows;
        break;
      case "callout":
        content.text = block.text;
        break;
      // Handle new block types (Phase 7)
      case "icon_card":
        if (block.text) {
          iconCardTexts.push(block.text);
        }
        break;
      case "numbered_card":
        if (block.text) {
          numberedCardTexts.push(block.text);
        }
        break;
      case "timeline_step":
        // Use the title/text field from timeline steps
        if (block.text) {
          timelineTexts.push(block.text);
        }
        break;
      case "stat_block":
        if (block.label) {
          statLabels.push(block.label);
        }
        break;
    }
  }

  // Handle text blocks based on slide type
  if (textBlocks.length > 0) {
    if (slide.type === "two_column_text") {
      content.columns = textBlocks;
    } else if (textBlocks.length === 1) {
      // Second text block often acts as subtitle
      if (slide.type === "cover" || slide.type === "section_header") {
        content.subtitle = textBlocks[0];
      } else {
        content.text = textBlocks[0];
      }
    } else {
      content.text = textBlocks.join(" ");
    }
  }

  // For decisions_list, bullets act as items
  if (slide.type === "decisions_list" && content.bullets) {
    content.items = content.bullets;
    delete content.bullets;
  }

  // Handle items validation for card-based slide types
  if (slide.type === "icon_cards_with_image" || slide.type === "split_with_callouts") {
    content.items = iconCardTexts;
  } else if (slide.type === "numbered_grid") {
    content.items = numberedCardTexts;
  } else if (slide.type === "timeline_roadmap") {
    content.items = timelineTexts;
  } else if (slide.type === "summary_with_stats" || slide.type === "hero_stats") {
    content.items = statLabels;
  }

  return content;
}

/**
 * Slide types that use countable items which should match title numbers
 */
const COUNTABLE_ITEM_SLIDE_TYPES: SlideType[] = [
  "bullets",
  "decisions_list",
  "icon_cards_with_image",
  "numbered_grid",
  "timeline_roadmap",
  "split_with_callouts",
  "summary_next_steps",
  "agenda",
];

/**
 * Validate that a number mentioned in the title matches the actual item count
 * E.g., "Fire bunnsolide USP-er" should have exactly 4 items
 */
function validateTitleCountConsistency(
  slide: Slide,
  content: ReturnType<typeof extractSlideContent>
): ConstraintViolation | null {
  // Only check slide types with countable items
  if (!COUNTABLE_ITEM_SLIDE_TYPES.includes(slide.type)) {
    return null;
  }

  // Get title
  const title = content.title;
  if (!title) return null;

  // Extract number from title
  const titleNumber = extractNumberFromTitle(title);
  if (titleNumber === null) return null;

  // Get actual item count based on slide type
  let actualCount = 0;
  if (content.bullets && content.bullets.length > 0) {
    actualCount = content.bullets.length;
  } else if (content.items && content.items.length > 0) {
    actualCount = content.items.length;
  }

  // No items found - can't validate
  if (actualCount === 0) return null;

  // Check for mismatch
  if (titleNumber !== actualCount) {
    return {
      field: "title_count_mismatch",
      message: `Title mentions ${titleNumber} items but slide has ${actualCount}`,
      current: actualCount,
      limit: titleNumber,
      action: "adjust_title",
    };
  }

  return null;
}

/**
 * Validate a single slide against its constraints
 * @param checkDensity - If true, also checks content density (default: true)
 */
export function validateSlide(
  slide: Slide,
  slideIndex: number,
  checkDensity = true
): SlideValidationResult {
  const content = extractSlideContent(slide);
  const violations = validateSlideConstraints(slide.type, content);

  // Check title-count consistency
  const titleCountViolation = validateTitleCountConsistency(slide, content);
  if (titleCountViolation) {
    violations.push(titleCountViolation);
  }

  // Check content density (optional, for quality)
  if (checkDensity) {
    const densityViolation = validateContentDensity(slide);
    if (densityViolation) {
      violations.push(densityViolation);
    }
  }

  return {
    slideIndex,
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Validate an entire deck
 */
export function validateDeck(deck: Deck): DeckValidationResult {
  const slideResults = deck.slides.map((slide, index) => validateSlide(slide, index));

  const totalViolations = slideResults.reduce((sum, r) => sum + r.violations.length, 0);

  return {
    isValid: totalViolations === 0,
    slideResults,
    totalViolations,
  };
}

/**
 * Layout capacity estimates per slide type (approximate character capacity)
 * Used to calculate content density
 */
const LAYOUT_CAPACITY: Record<SlideType, number> = {
  cover: 180, // title + subtitle
  agenda: 500, // title + 6-8 agenda items
  section_header: 160, // title + subtitle
  bullets: 600, // title + 5-6 bullets
  two_column_text: 700, // 2 x 350 chars
  text_plus_image: 500, // text + image (image adds density)
  decisions_list: 600, // title + decisions
  action_items_table: 500, // table content
  summary_next_steps: 550, // title + steps
  quote_callout: 400, // quote + attribution
  timeline_roadmap: 500, // steps with descriptions
  numbered_grid: 480, // 3-4 cards x 120 chars
  icon_cards_with_image: 480, // 3-4 cards + image
  summary_with_stats: 500, // text + stats
  hero_stats: 400, // stats + image
  split_with_callouts: 450, // image + callouts
  person_spotlight: 400, // image + bio
};

/**
 * Minimum density threshold - slides below this look empty
 * 0.35 = 35% of capacity should be filled
 */
const MIN_DENSITY_THRESHOLD = 0.35;

/**
 * Calculate content density for a slide
 * Returns a value between 0 and 1+ (can exceed 1 if overfilled)
 */
export function calculateContentDensity(slide: Slide): number {
  const content = extractSlideContent(slide);

  // Count total text characters
  let totalChars = 0;

  if (content.title) totalChars += content.title.length;
  if (content.subtitle) totalChars += content.subtitle.length;
  if (content.text) totalChars += content.text.length;
  if (content.bullets) totalChars += content.bullets.reduce((sum, b) => sum + b.length, 0);
  if (content.columns) totalChars += content.columns.reduce((sum, c) => sum + c.length, 0);
  if (content.items) totalChars += content.items.reduce((sum, i) => sum + i.length, 0);
  if (content.tableRows) {
    totalChars += content.tableRows.flat().reduce((sum, cell) => sum + cell.length, 0);
  }

  // Images add visual density (count as ~150 chars worth)
  const hasImage = slide.blocks.some((b) => b.kind === "image" && b.url);
  const imageBonus = hasImage ? 150 : 0;

  const capacity = LAYOUT_CAPACITY[slide.type] ?? 400;
  return (totalChars + imageBonus) / capacity;
}

/**
 * Check if a slide has low content density (looks sparse/empty)
 * Returns a violation if density is below threshold
 */
function validateContentDensity(slide: Slide): ConstraintViolation | null {
  const density = calculateContentDensity(slide);

  if (density < MIN_DENSITY_THRESHOLD) {
    const percentFilled = Math.round(density * 100);
    const minPercent = Math.round(MIN_DENSITY_THRESHOLD * 100);

    return {
      field: "content_density",
      message: `Slide appears sparse (${percentFilled}% filled, recommend at least ${minPercent}%)`,
      current: percentFilled,
      limit: minPercent,
      action: "expand",
    };
  }

  return null;
}

/**
 * Check if violations require repair
 */
export function needsRepair(result: DeckValidationResult): boolean {
  return !result.isValid;
}

/**
 * Get slides that need repair
 */
export function getSlidesNeedingRepair(
  deck: Deck,
  result: DeckValidationResult
): Array<{ slide: Slide; index: number; violations: ConstraintViolation[] }> {
  return result.slideResults
    .filter((r) => !r.isValid)
    .map((r) => ({
      slide: deck.slides[r.slideIndex],
      index: r.slideIndex,
      violations: r.violations,
    }));
}

/**
 * Check if a slide should be split rather than shortened
 */
export function shouldSplit(violations: ConstraintViolation[]): boolean {
  // If any violation suggests split, or if there are many violations
  return violations.some((v) => v.action === "split") || violations.length >= 3;
}
