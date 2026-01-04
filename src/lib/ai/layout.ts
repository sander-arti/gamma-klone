import type { Slide, SlideType } from "@/lib/schemas/slide";

/**
 * Phase 7 Sprint 4 (Layer 3.3): Layout context for variation tracking
 * Enables smarter layout assignment by tracking what's been used
 */
export interface LayoutContext {
  /** Current slide index (0-based) */
  slideIndex: number;
  /** Total number of slides in deck */
  totalSlides: number;
  /** Track recently used variants per slide type (last 2) */
  usedVariants: Map<SlideType, string[]>;
  /** Previous slide's layout variant (for alternation) */
  previousVariant?: string;
  /** Previous slide's type (for same-type detection) */
  previousType?: SlideType;
}

/**
 * Create a fresh layout context
 */
export function createLayoutContext(totalSlides: number): LayoutContext {
  return {
    slideIndex: 0,
    totalSlides,
    usedVariants: new Map(),
    previousVariant: undefined,
    previousType: undefined,
  };
}

/**
 * Update context after assigning a layout
 */
export function updateLayoutContext(
  context: LayoutContext,
  slideType: SlideType,
  variant: string
): void {
  // Track used variants per type (keep last 2)
  const typeVariants = context.usedVariants.get(slideType) ?? [];
  typeVariants.push(variant);
  if (typeVariants.length > 2) {
    typeVariants.shift(); // Keep only last 2
  }
  context.usedVariants.set(slideType, typeVariants);

  // Update for next slide
  context.previousVariant = variant;
  context.previousType = slideType;
  context.slideIndex++;
}

/**
 * Layout variants per slide type
 */
export const LAYOUT_VARIANTS: Record<SlideType, string[]> = {
  cover: ["default", "centered", "bottom_aligned"],
  agenda: ["default", "numbered", "icons"],
  section_header: ["default", "large", "subtle"],
  bullets: ["default", "compact", "expanded", "two_columns"],
  two_column_text: ["default", "text_left", "text_right", "equal"],
  text_plus_image: ["default", "image_left", "image_right", "image_background"],
  decisions_list: ["default", "numbered", "icons"],
  action_items_table: ["default", "compact", "detailed"],
  summary_next_steps: ["default", "numbered", "timeline"],
  quote_callout: ["default", "large", "subtle", "centered"],
  timeline_roadmap: ["default", "vertical", "horizontal", "compact"],
  numbered_grid: ["default", "2x2", "3x1", "4x1"],
  icon_cards_with_image: ["default", "cards_left", "cards_right", "cards_top"],
  summary_with_stats: ["default", "stats_bottom", "stats_right", "stats_inline"],
  // Premium slide types (Phase 5)
  hero_stats: ["default", "hero_top", "hero_background", "hero_split"],
  split_with_callouts: ["default", "image_left", "image_right"],
  person_spotlight: ["default", "centered", "side_by_side"],
};

/**
 * Count total characters in slide blocks
 */
function countTotalChars(slide: Slide): number {
  let total = 0;

  for (const block of slide.blocks) {
    switch (block.kind) {
      case "title":
      case "text":
      case "callout":
        total += (block.text ?? "").length;
        break;
      case "bullets":
        total += (block.items ?? []).reduce((sum, item) => sum + item.length, 0);
        break;
      case "table":
        total += (block.rows ?? []).flat().reduce((sum, cell) => sum + cell.length, 0);
        break;
    }
  }

  return total;
}

/**
 * Count bullet items in slide
 */
function countBullets(slide: Slide): number {
  const bulletBlock = slide.blocks.find((b) => b.kind === "bullets");
  return bulletBlock?.items?.length ?? 0;
}

/**
 * Count table rows in slide
 */
function countTableRows(slide: Slide): number {
  const tableBlock = slide.blocks.find((b) => b.kind === "table");
  return tableBlock?.rows?.length ?? 0;
}

/**
 * Check if slide has an image
 */
function hasImage(slide: Slide): boolean {
  return slide.blocks.some((b) => b.kind === "image");
}

/**
 * Get subtitle/text block length for cover slides
 */
function getSubtitleLength(slide: Slide): number {
  const textBlock = slide.blocks.find((b) => b.kind === "text");
  return textBlock?.text?.length ?? 0;
}

/**
 * Check if bullet items are generally long (>50 chars avg)
 */
