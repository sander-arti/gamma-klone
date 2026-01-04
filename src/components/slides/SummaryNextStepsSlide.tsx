/**
 * SummaryNextStepsSlide Component
 *
 * Premium summary/next steps slide with action-oriented cards.
 * Layout variants: default (cards), numbered, timeline
 *
 * Updated in Punkt 7: Premium card grid layout for Gamma-level design.
 */

import type { Slide } from "@/lib/schemas/slide";
import { ArrowRight } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer } from "../blocks";

interface SummaryNextStepsSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
}

/**
 * Premium action card for next steps
 * Features arrow icon to indicate actionable items
 */
function NextStepCard({ item, index }: { item: string; index: number }) {
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
      {/* Arrow indicator */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: "clamp(2rem, 3cqw, 2.5rem)",
          height: "clamp(2rem, 3cqw, 2.5rem)",
          background:
            "var(--theme-effects-gradient-primary, linear-gradient(135deg, var(--theme-color-primary, #3b82f6) 0%, var(--theme-color-accent-purple, #6366f1) 100%))",
          borderRadius: "50%",
          boxShadow: "var(--theme-effects-shadow-blue, 0 2px 8px rgba(59, 130, 246, 0.25))",
        }}
      >
        <ArrowRight size={16} style={{ color: "var(--theme-color-primary-foreground, #ffffff)" }} />
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

/**
 * Numbered step card with arrow - used for grid layouts
 */
function NumberedStepCard({ item, index }: { item: string; index: number }) {
  return (
    <div
      className="group relative animate-fade-in-up"
      style={{
        animationDelay: `${index * 50}ms`,
        padding: "clamp(1.25rem, 2.5cqw, 1.75rem)",
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
      {/* Number indicator */}
      <div
        className="flex-shrink-0 flex items-center justify-center font-semibold"
        style={{
          width: "clamp(2.25rem, 3.5cqw, 2.75rem)",
          height: "clamp(2.25rem, 3.5cqw, 2.75rem)",
          fontSize: "clamp(0.9rem, 1.3cqw, 1.1rem)",
          background:
            "var(--theme-effects-gradient-primary, linear-gradient(135deg, var(--theme-color-primary, #3b82f6) 0%, var(--theme-color-accent-purple, #6366f1) 100%))",
          color: "var(--theme-color-primary-foreground, #ffffff)",
          borderRadius: "50%",
          boxShadow: "var(--theme-effects-shadow-blue, 0 2px 8px rgba(59, 130, 246, 0.25))",
        }}
      >
        {index + 1}
      </div>

      {/* Arrow + Content */}
      <div className="flex-1 flex items-start gap-2 pt-1">
        <ArrowRight
          size={18}
          className="flex-shrink-0 mt-0.5"
          style={{ color: "var(--theme-color-primary)" }}
        />
        <div
          style={{
            flex: 1,
            fontSize: "var(--theme-typography-body-size, clamp(1rem, 1.5cqw, 1.125rem))",
            lineHeight: "var(--theme-typography-body-line-height, 1.6)",
            color: "var(--theme-color-foreground, #0f172a)",
          }}
        >
          {item}
        </div>
      </div>
    </div>
  );
}

export function SummaryNextStepsSlide({
  slide,
  editable = false,
  slideIndex = 0,
}: SummaryNextStepsSlideProps) {
  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const bulletsBlockIndex = slide.blocks.findIndex((b) => b.kind === "bullets");

  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;
  const bulletsBlock = bulletsBlockIndex >= 0 ? slide.blocks[bulletsBlockIndex] : null;

  const items = bulletsBlock?.items || [];
  const bulletCount = items.length;
  const isContentLight = bulletCount <= 4;

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

  // Smart column selection:
  // 1-2 items: single column (centered look)
  // 3-6 items: 2 columns
  // 7+ items: 3 columns
  const columnCount = bulletCount <= 2 ? 1 : bulletCount <= 6 ? 2 : 3;

  const gridContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: columnCount === 1 ? "1fr" : `repeat(${columnCount}, 1fr)`,
    gap: "clamp(1rem, 2cqw, 1.5rem)",
    flex: 1,
    alignContent: isContentLight ? "center" : "start",
  };

  // Always use grid layout with numbered step cards for better space utilization
  return (
    <SlideLayout contentAlign={isContentLight ? "center" : "top"} spacious={isContentLight}>
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
            <NumberedStepCard key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}
