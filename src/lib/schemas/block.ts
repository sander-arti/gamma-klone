import { z } from "zod";

/**
 * Block types supported in MVP (PRD §7.3)
 * Extended in Phase 7 with stat_block, timeline_step, icon_card, numbered_card for Gamma-level design
 */
export const BlockKind = z.enum([
  "title",
  "text",
  "bullets",
  "image",
  "table",
  "callout",
  "stat_block",
  "timeline_step",
  "icon_card",
  "numbered_card",
]);
export type BlockKind = z.infer<typeof BlockKind>;

/**
 * Title block - main heading text
 */
export const TitleBlockContent = z.object({
  text: z.string().min(1).max(120),
});

/**
 * Text block - paragraph text
 */
export const TextBlockContent = z.object({
  text: z.string().min(1).max(500),
});

/**
 * Bullets block - list of bullet points
 */
export const BulletsBlockContent = z.object({
  items: z.array(z.string().min(1).max(150)).min(1).max(8),
});

/**
 * Image block - image with alt text
 */
export const ImageBlockContent = z.object({
  url: z.string().url(),
  alt: z.string().max(200),
  cropMode: z.enum(["cover", "contain", "fill"]).default("cover"),
});

/**
 * Table block - rows and columns
 */
export const TableBlockContent = z.object({
  columns: z.array(z.string()).min(1).max(5),
  rows: z.array(z.array(z.string())).min(1).max(10),
});

/**
 * Callout block - highlighted text
 */
export const CalloutBlockContent = z.object({
  text: z.string().min(1).max(300),
  style: z.enum(["info", "warning", "success", "quote"]).default("info"),
});

/**
 * Stat block - large statistic/metric display (Phase 7)
 * Used for highlighting key numbers like "95%", "180", "1.2M NOK"
 */
export const StatBlockContent = z.object({
  value: z.string().min(1).max(20), // The big number: "95%", "180", "1.2M"
  label: z.string().min(1).max(50), // Short label: "Ansatte", "Vekst"
  sublabel: z.string().max(100).optional(), // Additional context
});

/**
 * Timeline step block - a step in a roadmap/timeline (Phase 7)
 * Used for project phases, milestones, or sequential events
 */
export const TimelineStepBlockContent = z.object({
  step: z.number().min(1).max(10), // Step number: 1, 2, 3...
  title: z.string().min(1).max(80), // "Q1 2025" or "Phase 1"
  description: z.string().max(200).optional(), // Short description
  status: z.enum(["completed", "current", "upcoming"]).optional(), // Visual state
});

/**
 * Icon card block - card with icon, title, and description (Phase 7 Sprint 4)
 * Used for feature showcases, benefits, or categories
 */
export const IconCardBlockContent = z.object({
  icon: z.string().min(1).max(30), // Lucide icon name: "zap", "shield", "globe"
  text: z.string().min(1).max(60), // Card title
  description: z.string().max(150).optional(), // Card description
  bgColor: z.string().max(20).optional(), // Optional background color
});

/**
 * Numbered card block - card with number badge, title, and description (Phase 7 Sprint 4)
 * Used for ordered concepts, steps, or principles
 */
export const NumberedCardBlockContent = z.object({
  number: z.number().min(1).max(99), // Number badge: 1, 2, 3...
  text: z.string().min(1).max(60), // Card title
  description: z.string().max(150).optional(), // Card description
});

/**
 * Union of all block content types
 */
export const BlockContent = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("title"), ...TitleBlockContent.shape }),
  z.object({ kind: z.literal("text"), ...TextBlockContent.shape }),
  z.object({ kind: z.literal("bullets"), ...BulletsBlockContent.shape }),
  z.object({ kind: z.literal("image"), ...ImageBlockContent.shape }),
  z.object({ kind: z.literal("table"), ...TableBlockContent.shape }),
  z.object({ kind: z.literal("callout"), ...CalloutBlockContent.shape }),
  z.object({ kind: z.literal("stat_block"), ...StatBlockContent.shape }),
  z.object({ kind: z.literal("timeline_step"), ...TimelineStepBlockContent.shape }),
  z.object({ kind: z.literal("icon_card"), ...IconCardBlockContent.shape }),
  z.object({ kind: z.literal("numbered_card"), ...NumberedCardBlockContent.shape }),
]);

/**
 * Block schema - a content block within a slide
 */
export const BlockSchema = z.object({
  kind: BlockKind,
  // title, text, callout, icon_card, numbered_card
  text: z.string().optional(),
  // bullets
  items: z.array(z.string()).optional(),
  // image
  url: z.string().optional(),
  alt: z.string().optional(),
  cropMode: z.enum(["cover", "contain", "fill"]).optional(),
  // table
  columns: z.array(z.string()).optional(),
  rows: z.array(z.array(z.string())).optional(),
  // callout
  style: z.enum(["info", "warning", "success", "quote"]).optional(),
  // stat_block (Phase 7)
  value: z.string().optional(),
  label: z.string().optional(),
  sublabel: z.string().optional(),
  // timeline_step (Phase 7)
  step: z.number().optional(),
  description: z.string().optional(),
  status: z.enum(["completed", "current", "upcoming"]).optional(),
  // icon_card (Phase 7 Sprint 4)
  icon: z.string().optional(),
  bgColor: z.string().optional(),
  // numbered_card (Phase 7 Sprint 4)
  number: z.number().optional(),
});

export type Block = z.infer<typeof BlockSchema>;

// ============================================================================
// Block Kind Helpers
// ============================================================================

/**
 * Content block kinds - blocks that display textual/list content
 * These can be used interchangeably in "content slots" within slides
 * Example: A two-column slide can show text, bullets, or callouts
 */
export const CONTENT_BLOCK_KINDS: BlockKind[] = ["text", "bullets", "callout"];

/**
 * Check if a block kind is a content block
 */
export function isContentBlock(kind: BlockKind): boolean {
  return CONTENT_BLOCK_KINDS.includes(kind);
}

/**
 * Get all content block indices from a slide's blocks array
 * Useful for slide components that want to render any content block type
 */
export function getContentBlockIndices(blocks: Block[]): number[] {
  const indices: number[] = [];
  blocks.forEach((block, index) => {
    if (isContentBlock(block.kind)) {
      indices.push(index);
    }
  });
  return indices;
}
