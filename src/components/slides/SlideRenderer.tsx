/**
 * SlideRenderer Component
 *
 * Factory component that renders the appropriate slide component
 * based on slide.type. Central entry point for all slide rendering.
 * Supports editable mode for inline editing in the editor.
 */

import type { Slide } from "@/lib/schemas/slide";

import { CoverSlide } from "./CoverSlide";
import { AgendaSlide } from "./AgendaSlide";
import { SectionHeaderSlide } from "./SectionHeaderSlide";
import { BulletsSlide } from "./BulletsSlide";
import { TwoColumnTextSlide } from "./TwoColumnTextSlide";
import { TextPlusImageSlide } from "./TextPlusImageSlide";
import { DecisionsListSlide } from "./DecisionsListSlide";
import { ActionItemsTableSlide } from "./ActionItemsTableSlide";
import { SummaryNextStepsSlide } from "./SummaryNextStepsSlide";
import { QuoteCalloutSlide } from "./QuoteCalloutSlide";
import { TimelineRoadmapSlide } from "./TimelineRoadmapSlide";
import { NumberedGridSlide } from "./NumberedGridSlide";
import { IconCardsWithImageSlide } from "./IconCardsWithImageSlide";
import { SummaryWithStatsSlide } from "./SummaryWithStatsSlide";
import { HeroStatsSlide } from "./HeroStatsSlide";
import { SplitWithCalloutsSlide } from "./SplitWithCalloutsSlide";
import { PersonSpotlightSlide } from "./PersonSpotlightSlide";

interface SlideRendererProps {
  slide: Slide;
  /** Enable inline editing mode */
  editable?: boolean;
  /** Slide index in the deck (required for editable mode) */
  slideIndex?: number;
  /** Whether AI is currently generating an image for this slide */
  isImageGenerating?: boolean;
}

/**
 * Renders the appropriate slide component based on slide type.
 *
 * Supported slide types:
 * - cover: Title slide with optional subtitle
 * - agenda: List of agenda items
 * - section_header: Section divider slide
 * - bullets: Bullet point content slide
 * - two_column_text: Two-column text layout
 * - text_plus_image: Text with accompanying image
 * - decisions_list: List of key decisions
 * - action_items_table: Task/owner/deadline table
 * - summary_next_steps: Summary with next steps
 * - quote_callout: Quote or callout slide
 * - timeline_roadmap: Timeline/roadmap with steps (Phase 7)
 * - numbered_grid: Grid of numbered cards (Phase 7 Sprint 4)
 * - icon_cards_with_image: Icon cards with optional image (Phase 7 Sprint 4)
 * - summary_with_stats: Summary text with stat blocks (Phase 7 Sprint 4)
 * - hero_stats: Hero image with prominent stats (Premium)
 * - split_with_callouts: 50/50 split with callout cards (Premium)
 * - person_spotlight: Person profile/spotlight slide (Premium)
 */
export function SlideRenderer({
  slide,
  editable = false,
  slideIndex = 0,
  isImageGenerating = false,
}: SlideRendererProps) {
  switch (slide.type) {
    case "cover":
      return <CoverSlide slide={slide} editable={editable} slideIndex={slideIndex} />;

    case "agenda":
      return <AgendaSlide slide={slide} editable={editable} slideIndex={slideIndex} />;

    case "section_header":
      return <SectionHeaderSlide slide={slide} editable={editable} slideIndex={slideIndex} />;

    case "bullets":
      return <BulletsSlide slide={slide} editable={editable} slideIndex={slideIndex} />;

    case "two_column_text":
      return <TwoColumnTextSlide slide={slide} editable={editable} slideIndex={slideIndex} />;

    case "text_plus_image":
      return <TextPlusImageSlide slide={slide} editable={editable} slideIndex={slideIndex} isImageGenerating={isImageGenerating} />;

    case "decisions_list":
      return <DecisionsListSlide slide={slide} editable={editable} slideIndex={slideIndex} />;

    case "action_items_table":
      return <ActionItemsTableSlide slide={slide} editable={editable} slideIndex={slideIndex} />;

    case "summary_next_steps":
      return <SummaryNextStepsSlide slide={slide} editable={editable} slideIndex={slideIndex} />;

    case "quote_callout":
      return <QuoteCalloutSlide slide={slide} editable={editable} slideIndex={slideIndex} />;

    case "timeline_roadmap":
      return <TimelineRoadmapSlide slide={slide} editable={editable} slideIndex={slideIndex} />;

    case "numbered_grid":
      return <NumberedGridSlide slide={slide} editable={editable} slideIndex={slideIndex} />;

    case "icon_cards_with_image":
      return <IconCardsWithImageSlide slide={slide} editable={editable} slideIndex={slideIndex} isImageGenerating={isImageGenerating} />;

    case "summary_with_stats":
      return <SummaryWithStatsSlide slide={slide} editable={editable} slideIndex={slideIndex} />;

    case "hero_stats":
      return <HeroStatsSlide slide={slide} editable={editable} slideIndex={slideIndex} isImageGenerating={isImageGenerating} />;

    case "split_with_callouts":
      return <SplitWithCalloutsSlide slide={slide} editable={editable} slideIndex={slideIndex} isImageGenerating={isImageGenerating} />;

    case "person_spotlight":
      return <PersonSpotlightSlide slide={slide} editable={editable} slideIndex={slideIndex} isImageGenerating={isImageGenerating} />;

    default: {
      // Type-safe exhaustive check
      const _exhaustiveCheck: never = slide.type;
      console.warn(`Unknown slide type: ${_exhaustiveCheck}`);
      return (
        <div
          className="flex items-center justify-center h-full"
          style={{ backgroundColor: 'var(--theme-color-background-subtle, #f8fafc)' }}
        >
          <p style={{ color: 'var(--theme-color-foreground-muted, #475569)' }}>
            Unknown slide type: {slide.type}
          </p>
        </div>
      );
    }
  }
}
