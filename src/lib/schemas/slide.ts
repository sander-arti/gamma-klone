import { z } from "zod";
import { BlockSchema } from "./block";

/**
 * Slide types supported in MVP (PRD §5.3 FR-4)
 *
 * 1. cover - Title slide
 * 2. agenda - Agenda/overview
 * 3. section_header - Section divider
 * 4. bullets - Bullet point list
 * 5. two_column_text - Two columns of text
 * 6. text_plus_image - Text with accompanying image
 * 7. decisions_list - List of decisions
 * 8. action_items_table - Table of action items (task/owner/deadline)
 * 9. summary_next_steps - Summary with next steps
 * 10. quote_callout - Quote or callout (optional in MVP)
 * 11. timeline_roadmap - Project phases/milestones timeline (Phase 7)
 * 12. numbered_grid - Grid of numbered cards (Phase 7 Sprint 4)
 * 13. icon_cards_with_image - Icon cards with optional image (Phase 7 Sprint 4)
 * 14. summary_with_stats - Summary with stat blocks (Phase 7 Sprint 4)
 * 15. hero_stats - Hero image with prominent stats (Premium)
 * 16. split_with_callouts - 50/50 split with callout cards (Premium)
 * 17. person_spotlight - Person profile/spotlight slide (Premium)
 */
export const SlideType = z.enum([
  "cover",
  "agenda",
  "section_header",
  "bullets",
  "two_column_text",
  "text_plus_image",
  "decisions_list",
  "action_items_table",
  "summary_next_steps",
  "quote_callout",
  "timeline_roadmap",
  "numbered_grid",
  "icon_cards_with_image",
  "summary_with_stats",
  "hero_stats",
  "split_with_callouts",
  "person_spotlight",
]);
export type SlideType = z.infer<typeof SlideType>;

/**
 * Layout variants per slide type
 */
export const LayoutVariant = z.string().default("default");

/**
 * Cover slide layout variants (Phase 8: Premium Cover Designs)
 *
 * - cinematic: Full-bleed image with dramatic gradient overlay, large title at bottom
 * - editorial: Split layout - text on left, image on right (magazine-style)
 * - minimal: Text-only with subtle background gradient, clean and focused
 * - centered: Centered text over image with vignette effect
 * - split_diagonal: Diagonal split between solid color and image
 * - gradient_only: Rich gradient background without image, bold typography
 */
export const CoverLayoutVariant = z
  .enum(["cinematic", "editorial", "minimal", "centered", "split_diagonal", "gradient_only"])
  .default("cinematic");

export type CoverLayoutVariant = z.infer<typeof CoverLayoutVariant>;

/**
 * Bullets slide layout variants
 *
 * - default: Standard vertical list (legacy)
 * - compact: Tighter spacing for more items
 * - expanded: More breathing room per item
 * - two_columns: Split into two columns
 * - grid: 2-3 column grid with card styling (Premium)
 * - cards: Feature cards with icons/numbers (Premium)
 */
export const BulletsLayoutVariant = z
  .enum(["default", "compact", "expanded", "two_columns", "grid", "cards"])
  .default("grid"); // Default to grid for premium look

export type BulletsLayoutVariant = z.infer<typeof BulletsLayoutVariant>;

/**
 * Slide schema - a single slide in a deck
 */
export const SlideSchema = z.object({
  type: SlideType,
  layoutVariant: LayoutVariant.optional(),
  blocks: z.array(BlockSchema),
});

export type Slide = z.infer<typeof SlideSchema>;

/**
 * Outline slide - simplified version for outline generation
 */
export const OutlineSlideSchema = z.object({
  title: z.string().min(1).max(100),
  hints: z.array(z.string().max(100)).max(3).optional(),
  suggestedType: SlideType.optional(),
});

export type OutlineSlide = z.infer<typeof OutlineSlideSchema>;

/**
 * Lenient outline slide schema for LLM parsing
 * (allows more hints, which are then truncated during sanitization)
 */
export const OutlineSlideLenientSchema = z.object({
  title: z.string().min(1).max(200), // Allow slightly longer titles
  hints: z.array(z.string().max(200)).max(10).optional(), // Allow more hints
  suggestedType: SlideType.optional(),
});

/**
 * Outline schema - the outline generated before full deck
 */
export const OutlineSchema = z.object({
  title: z.string().min(1).max(100),
  slides: z.array(OutlineSlideSchema).min(1).max(30),
});

/**
 * Lenient outline schema for LLM parsing
 */
export const OutlineLenientSchema = z.object({
  title: z.string().min(1).max(200),
  slides: z.array(OutlineSlideLenientSchema).min(1).max(50),
});

export type Outline = z.infer<typeof OutlineSchema>;

/**
 * Sanitize outline to meet strict schema constraints
 */
export function sanitizeOutline(raw: z.infer<typeof OutlineLenientSchema>): Outline {
  return {
    title: raw.title.slice(0, 100),
    slides: raw.slides.slice(0, 30).map((slide) => ({
      title: slide.title.slice(0, 100),
      hints: slide.hints?.slice(0, 3).map((h) => h.slice(0, 100)),
      suggestedType: slide.suggestedType,
    })),
  };
}
