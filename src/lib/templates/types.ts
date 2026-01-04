/**
 * Golden Templates Type Definitions
 *
 * These types define pixel-perfect, hardcoded templates
 * where AI fills content but NEVER decides structure/layout.
 */

/**
 * Available golden template IDs
 */
export type GoldenTemplateId =
  | "executive_brief"
  | "feature_showcase"
  | "project_update";

/**
 * Slide types available in golden templates
 * Each has a dedicated pixel-perfect component
 */
export type GoldenSlideType =
  | "cover"           // Hero title + background image
  | "stats"           // 3 horizontal statistics
  | "content"         // 60/40 text + image split
  | "bullets"         // 4-5 bullet points
  | "cta"             // Call to action ending
  | "icon_grid"       // 2x2 icon feature grid
  | "timeline"        // Horizontal or vertical timeline
  | "checklist"       // Checkboxes + image
  | "numbered_steps"  // Numbered cards with pink border
  | "circle_diagram"; // 4 elements around center circle

/**
 * Content constraints for a slot
 * AI must respect these limits
 */
export interface SlotConstraints {
  /** Title max characters */
  titleMaxChars?: number;
  /** Subtitle/body max characters */
  bodyMaxChars?: number;
  /** Exact number of items required (stats, bullets, steps) */
  itemCount?: number;
  /** Min items allowed */
  itemCountMin?: number;
  /** Max items allowed */
  itemCountMax?: number;
  /** Max characters per item */
  itemMaxChars?: number;
  /** Whether an image is required */
  requiresImage?: boolean;
  /** Image aspect ratio hint */
  imageAspect?: "16:9" | "4:3" | "1:1" | "3:4";
  /** Image style hint for AI generation */
  imageStyle?: string;
}

/**
 * A single slot in a golden template
 * Represents one slide with fixed type and constraints
 */
export interface GoldenSlot {
  /** Position in deck (1-indexed for display) */
  position: number;
  /** Fixed slide type - never changed by AI */
  slideType: GoldenSlideType;
  /** Layout variant for the slide type */
  layoutVariant?: string;
  /** Content purpose description (for AI prompt) */
  purpose: string;
  /** Content constraints AI must follow */
  constraints: SlotConstraints;
  /** Example content (for AI guidance) */
  example?: {
    title?: string;
    body?: string;
    items?: string[];
  };
}

/**
 * A complete golden template definition
 */
export interface GoldenTemplate {
  /** Unique template identifier */
  id: GoldenTemplateId;
  /** Display name */
  name: string;
  /** Description for template selection */
  description: string;
  /** Ideal use cases */
  useCases: string[];
  /** Fixed number of slides */
  slideCount: number;
  /** Ordered slot definitions */
  slots: GoldenSlot[];
  /** Default theme (always uses golden styling) */
  defaultTheme: "golden";
}

/**
 * Content generated for a single slot
 */
export interface SlotContent {
  /** Slot position this content is for */
  position: number;
  /** Title text */
  title?: string;
  /** Body/subtitle text */
  body?: string;
  /** Array of items (bullets, stats, steps) */
  items?: Array<{
    text?: string;     // For bullets, steps (optional for stats which use value/label)
    value?: string;    // For stats
    label?: string;    // For stats
    sublabel?: string; // For stats
    icon?: string;     // For icon cards
    description?: string;
  }>;
  /** Generated image URL */
  imageUrl?: string;
  /** Image alt text */
  imageAlt?: string;
}

/**
 * Complete content for a golden template deck
 */
export interface GoldenDeckContent {
  /** Template used */
  templateId: GoldenTemplateId;
  /** Deck title (from cover slide) */
  title: string;
  /** Content for each slot */
  slots: SlotContent[];
  /** Generation metadata */
  metadata: {
    generatedAt: string;
    inputSummary: string;
  };
}

/**
 * Request to generate content for a golden template
 */
export interface GoldenGenerationRequest {
  /** Which template to use */
  templateId: GoldenTemplateId;
  /** User's input text/notes */
  inputText: string;
  /** Optional: specific title override */
  titleOverride?: string;
  /** Optional: tone/style hints */
  tone?: "professional" | "casual" | "inspirational";
  /** Optional: language (default: "no" for Norwegian) */
  language?: string;
}
