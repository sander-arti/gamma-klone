/**
 * Schema exports
 *
 * Central export point for all Zod schemas used in the application.
 * These schemas validate AI output and API requests/responses.
 */

// Block schemas
export {
  BlockKind,
  BlockSchema,
  TitleBlockContent,
  TextBlockContent,
  BulletsBlockContent,
  ImageBlockContent,
  TableBlockContent,
  CalloutBlockContent,
  BlockContent,
} from "./block";
export type { Block } from "./block";

// Slide schemas
export { SlideType, SlideSchema, OutlineSlideSchema, OutlineSchema } from "./slide";
export type { Slide, OutlineSlide, Outline } from "./slide";

// Deck schemas
export {
  ThemeId,
  BrandKitSchema,
  DeckMetaSchema,
  DeckSchema,
  GenerationRequestSchema,
  GenerationResponseSchema,
} from "./deck";
export type {
  ThemeId as ThemeIdType,
  BrandKit,
  DeckMeta,
  Deck,
  GenerationRequest,
  GenerationResponse,
} from "./deck";
