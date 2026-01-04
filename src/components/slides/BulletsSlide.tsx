/**
 * BulletsSlide Component
 *
 * Premium bullet point slide with multiple layout options.
 * Layout variants:
 * - default/list: Standard vertical list
 * - compact: Tighter spacing for more items
 * - expanded: More breathing room per item
 * - two_columns: Split into two columns
 * - grid: 2-3 column grid with card styling (Premium)
 * - cards: Feature cards with numbers (Premium)
 *
 * Updated in Punkt 7: Added grid and cards variants for Gamma-level design.
 */

import type { Slide } from "@/lib/schemas/slide";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer, BulletsBlock } from "../blocks";

interface BulletsSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
}

/**
 * Premium Card component for individual bullet items
 */
function BulletCard({
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
        padding: isCards
          ? "clamp(1.25rem, 2.5cqw, 1.75rem)"
          : "clamp(1rem, 2cqw, 1.5rem)",
        background: "var(--theme-color-surface, rgba(255, 255, 255, 0.7))",
        borderRadius: "var(--theme-radius-lg, 12px)",
        border: "1px solid var(--theme-color-border-subtle, rgba(0, 0, 0, 0.06))",
        boxShadow: "var(--theme-effects-shadow-card, 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03))",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: isCards ? "column" : "row",
        alignItems: isCards ? "flex-start" : "flex-start",
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
          background: "var(--theme-effects-gradient-primary, linear-gradient(135deg, var(--theme-color-primary, #3b82f6) 0%, var(--theme-color-accent-purple, #6366f1) 100%))",
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
 * Smart variant selection based on content
 * Analyzes bullet count and text length to choose optimal layout
 */
function selectOptimalVariant(items: string[], explicitVariant?: string): string {
  // If explicitly set, respect it
  if (explicitVariant && explicitVariant !== "default") {
    return explicitVariant;
  }

  const count = items.length;
  const avgLength = items.reduce((sum, item) => sum + item.length, 0) / (count || 1);
  const maxLength = Math.max(...items.map(item => item.length), 0);

  // Very short items (keywords/phrases) → cards layout
  if (count <= 4 && avgLength < 40) {
    return "cards";
  }

  // Few items with medium text → cards
  if (count <= 3 && avgLength < 80) {
    return "cards";
  }

  // 4-6 items → grid (2 columns)
  if (count >= 4 && count <= 6) {
    return "grid";
  }

  // 7-8 items → grid (will use 2-3 columns)
  if (count >= 7 && count <= 8) {
    return "grid";
  }

  // Many items (9+) with short text → two_columns
  if (count >= 9 && avgLength < 60) {
    return "two_columns";
  }

  // Long text items → default list for readability
  if (maxLength > 120 || avgLength > 80) {
    return "default";
  }

  // Default to grid for premium look
  return "grid";
}

export function BulletsSlide({
  slide,
  editable = false,
  slideIndex = 0,
}: BulletsSlideProps) {
  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const bulletsBlockIndex = slide.blocks.findIndex((b) => b.kind === "bullets");

  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;
  const bulletsBlock = bulletsBlockIndex >= 0 ? slide.blocks[bulletsBlockIndex] : null;

  const items = bulletsBlock?.items || [];
  const bulletCount = items.length;
  const isContentLight = bulletCount <= 4;

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

  // ============================================
  // GRID VARIANT - 2-3 column card grid
  // ============================================
  if (variant === "grid" || variant === "cards") {
    const isCards = variant === "cards";

    // Determine column count based on item count
    const columnCount = bulletCount <= 4 ? 2 : bulletCount <= 6 ? 2 : 3;

    const gridContainerStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      gap: isCards
        ? "clamp(1rem, 2cqw, 1.5rem)"
        : "clamp(0.875rem, 1.5cqw, 1.25rem)",
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
              <BulletCard
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

  // ============================================
  // TWO COLUMNS VARIANT
  // ============================================
  if (variant === "two_columns" && items.length > 0) {
    const midpoint = Math.ceil(items.length / 2);
    const leftItems = items.slice(0, midpoint);
    const rightItems = items.slice(midpoint);

    const gridStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "var(--theme-spacing-lg, 1.5rem)",
      flex: 1,
      alignContent: "start",
    };

    return (
      <SlideLayout contentAlign="distributed" spacious={isContentLight}>
        <div style={containerStyle}>
          {titleBlock && (
            <div style={titleSectionStyle}>
              <SmartBlockRenderer
                block={titleBlock}
                slideIndex={slideIndex}
                blockIndex={titleBlockIndex}
                titleLevel={2}
                editable={false}
              />
            </div>
          )}
          <div style={gridStyle}>
            <BulletsBlock items={leftItems} />
            <BulletsBlock items={rightItems} />
          </div>
        </div>
      </SlideLayout>
    );
  }

  // ============================================
  // DEFAULT/COMPACT/EXPANDED - Standard list
  // ============================================
  const contentSectionStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: isContentLight
      ? "var(--theme-spacing-item-gap-spacious, clamp(1.25rem, 2cqw, 1.75rem))"
      : "var(--theme-spacing-item-gap, clamp(0.75rem, 1.2cqw, 1rem))",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      "--bullet-font-size":
        "var(--theme-typography-body-size, clamp(1rem, 1.6cqw, 1.125rem))",
      "--bullet-line-height": "var(--theme-typography-body-line-height, 1.65)",
    } as React.CSSProperties,
    compact: {
      "--bullet-font-size":
        "var(--theme-typography-body-small-size, clamp(0.875rem, 1.3cqw, 1rem))",
      "--bullet-line-height": "1.5",
    } as React.CSSProperties,
    expanded: {
      "--bullet-font-size": "clamp(1.125rem, 1.8cqw, 1.25rem)",
      "--bullet-line-height": "1.7",
    } as React.CSSProperties,
  };

  const activeVariant = ["default", "compact", "expanded"].includes(variant)
    ? variant
    : "default";

  return (
    <SlideLayout contentAlign="distributed" spacious={isContentLight}>
      <div style={{ ...containerStyle, ...variantStyles[activeVariant] }}>
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
        <div style={contentSectionStyle}>
          {bulletsBlock && (
            <SmartBlockRenderer
              block={bulletsBlock}
              slideIndex={slideIndex}
              blockIndex={bulletsBlockIndex}
              editable={editable}
            />
          )}
        </div>
      </div>
    </SlideLayout>
  );
}