function hasLongBullets(slide: Slide): boolean {
  const bulletBlock = slide.blocks.find((b) => b.kind === "bullets");
  const items = bulletBlock?.items ?? [];
  if (items.length === 0) return false;
  const avgLength = items.reduce((sum, item) => sum + item.length, 0) / items.length;
  return avgLength > 50;
}

/**
 * Get main text block length for text+image slides
 */
function getTextBlockLength(slide: Slide): number {
  const textBlock = slide.blocks.find((b) => b.kind === "text");
  return textBlock?.text?.length ?? 0;
}

/**
 * Assign optimal layout variant based on slide content
 */
export function assignLayoutVariant(slide: Slide): string {
  const totalChars = countTotalChars(slide);
  const bulletCount = countBullets(slide);
  const rowCount = countTableRows(slide);

  const subtitleLength = getSubtitleLength(slide);
  const textLength = getTextBlockLength(slide);
  const longBullets = hasLongBullets(slide);

  switch (slide.type) {
    case "cover":
      // bottom_aligned: when subtitle is long, gives more room
      if (subtitleLength > 80) return "bottom_aligned";
      // centered: clean look for minimal content
      if (totalChars < 50 && subtitleLength === 0) return "centered";
      return "default";

    case "agenda":
      // numbered for many items to show count
      if (bulletCount > 5) return "numbered";
      return "default";

    case "section_header":
      // large for short, punchy titles
      if (totalChars < 40) return "large";
      // subtle for longer descriptive titles
      if (totalChars > 100) return "subtle";
      return "default";

    case "bullets":
      // two_columns: for 6+ bullets OR >500 chars total
      if (bulletCount >= 6 || totalChars > 500) return "two_columns";
      // compact: 3 or fewer items, looks clean
      if (bulletCount <= 3 && !longBullets) return "compact";
      // expanded: when bullets are text-heavy, needs breathing room
      if (longBullets) return "expanded";
      return "default";

    case "two_column_text":
      // equal split by default for balance
      return "equal";

    case "text_plus_image":
      // image_left: more text needs space on right
      if (textLength > 400) return "image_left";
      // image_right: standard for balanced content
      if (hasImage(slide)) return "image_right";
      return "default";

    case "decisions_list":
      // numbered for clarity and reference
      if (bulletCount > 3) return "numbered";
      return "icons";

    case "action_items_table":
      // compact for few rows, clean look
      if (rowCount <= 4) return "compact";
      // detailed for many rows, shows more info
      if (rowCount >= 7) return "detailed";
      return "default";

    case "summary_next_steps":
      // timeline for sequential steps, shows flow
      if (bulletCount >= 4) return "timeline";
      // numbered for actionable items
      return "numbered";

    case "quote_callout":
      // large: short, impactful quotes (tweet-length)
      if (totalChars < 100) return "large";
      // centered: medium quotes, balanced look
      if (totalChars < 200) return "centered";
      // default: longer quotes, more reading space
      return "default";

    case "timeline_roadmap": {
      // Count timeline_step blocks
      const stepCount = slide.blocks.filter((b) => b.kind === "timeline_step").length;
      // horizontal: for 2-3 steps, looks clean side-by-side
      if (stepCount <= 3) return "horizontal";
      // compact: for 6+ steps, tighter spacing
      if (stepCount >= 6) return "compact";
      // vertical: default for 4-5 steps
      return "vertical";
    }

    case "numbered_grid": {
      // Count numbered_card blocks
      const cardCount = slide.blocks.filter((b) => b.kind === "numbered_card").length;
      // 2x2: for exactly 4 cards
      if (cardCount === 4) return "2x2";
      // 3x1: for 3 cards in a row
      if (cardCount === 3) return "3x1";
      // 4x1: for 2 or fewer cards, stretch horizontally
      return "4x1";
    }

    case "icon_cards_with_image": {
      // Check if slide has an image
      const slideHasImage = slide.blocks.some((b) => b.kind === "image");
      // cards_top: no image, just cards
      if (!slideHasImage) return "cards_top";
      // cards_left: default with image on right
      return "cards_left";
    }

    case "summary_with_stats": {
      // Count stat_block blocks
      const statCount = slide.blocks.filter((b) => b.kind === "stat_block").length;
      // stats_inline: for 1-2 stats, compact inline
      if (statCount <= 2) return "stats_inline";
      // stats_bottom: for 4+ stats, row at bottom
      if (statCount >= 4) return "stats_bottom";
      // stats_right: for 3 stats, side panel
      return "stats_right";
    }

    case "hero_stats": {
      // Count stat_block blocks
      const statCount = slide.blocks.filter((b) => b.kind === "stat_block").length;
      // hero_split: for many stats, side layout
      if (statCount >= 4) return "hero_split";
      // hero_background: for 1-2 stats, dramatic look
      if (statCount <= 2) return "hero_background";
      // hero_top: default for 3 stats
      return "hero_top";
    }

    case "split_with_callouts": {
      // Check if slide has an image
      const slideHasImage = slide.blocks.some((b) => b.kind === "image");
      // image_right: alternate layout
      if (!slideHasImage) return "image_right";
      // image_left: default with image on left
      return "image_left";
    }

    case "person_spotlight": {
      // Count bullets for bio content
      const bulletCount = slide.blocks.filter((b) => b.kind === "bullets").length;
      // side_by_side: for lots of bio content
      if (bulletCount > 0 && totalChars > 300) return "side_by_side";
      // centered: clean minimal look
      return "centered";
    }

    default:
      return "default";
  }
}

