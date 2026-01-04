/**
 * GoldenSlideRenderer Component
 *
 * Renders pixel-perfect Golden Template slides.
 * Forces hardcoded layouts and applies golden.css styling.
 *
 * Unlike the standard SlideRenderer which uses dynamic theming,
 * this renderer uses fixed pixel values for Gamma-identical results.
 */

"use client";

import type { Slide } from "@/lib/schemas/slide";
import type { GoldenSlideType, GoldenTemplateId, SlotContent } from "@/lib/templates/types";

// Import golden.css for pixel-perfect styling
import "@/styles/golden.css";

// Golden slide components (to be created)
import { GoldenCoverSlide } from "./GoldenCoverSlide";
import { GoldenStatsSlide } from "./GoldenStatsSlide";
import { GoldenContentSlide } from "./GoldenContentSlide";
import { GoldenBulletsSlide } from "./GoldenBulletsSlide";
import { GoldenCTASlide } from "./GoldenCTASlide";

export interface GoldenSlideRendererProps {
  /** The slide data */
  slide: Slide;
  /** Template ID for context */
  templateId: GoldenTemplateId;
  /** Slot position in the template (1-indexed) */
  slotPosition: number;
  /** Golden slide type (overrides slide.type) */
  goldenSlideType: GoldenSlideType;
  /** Generated content for this slot */
  slotContent?: SlotContent;
  /** Enable editing (limited in golden mode) */
  editable?: boolean;
  /** Slide index for editing context */
  slideIndex?: number;
}

/**
 * Renders a Golden Template slide with pixel-perfect styling.
 *
 * Key differences from standard SlideRenderer:
 * 1. Uses golden.css with hardcoded pixel values
 * 2. Ignores slide.type, uses goldenSlideType instead
 * 3. Adds data-golden attribute for CSS targeting
 * 4. No dynamic theming - fixed Gamma-identical appearance
 */
export function GoldenSlideRenderer({
  slide,
  templateId,
  slotPosition,
  goldenSlideType,
  slotContent,
  editable = false,
  slideIndex = 0,
}: GoldenSlideRendererProps) {
  // Render the appropriate golden slide component
  const renderGoldenSlide = () => {
    switch (goldenSlideType) {
      case "cover":
        return (
          <GoldenCoverSlide
            slide={slide}
            slotContent={slotContent}
            editable={editable}
            slideIndex={slideIndex}
          />
        );

      case "stats":
        return (
          <GoldenStatsSlide
            slide={slide}
            slotContent={slotContent}
            editable={editable}
            slideIndex={slideIndex}
          />
        );

      case "content":
        return (
          <GoldenContentSlide
            slide={slide}
            slotContent={slotContent}
            editable={editable}
            slideIndex={slideIndex}
          />
        );

      case "bullets":
        return (
          <GoldenBulletsSlide
            slide={slide}
            slotContent={slotContent}
            editable={editable}
            slideIndex={slideIndex}
          />
        );

      case "cta":
        return (
          <GoldenCTASlide
            slide={slide}
            slotContent={slotContent}
            editable={editable}
            slideIndex={slideIndex}
          />
        );

      // Future slide types
      case "icon_grid":
      case "timeline":
      case "checklist":
      case "numbered_steps":
      case "circle_diagram":
        return (
          <div className="golden-slide" data-golden-type={goldenSlideType}>
            <div className="flex items-center justify-center h-full">
              <p className="text-lg text-gray-500">Golden {goldenSlideType} slide coming soon</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="golden-slide">
            <div className="flex items-center justify-center h-full">
              <p className="text-lg text-gray-500">Unknown golden slide type: {goldenSlideType}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="golden-slides"
      data-golden="true"
      data-golden-template={templateId}
      data-golden-slot={slotPosition}
      data-golden-type={goldenSlideType}
    >
      {renderGoldenSlide()}
    </div>
  );
}

/**
 * Check if a deck should use golden rendering
 */
export function isGoldenDeck(templateId?: string): templateId is GoldenTemplateId {
  return (
    templateId === "executive_brief" ||
    templateId === "feature_showcase" ||
    templateId === "project_update"
  );
}
