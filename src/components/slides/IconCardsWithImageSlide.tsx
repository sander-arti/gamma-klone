/**
 * IconCardsWithImageSlide Component (Phase 7 Sprint 4)
 *
 * Icon cards layout with optional image.
 * Layout variants: cards_left, cards_right, cards_top
 */

import type { Slide } from "@/lib/schemas/slide";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer, IconCardBlock, ImageBlock } from "../blocks";

interface IconCardsWithImageSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
  /** Whether AI is currently generating an image for this slide */
  isImageGenerating?: boolean;
}

export function IconCardsWithImageSlide({
  slide,
  editable = false,
  slideIndex = 0,
  isImageGenerating = false,
}: IconCardsWithImageSlideProps) {
  const variant = slide.layoutVariant || "cards_left";

  // Find title block
  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;

  // Find all icon_card blocks
  const iconCards = slide.blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.kind === "icon_card");

  // Find image block
  const imageBlock = slide.blocks.find((b) => b.kind === "image");

  const isHorizontal = variant === "cards_left" || variant === "cards_right";
  const cardsFirst = variant === "cards_left" || variant === "cards_top";

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

  // Main content area styles
  const contentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isHorizontal ? "row" : "column",
    gap: "var(--theme-spacing-block-gap, 1.5rem)",
    flex: 1,
  };

  // Cards container styles
  const cardsContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isHorizontal ? "column" : "row",
    gap: "var(--theme-spacing-block-gap, 1rem)",
    flex: imageBlock ? (isHorizontal ? "0 0 50%" : "0 0 auto") : 1,
  };

  // Image container styles
  const imageContainerStyle: React.CSSProperties = {
    flex: 1,
    minHeight: isHorizontal ? "auto" : "200px",
    borderRadius: "var(--theme-border-radius, 0.75rem)",
    overflow: "hidden",
  };

  const renderCards = () => (
    <div style={cardsContainerStyle}>
      {iconCards.map(({ block, index }) => (
        <IconCardBlock
          key={index}
          icon={block.icon ?? "circle"}
          text={block.text ?? ""}
          description={block.description}
          bgColor={block.bgColor}
        />
      ))}
    </div>
  );

  const renderImage = () =>
    imageBlock ? (
      <div style={imageContainerStyle}>
        <ImageBlock
          url={imageBlock.url ?? ""}
          alt={imageBlock.alt ?? ""}
          cropMode={imageBlock.cropMode}
          className="h-full"
          isGenerating={isImageGenerating}
        />
      </div>
    ) : null;

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

        {/* Content: Cards and Image */}
        <div style={contentStyle}>
          {cardsFirst ? (
            <>
              {renderCards()}
              {renderImage()}
            </>
          ) : (
            <>
              {renderImage()}
              {renderCards()}
            </>
          )}
        </div>
      </div>
    </SlideLayout>
  );
}