/**
 * Phase 7 Sprint 4: Slides that benefit from left/right alternation
 */
const ALTERNATING_TYPES: SlideType[] = [
  "text_plus_image",
  "split_with_callouts",
  "icon_cards_with_image",
];

/**
 * Phase 7 Sprint 4: Opposite variant mappings for alternation
 */
const OPPOSITE_VARIANTS: Record<string, string> = {
  image_left: "image_right",
  image_right: "image_left",
  cards_left: "cards_right",
  cards_right: "cards_left",
  text_left: "text_right",
  text_right: "text_left",
};

/**
 * Phase 7 Sprint 4: Select variant with alternation for consecutive same-type slides
 */
function selectWithAlternation(
  candidates: string[],
  context: LayoutContext,
  slideType: SlideType
): string | null {
  // Only alternate if previous slide was same type
  if (context.previousType !== slideType) {
    return null;
  }

  // Check if previous variant has an opposite
  if (context.previousVariant) {
    const opposite = OPPOSITE_VARIANTS[context.previousVariant];
    if (opposite && candidates.includes(opposite)) {
      return opposite;
    }
  }

  return null;
}

/**
 * Phase 7 Sprint 4: Select variant avoiding recently used ones
 */
function selectWithVariation(
  candidates: string[],
  context: LayoutContext,
  slideType: SlideType,
  contentBasedChoice: string
): string {
  const recentlyUsed = context.usedVariants.get(slideType) ?? [];

  // If content-based choice hasn't been used recently, use it
  if (!recentlyUsed.includes(contentBasedChoice)) {
    return contentBasedChoice;
  }

  // Try to find a fresh candidate
  const freshCandidates = candidates.filter((v) => !recentlyUsed.includes(v));
  if (freshCandidates.length > 0) {
    // Pick first fresh candidate (deterministic)
    return freshCandidates[0];
  }

  // All have been used recently, fall back to content-based
  return contentBasedChoice;
}

/**
 * Phase 7 Sprint 4: Context-aware layout variant assignment
 * Uses LayoutContext to provide variation and avoid monotony
 */
export function assignLayoutVariantWithContext(
  slide: Slide,
  context: LayoutContext
): string {
  const variants = LAYOUT_VARIANTS[slide.type] ?? ["default"];

  // First, get the content-based choice (existing logic)
  const contentBasedChoice = assignLayoutVariant(slide);

  // For alternating types, check if we should flip
  if (ALTERNATING_TYPES.includes(slide.type)) {
    const alternateChoice = selectWithAlternation(variants, context, slide.type);
    if (alternateChoice) {
      return alternateChoice;
    }
  }

  // For all types, try to add variation
  return selectWithVariation(variants, context, slide.type, contentBasedChoice);
}

/**
 * Assign layout variants to all slides in a deck
 */
export function assignLayoutVariants(slides: Slide[]): Slide[] {
  return slides.map((slide) => ({
    ...slide,
    layoutVariant: assignLayoutVariant(slide),
  }));
}

/**
 * Phase 7 Sprint 4: Assign layout variants with context tracking
 * Provides variation across the deck and alternation for image slides
 */
export function assignLayoutVariantsWithContext(slides: Slide[]): Slide[] {
  const context = createLayoutContext(slides.length);
  const result: Slide[] = [];

  for (const slide of slides) {
    const variant = assignLayoutVariantWithContext(slide, context);
    result.push({
      ...slide,
      layoutVariant: variant,
    });
    updateLayoutContext(context, slide.type, variant);
  }

  return result;
}
