/**
 * SummaryWithStatsSlide Component (Phase 7 Sprint 4)
 *
 * Summary text with prominent stat blocks.
 * Layout variants: stats_bottom, stats_right, stats_inline
 */

import type { Slide } from "@/lib/schemas/slide";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer, StatBlock, TextBlock, ImageBlock } from "../blocks";

interface SummaryWithStatsSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
}

export function SummaryWithStatsSlide({
  slide,
  editable = false,
  slideIndex = 0,
}: SummaryWithStatsSlideProps) {
  const variant = slide.layoutVariant || "stats_bottom";

  // Find title block
  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;

  // Find text blocks
  const textBlocks = slide.blocks.filter((b) => b.kind === "text");

  // Find stat_block blocks
  const statBlocks = slide.blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.kind === "stat_block");

  // Find image block
  const imageBlock = slide.blocks.find((b) => b.kind === "image");

  const isHorizontal = variant === "stats_right";
  const isInline = variant === "stats_inline";

  // Dynamic sizing based on stat count to prevent overflow
  const statCount = statBlocks.length;
  const getStatScale = () => {
    if (statCount <= 2) return 1; // Full size for 1-2 stats
    if (statCount === 3) return 0.75; // 75% for 3 stats
    return 0.6; // 60% for 4+ stats
  };
  const statScale = getStatScale();

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

  // Main content area styles based on variant
  const getContentStyle = (): React.CSSProperties => {
    if (isHorizontal) {
      return {
        display: "flex",
        flexDirection: "row",
        gap: "var(--theme-spacing-block-gap, 2rem)",
        flex: 1,
      };
    }
    return {
      display: "flex",
      flexDirection: "column",
      gap: "var(--theme-spacing-block-gap, 1.5rem)",
      flex: 1,
    };
  };

  // Stats container styles - use horizontal grid for 3+ stats to prevent overflow
  const getStatsContainerStyle = (): React.CSSProperties => {
    // Force horizontal row layout when 3+ stats (prevents vertical stacking overflow)
    const useHorizontalGrid = statCount >= 3;

    if (isInline) {
      // Stats inline with text
      return {
        display: "grid",
        gridTemplateColumns: useHorizontalGrid
          ? `repeat(${Math.min(statCount, 4)}, 1fr)`
          : "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "var(--theme-spacing-block-gap, 1rem)",
        justifyContent: "center",
      };
    }
    if (isHorizontal) {
      // Stats on the right side - stack vertically only if 1-2 stats
      return {
        display: useHorizontalGrid ? "grid" : "flex",
        gridTemplateColumns: useHorizontalGrid ? "1fr" : undefined,
        flexDirection: useHorizontalGrid ? undefined : "column",
        gap: "var(--theme-spacing-block-gap, 0.75rem)",
        flex: "0 0 40%",
        justifyContent: "center",
        alignContent: "center",
      };
    }
    // Stats at the bottom (default) - ALWAYS use horizontal grid for 3+ stats
    return {
      display: "grid",
      gridTemplateColumns: useHorizontalGrid
        ? `repeat(${Math.min(statCount, 4)}, 1fr)`
        : "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "var(--theme-spacing-block-gap, 1rem)",
      justifyContent: "center",
      marginTop: "auto",
      paddingTop: "var(--theme-spacing-block-gap, 1rem)",
      width: "100%",
    };
  };

  // Text content styles
  const textContentStyle: React.CSSProperties = {
    flex: isHorizontal ? "1" : "0 0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "var(--theme-spacing-block-gap, 0.75rem)",
  };

  const renderTextContent = () => (
    <div style={textContentStyle}>
      {textBlocks.map((block, idx) => (
        <TextBlock key={idx} text={block.text ?? ""} />
      ))}
      {imageBlock && !isHorizontal && (
        <div
          style={{
            borderRadius: "var(--theme-border-radius, 0.75rem)",
            overflow: "hidden",
            maxHeight: "200px",
          }}
        >
          <ImageBlock
            url={imageBlock.url ?? ""}
            alt={imageBlock.alt ?? ""}
            cropMode={imageBlock.cropMode}
          />
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div style={getStatsContainerStyle()}>
      {statBlocks.map(({ block, index }) => (
        <StatBlock
          key={index}
          value={block.value ?? ""}
          label={block.label ?? ""}
          sublabel={block.sublabel}
          scale={statScale}
        />
      ))}
    </div>
  );

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

        {/* Content: Text and Stats */}
        <div style={getContentStyle()}>
          {isInline ? (
            <>
              {renderTextContent()}
              {renderStats()}
            </>
          ) : isHorizontal ? (
            <>
              {renderTextContent()}
              {renderStats()}
            </>
          ) : (
            <>
              {renderTextContent()}
              {renderStats()}
            </>
          )}
        </div>
      </div>
    </SlideLayout>
  );
}
