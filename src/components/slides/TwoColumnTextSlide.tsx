/**
 * TwoColumnTextSlide Component
 *
 * Side-by-side text comparison slide.
 * Layout variants: default, text_left, text_right, equal
 *
 * Updated in Punkt 6: Improved vertical distribution.
 */

import type { Slide } from "@/lib/schemas/slide";
import { getContentBlockIndices } from "@/lib/schemas/block";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer } from "../blocks";

interface TwoColumnTextSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
}

export function TwoColumnTextSlide({
  slide,
  editable = false,
  slideIndex = 0,
}: TwoColumnTextSlideProps) {
  const variant = slide.layoutVariant || "equal";

  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;

  // Get indices of content blocks (text, bullets, callout)
  // This allows AI to transform text to bullets while keeping layout intact
  const contentBlockIndices = getContentBlockIndices(slide.blocks);

  const gridClasses: Record<string, string> = {
    default: "grid-cols-2",
    equal: "grid-cols-2",
    text_left: "grid-cols-[2fr_1fr]",
    text_right: "grid-cols-[1fr_2fr]",
  };

  // Container fills available space
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    maxWidth: "100%",
  };

  // Title section with proper spacing
  const titleSectionStyle: React.CSSProperties = {
    marginBottom: "var(--theme-spacing-section-gap, clamp(1.5rem, 3cqw, 2.5rem))",
    flexShrink: 0,
  };

  return (
    <SlideLayout contentAlign="distributed">
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
        <div
          className={`grid ${gridClasses[variant] || gridClasses.equal} flex-1`}
          style={{
            gap: "var(--theme-spacing-lg, clamp(1.5rem, 3cqw, 2rem))",
            alignContent: "start",
          }}
        >
          {contentBlockIndices.slice(0, 2).map((blockIndex) => (
            <div key={blockIndex} className="flex flex-col">
              <SmartBlockRenderer
                block={slide.blocks[blockIndex]}
                slideIndex={slideIndex}
                blockIndex={blockIndex}
                editable={editable}
              />
            </div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}
