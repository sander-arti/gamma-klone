/**
 * Deck Composer - Automatic deck structuring
 *
 * Post-processes outline before content generation to ensure
 * professional presentation structure:
 * - Cover slide first
 * - Agenda after cover (if >5 slides)
 * - Summary at the end
 */

import type { Outline, OutlineSlide, SlideType } from "@/lib/schemas/slide";

/**
 * Options for deck composition
 */
export interface ComposerOptions {
  /** Ensure cover slide exists (default: true) */
  ensureCover?: boolean;
  /** Add agenda slide if many slides (default: true) */
  ensureAgenda?: boolean;
  /** Ensure summary slide at end (default: true) */
  ensureSummary?: boolean;
  /** Minimum slides before adding agenda (default: 5) */
  maxSlidesWithoutAgenda?: number;
}

/**
 * Compose deck by adding structural slides
 *
 * IDEMPOTENT: Safe to call multiple times - checks for existing structural slides
 * anywhere in the outline, not just at expected positions.
 */
export function composeDeck(outline: Outline, options: ComposerOptions = {}): Outline {
  const {
    ensureCover = true,
    ensureAgenda = true,
    ensureSummary = true,
    maxSlidesWithoutAgenda = 5,
  } = options;

  let slides = [...outline.slides];

  // 1. Ensure cover slide exists
  // IDEMPOTENT: Check if ANY slide is a cover (not just first position)
  if (ensureCover && !hasCoverAnywhere(slides)) {
    slides = [createCoverSlide(outline.title), ...slides];
  } else if (ensureCover && !isCoverFirst(slides)) {
    // Cover exists but not first - move it to first position
    const coverIndex = slides.findIndex((s) => s.suggestedType === "cover");
    if (coverIndex > 0) {
      const cover = slides[coverIndex];
      slides.splice(coverIndex, 1);
      slides = [cover, ...slides];
    }
  }

  // 2. Add agenda after cover if many slides
  // IDEMPOTENT: Check if ANY slide is agenda
  if (ensureAgenda && slides.length > maxSlidesWithoutAgenda && !hasAgenda(slides)) {
    const agendaSlide = createAgendaSlide(slides);
    // Insert after cover (index 1)
    slides = [slides[0], agendaSlide, ...slides.slice(1)];
  }

  // 3. Ensure summary at the end
  // IDEMPOTENT: Check if ANY slide is a summary type
  if (ensureSummary && !hasSummaryAnywhere(slides)) {
    slides = [...slides, createSummarySlide()];
  } else if (ensureSummary && !isSummaryLast(slides)) {
    // Summary exists but not last - move it to last position
    const summaryIndex = slides.findIndex(
      (s) => s.suggestedType === "summary_next_steps" || s.suggestedType === "quote_callout"
    );
    if (summaryIndex >= 0 && summaryIndex < slides.length - 1) {
      const summary = slides[summaryIndex];
      slides.splice(summaryIndex, 1);
      slides = [...slides, summary];
    }
  }

  return { ...outline, slides };
}

/**
 * Check if ANY slide is a cover (idempotent check)
 */
function hasCoverAnywhere(slides: OutlineSlide[]): boolean {
  return slides.some((s) => s.suggestedType === "cover");
}

/**
 * Check if FIRST slide is a cover
 */
function isCoverFirst(slides: OutlineSlide[]): boolean {
  return slides[0]?.suggestedType === "cover";
}

/**
 * Legacy: Check if outline has a cover slide first (for getComposerStats)
 */
function hasCover(slides: OutlineSlide[]): boolean {
  return slides[0]?.suggestedType === "cover";
}

/**
 * Check if outline has an agenda slide
 */
function hasAgenda(slides: OutlineSlide[]): boolean {
  return slides.some((s) => s.suggestedType === "agenda");
}

/**
 * Check if ANY slide is a summary type (idempotent check)
 */
function hasSummaryAnywhere(slides: OutlineSlide[]): boolean {
  return slides.some(
    (s) => s.suggestedType === "summary_next_steps" || s.suggestedType === "quote_callout"
  );
}

/**
 * Check if LAST slide is a summary
 */
function isSummaryLast(slides: OutlineSlide[]): boolean {
  const last = slides[slides.length - 1];
  return last?.suggestedType === "summary_next_steps" || last?.suggestedType === "quote_callout";
}

/**
 * Legacy: Check if outline ends with a summary (for getComposerStats)
 */
function hasSummary(slides: OutlineSlide[]): boolean {
  const last = slides[slides.length - 1];
  return last?.suggestedType === "summary_next_steps" || last?.suggestedType === "quote_callout";
}

/**
 * Create a cover slide from the outline title
 */
function createCoverSlide(title: string): OutlineSlide {
  return {
    title,
    suggestedType: "cover",
    hints: ["Hovedtittel", "Undertittel eller dato"],
  };
}

/**
 * Create an agenda slide from the content slides
 */
function createAgendaSlide(slides: OutlineSlide[]): OutlineSlide {
  // Get content slides (not cover, agenda, or summary)
  const structuralTypes: SlideType[] = ["cover", "agenda", "summary_next_steps", "section_header"];

  const contentSlides = slides.filter(
    (s) => !structuralTypes.includes(s.suggestedType ?? "bullets")
  );

  // Take first 3 titles as hints (max allowed)
  const hints = contentSlides
    .slice(0, 3)
    .map((s) => s.title)
    .filter((t) => t.length < 100);

  return {
    title: "Agenda",
    suggestedType: "agenda",
    hints: hints.length > 0 ? hints : ["Oversikt over presentasjonen"],
  };
}

/**
 * Create a summary slide
 */
function createSummarySlide(): OutlineSlide {
  return {
    title: "Oppsummering og neste steg",
    suggestedType: "summary_next_steps",
    hints: ["Hovedkonklusjoner", "Neste steg", "Ansvarlige"],
  };
}

/**
 * Get stats about what the composer added
 */
export function getComposerStats(
  original: Outline,
  composed: Outline
): {
  addedCover: boolean;
  addedAgenda: boolean;
  addedSummary: boolean;
  slidesAdded: number;
} {
  const addedCover = !hasCover(original.slides) && hasCover(composed.slides);
  const addedAgenda = !hasAgenda(original.slides) && hasAgenda(composed.slides);
  const addedSummary = !hasSummary(original.slides) && hasSummary(composed.slides);

  return {
    addedCover,
    addedAgenda,
    addedSummary,
    slidesAdded: composed.slides.length - original.slides.length,
  };
}
