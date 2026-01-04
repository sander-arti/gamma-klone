/**
 * AgendaSlide Component
 *
 * Premium agenda/overview slide with dynamic layouts.
 * Automatically selects optimal layout based on content:
 * - cards: Few items (≤4) with short text - numbered feature cards
 * - grid: 4-8 items - 2-3 column card grid
 * - numbered: 9+ items - numbered list with vertical flow
 *
 * Updated in Punkt 7: Premium grid and cards variants for Gamma-level design.
 */

import type { Slide } from "@/lib/schemas/slide";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer } from "../blocks";

interface AgendaSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
}

/**
 * Premium Card component for agenda items
 */
function AgendaCard({
  item,
  index,
  variant,
}: {
  item: string;
  index: number;
  variant: "grid" | "cards";
}) {
  const isCards = variant === "cards";

  return (
    <div
      className="group relative animate-fade-in-up"
      style={{
        animationDelay: `${index * 50}ms`,
        padding: isCards ? "clamp(1.25rem, 2.5cqw, 1.75rem)" : "clamp(1rem, 2cqw, 1.5rem)",
        background: "var(--theme-color-surface, rgba(255, 255, 255, 0.7))",
        borderRadius: "var(--theme-radius-lg, 12px)",
        border: "1px solid var(--theme-color-border-subtle, rgba(0, 0, 0, 0.06))",
        boxShadow:
          "var(--theme-effects-shadow-card, 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03))",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: isCards ? "column" : "row",
        alignItems: "flex-start",
        gap: isCards ? "clamp(0.75rem, 1.5cqw, 1rem)" : "clamp(0.75rem, 1.2cqw, 1rem)",
      }}
    >
      {/* Number indicator */}
      <div
        className="flex-shrink-0 flex items-center justify-center font-semibold"
        style={{
          width: isCards ? "clamp(2.5rem, 4cqw, 3rem)" : "clamp(2rem, 3cqw, 2.5rem)",
          height: isCards ? "clamp(2.5rem, 4cqw, 3rem)" : "clamp(2rem, 3cqw, 2.5rem)",
          fontSize: isCards ? "clamp(1rem, 1.5cqw, 1.25rem)" : "clamp(0.875rem, 1.2cqw, 1rem)",
          background:
            "var(--theme-effects-gradient-primary, linear-gradient(135deg, var(--theme-color-primary, #3b82f6) 0%, var(--theme-color-accent-purple, #6366f1) 100%))",
          color: "var(--theme-color-primary-foreground, #ffffff)",
          borderRadius: isCards ? "var(--theme-radius-md, 10px)" : "50%",
          boxShadow: "var(--theme-effects-shadow-blue, 0 2px 8px rgba(59, 130, 246, 0.25))",
        }}
      >
        {index + 1}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          fontSize: isCards
            ? "var(--theme-typography-body-size, clamp(1rem, 1.5cqw, 1.125rem))"
            : "var(--theme-typography-body-size, clamp(0.9375rem, 1.4cqw, 1.0625rem))",
          lineHeight: "var(--theme-typography-body-line-height, 1.6)",
          color: "var(--theme-color-foreground, #0f172a)",
        }}
      >
        {item}
      </div>
    </div>
  );
}

/**
 * Smart variant selection for agenda slides
 * Agendas typically have shorter items, so we favor cards/grid
 */
function selectOptimalVariant(items: string[], explicitVariant?: string): string {
  if (explicitVariant && explicitVariant !== "default") {
    return explicitVariant;
  }

  const count = items.length;
  const avgLength = items.reduce((sum, item) => sum + item.length, 0) / (count || 1);

  // Agenda items are typically short - favor cards for ≤5 items
  if (count <= 5 && avgLength < 60) {
    return "cards";
  }

  // 6-8 items → grid
  if (count >= 6 && count <= 8) {
    return "grid";
  }

  // Many items → grid with 3 columns
  if (count > 8) {
    return "grid";
  }

  return "cards";
}

export function AgendaSlide({ slide, editable = false, slideIndex = 0 }: AgendaSlideProps) {
  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const bulletsBlockIndex = slide.blocks.findIndex((b) => b.kind === "bullets");

  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;
  const bulletsBlock = bulletsBlockIndex >= 0 ? slide.blocks[bulletsBlockIndex] : null;

  const items = bulletsBlock?.items || [];
  const bulletCount = items.length;
  const isContentLight = bulletCount <= 5;

  // Smart auto-selection of variant
  const variant = selectOptimalVariant(items, slide.layoutVariant);

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

  // Determine column count based on item count
  const columnCount = bulletCount <= 4 ? 2 : bulletCount <= 6 ? 2 : 3;

  const gridContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
    gap: variant === "cards" ? "clamp(1rem, 2cqw, 1.5rem)" : "clamp(0.875rem, 1.5cqw, 1.25rem)",
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
            <AgendaCard
              key={index}
              item={item}
              index={index}
              variant={variant as "grid" | "cards"}
            />
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}
