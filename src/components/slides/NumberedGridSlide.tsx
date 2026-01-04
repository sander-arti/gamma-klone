/**
 * NumberedGridSlide Component (Phase 7 Sprint 4)
 *
 * Grid layout for numbered cards.
 * Layout variants: 2x2, 3x1, 4x1
 */

import type { Slide } from "@/lib/schemas/slide";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer, NumberedCardBlock } from "../blocks";

interface NumberedGridSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
}

export function NumberedGridSlide({
  slide,
  editable = false,
  slideIndex = 0,
}: NumberedGridSlideProps) {
  const variant = slide.layoutVariant || "3x1";

  // Find title block
  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;

  // Find all numbered_card blocks
  const numberedCards = slide.blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.kind === "numbered_card");

  // Grid styles based on variant
  const getGridStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      display: "grid",
      gap: "var(--theme-spacing-block-gap, 1rem)",
      flex: 1,
    };

    switch (variant) {
      case "2x2":
        return {
          ...baseStyle,
          gridTemplateColumns: "repeat(2, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
        };
      case "4x1":
        return {
          ...baseStyle,
          gridTemplateColumns: "repeat(4, 1fr)",
        };
      case "3x1":
      default:
        return {
          ...baseStyle,
          gridTemplateColumns: "repeat(3, 1fr)",
        };
    }
  };

  // Container styles
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--theme-spacing-block-gap, 1rem)",
    height: "100%",
  };

  const titleMarginStyle: React.CSSProperties = {
    marginBottom: "var(--theme-spacing-block-gap, 0.5rem)",
  };

  return (
    <SlideLayout className="justify-start">
      <div style={containerStyle}>
        {/* Title */}
        {titleBlock && (
          <div style={titleMarginStyle}>
            <SmartBlockRenderer
              block={titleBlock}
              slideIndex={slideIndex}
              blockIndex={titleBlockIndex}
              titleLevel={2}
              editable={editable}
            />
          </div>
        )}

        {/* Numbered cards grid */}
        <div style={getGridStyle()}>
          {numberedCards.map(({ block, index }) => (
            <NumberedCardBlock
              key={index}
              number={block.number ?? index + 1}
              text={block.text ?? ""}
              description={block.description}
            />
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}
