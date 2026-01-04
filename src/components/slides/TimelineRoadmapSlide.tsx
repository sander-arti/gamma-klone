/**
 * TimelineRoadmapSlide Component (Phase 7)
 *
 * Timeline/roadmap slide with visual step progression.
 * Layout variants: vertical (default), horizontal, compact
 *
 * Updated in Punkt 6: Improved vertical centering and spacing.
 */

import type { Slide } from "@/lib/schemas/slide";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer, TimelineStepBlock } from "../blocks";

interface TimelineRoadmapSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
}

export function TimelineRoadmapSlide({
  slide,
  editable = false,
  slideIndex = 0,
}: TimelineRoadmapSlideProps) {
  const variant = slide.layoutVariant || "vertical";

  // Find title block
  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;

  // Find all timeline_step blocks
  const timelineSteps = slide.blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.kind === "timeline_step");

  const isHorizontal = variant === "horizontal";
  const isCompact = variant === "compact";

  // Timeline slides typically have few items - use spacious mode
  const isContentLight = timelineSteps.length <= 5;

  // Container fills available space for better vertical distribution
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

  // Timeline container styles based on variant
  // For horizontal: center vertically, for vertical: distribute space
  const timelineContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isHorizontal ? "row" : "column",
    gap: isCompact
      ? "var(--theme-spacing-sm, 0.5rem)"
      : isHorizontal
        ? "var(--theme-spacing-lg, 1.5rem)"
        : "var(--theme-spacing-md, 1rem)",
    flex: 1,
    alignItems: isHorizontal ? "center" : "stretch",
    justifyContent: isHorizontal ? "center" : "flex-start",
  };

  return (
    <SlideLayout contentAlign={isHorizontal ? "center" : "distributed"} spacious={isContentLight}>
      <div style={containerStyle}>
        {/* Title */}
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

        {/* Timeline steps */}
        <div style={timelineContainerStyle}>
          {timelineSteps.map(({ block, index }, stepIdx) => (
            <TimelineStepBlock
              key={index}
              step={block.step ?? stepIdx + 1}
              title={block.text ?? ""}
              description={block.description}
              status={block.status}
              isLast={stepIdx === timelineSteps.length - 1}
              layout={isHorizontal ? "horizontal" : "vertical"}
              className={isCompact ? "py-1" : ""}
            />
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}
