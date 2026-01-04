/**
 * Slides Module
 *
 * Exports all slide components for rendering presentation slides.
 * Each slide type has its own component with layout variant support.
 */

// Main factory component
export { SlideRenderer } from "./SlideRenderer";

// Base layout wrapper
export { SlideLayout } from "./SlideLayout";

// Individual slide components
export { CoverSlide } from "./CoverSlide";
export { AgendaSlide } from "./AgendaSlide";
export { SectionHeaderSlide } from "./SectionHeaderSlide";
export { BulletsSlide } from "./BulletsSlide";
export { TwoColumnTextSlide } from "./TwoColumnTextSlide";
export { TextPlusImageSlide } from "./TextPlusImageSlide";
export { DecisionsListSlide } from "./DecisionsListSlide";
export { ActionItemsTableSlide } from "./ActionItemsTableSlide";
export { SummaryNextStepsSlide } from "./SummaryNextStepsSlide";
export { QuoteCalloutSlide } from "./QuoteCalloutSlide";
export { TimelineRoadmapSlide } from "./TimelineRoadmapSlide";
export { NumberedGridSlide } from "./NumberedGridSlide";
export { IconCardsWithImageSlide } from "./IconCardsWithImageSlide";
export { SummaryWithStatsSlide } from "./SummaryWithStatsSlide";
