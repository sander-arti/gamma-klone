/**
 * DecisionsListSlide Component
 *
 * Premium decisions list with checkmark cards.
 * Layout variants: default (cards), numbered, icons
 *
 * Updated in Punkt 7: Premium card layout for Gamma-level design.
 */

import type { Slide } from "@/lib/schemas/slide";
import { Check } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer } from "../blocks";

interface DecisionsListSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
}

/**
 * Decision card with checkmark indicator
 */
function DecisionCard({ item, index }: { item: string; index: number }) {
  return (
    <div
      className="group relative animate-fade-in-up"
      style={{
        animationDelay: `${index * 50}ms`,
        padding: "clamp(1rem, 2cqw, 1.5rem)",
        background: "var(--theme-color-surface, rgba(255, 255, 255, 0.7))",
        borderRadius: "var(--theme-radius-lg, 12px)",
        border: "1px solid var(--theme-color-border-subtle, rgba(0, 0, 0, 0.06))",
        boxShadow:
          "var(--theme-effects-shadow-card, 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03))",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: "clamp(0.75rem, 1.2cqw, 1rem)",
      }}
    >
      {/* Checkmark indicator */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: "clamp(2rem, 3cqw, 2.5rem)",
          height: "clamp(2rem, 3cqw, 2.5rem)",
          background:
            "var(--theme-effects-gradient-success, linear-gradient(135deg, #10b981 0%, #059669 100%))",
          borderRadius: "50%",
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
        }}
      >
        <Check size={16} style={{ color: "#ffffff" }} strokeWidth={3} />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          fontSize: "var(--theme-typography-body-size, clamp(0.9375rem, 1.4cqw, 1.0625rem))",
          lineHeight: "var(--theme-typography-body-line-height, 1.6)",
          color: "var(--theme-color-foreground, #0f172a)",
          paddingTop: "0.25rem",
        }}
      >
        {item}
      </div>
    </div>
  );
}

export function DecisionsListSlide({
  slide,
  editable = false,
  slideIndex = 0,
}: DecisionsListSlideProps) {
  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const bulletsBlockIndex = slide.blocks.findIndex((b) => b.kind === "bullets");

  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;
  const bulletsBlock = bulletsBlockIndex >= 0 ? slide.blocks[bulletsBlockIndex] : null;

  const items = bulletsBlock?.items || [];
  const bulletCount = items.length;
  const isContentLight = bulletCount <= 5;

  // Container style
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    maxWidth: "100%",
  };

  // Title section styling
  const titleSectionStyle: React.CSSProperties = {
    marginBottom: "var(--theme-spacing-section-gap, clamp(1.5rem, 3cqw, 2.5rem))",
    flexShrink: 0,
  };

  // Grid layout - decisions look good in 2 columns
  const columnCount = bulletCount <= 3 ? 1 : 2;

  const gridContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: columnCount === 1 ? "1fr" : `repeat(${columnCount}, 1fr)`,
    gap: "clamp(0.875rem, 1.5cqw, 1.25rem)",
    flex: 1,
    alignContent: "start",
  };

  return (
    <SlideLayout contentAlign="top" spacious={isContentLight}>
      <div style={containerStyle}>
        {titleBlock && (
          <div style={titleSectionStyle}>
            <SmartBlockRenderer
              block={titleBlock}
              slideIndex={slideIndex}
              blockIndex={titleBlockIndex}
              titleLevel={2}
              editable={editable}
            />
          </div>
        )}
        <div style={gridContainerStyle}>
          {items.map((item, index) => (
            <DecisionCard key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}
