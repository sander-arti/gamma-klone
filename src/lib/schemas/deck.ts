import { z } from "zod";
import { SlideSchema, OutlineSchema } from "./slide";

/**
 * Golden Template IDs (Phase 8)
 * Pixel-perfect templates with fixed structure
 */
export const GoldenTemplateId = z.enum(["executive_brief", "feature_showcase", "project_update"]);
export type GoldenTemplateId = z.infer<typeof GoldenTemplateId>;

/**
 * Theme IDs supported in MVP (PRD §5.4 FR-5)
 */
export const ThemeId = z.enum([
  "nordic_minimalism",
  "nordic_light",
  "nordic_dark",
  "corporate_blue",
  "minimal_warm",
  "modern_contrast",
]);
export type ThemeId = z.infer<typeof ThemeId>;

/**
 * Brand kit schema (PRD §5.4 FR-6)
 */
export const BrandKitSchema = z.object({
  logoUrl: z.string().url().optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export type BrandKit = z.infer<typeof BrandKitSchema>;

/**
 * Deck metadata schema
 */
export const DeckMetaSchema = z.object({
  title: z.string().min(1).max(200),
  language: z.string().default("no"),
  themeId: ThemeId.default("nordic_light"),
  brandKit: BrandKitSchema.optional(),
});

export type DeckMeta = z.infer<typeof DeckMetaSchema>;

/**
 * Complete deck schema - the AI output structure (PRD §7.2)
 */
export const DeckSchema = z.object({
  deck: DeckMetaSchema,
  slides: z.array(SlideSchema).min(1).max(50),
});

export type Deck = z.infer<typeof DeckSchema>;

/**
 * Generation request schema (PRD §6.2)
 */
/**
 * Image art style options for AI image generation
 */
export const ImageArtStyle = z.enum([
  "photo",
  "illustration",
  "abstract",
  "3d",
  "line_art",
  "custom",
]);
export type ImageArtStyle = z.infer<typeof ImageArtStyle>;

/**
 * Generation request schema (PRD §6.2)
 *
 * Freeform-first: outline is optional. If not provided, the pipeline will
 * generate an outline inline before generating slide content.
 */
export const GenerationRequestSchema = z.object({
  inputText: z.string().min(1).max(50000),
  textMode: z.enum(["generate", "condense", "preserve"]),
  language: z.string().default("no"),
  tone: z.string().optional(),
  audience: z.string().optional(),
  amount: z.enum(["brief", "medium", "detailed"]).default("medium"),
  numSlides: z.number().int().min(1).max(50).optional(),
  themeId: ThemeId.optional(),
  imageMode: z.enum(["none", "ai"]).default("none"),
  imageStyle: z
    .enum(["photorealistic", "illustration", "minimalist", "isometric", "editorial", "default"])
    .optional(),
  // New fields for Prompt Editor
  additionalInstructions: z.string().max(1000).optional(),
  imageArtStyle: ImageArtStyle.optional(),
  imageKeywords: z.string().max(200).optional(),
  exportAs: z.array(z.enum(["pdf", "pptx"])).optional(),
  // Phase 8: Golden Templates
  templateId: GoldenTemplateId.optional(),
  // Freeform-first: outline is optional - if not provided, pipeline generates it inline
  outline: OutlineSchema.optional(),
});

export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

/**
 * Generation response schema (PRD §6.2)
 */
export const GenerationResponseSchema = z.object({
  generationId: z.string(),
  status: z.enum(["queued", "running", "completed", "failed"]),
  progress: z.number().int().min(0).max(100).optional(),
  viewUrl: z.string().url().optional(),
  pdfUrl: z.string().url().optional(),
  pptxUrl: z.string().url().optional(),
  expiresAt: z.string().datetime().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;

// Re-export for convenience
export { OutlineSchema } from "./slide";
export type { Outline } from "./slide";
