/**
 * HeroStatsSlide Component
 *
 * Premium slide with full-width hero image and prominent stats.
 * Layout variants: hero_top, hero_background, hero_split
 */

import type { Slide } from "@/lib/schemas/slide";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer, StatBlock, ImageBlock } from "../blocks";

interface HeroStatsSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
  /** Whether AI is currently generating an image for this slide */
  isImageGenerating?: boolean;
}

export function HeroStatsSlide({
  slide,
  editable = false,
  slideIndex = 0,
  isImageGenerating = false,
}: HeroStatsSlideProps) {
  const variant = slide.layoutVariant || "hero_top";

  // Find blocks
  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;

  const imageBlock = slide.blocks.find((b) => b.kind === "image");

  const statBlocks = slide.blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.kind === "stat_block");

  const textBlock = slide.blocks.find((b) => b.kind === "text");

  const isBackground = variant === "hero_background";
  const isSplit = variant === "hero_split";

  // Dynamic sizing based on stat count to prevent overflow
  const statCount = statBlocks.length;
  const getSizeScale = () => {
    if (statCount <= 2) return 1; // Full size for 1-2 stats
    if (statCount === 3) return 0.75; // 75% for 3 stats
    return 0.6; // 60% for 4+ stats
  };
  const sizeScale = getSizeScale();

  // Styles
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    position: "relative",
  };

  const heroImageStyle: React.CSSProperties = {
    width: "100%",
    height: isBackground ? "100%" : "40%",
    borderRadius: isBackground ? "0" : "var(--theme-border-radius, 1rem)",
    overflow: "hidden",
    position: isBackground ? "absolute" : "relative",
    inset: isBackground ? 0 : undefined,
    zIndex: isBackground ? 0 : undefined,
  };

  const overlayStyle: React.CSSProperties = isBackground
    ? {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))",
        zIndex: 1,
      }
    : {};

  const contentStyle: React.CSSProperties = {
    position: isBackground ? "relative" : "static",
    zIndex: isBackground ? 2 : undefined,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: isBackground ? "flex-end" : "space-between",
    padding: isBackground ? "var(--theme-spacing-section, 2rem)" : undefined,
    paddingTop: !isBackground ? "var(--theme-spacing-block-gap, 1.5rem)" : undefined,
    color: isBackground ? "#ffffff" : undefined,
  };

  // Use horizontal grid for 3+ stats to prevent vertical stacking overflow
  const useHorizontalGrid = statCount >= 3;

  const statsContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: useHorizontalGrid
      ? `repeat(${Math.min(statCount, 4)}, 1fr)`
      : "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "var(--theme-spacing-block-gap, 1rem)",
    justifyContent: "center",
    marginTop: "auto",
    paddingTop: "var(--theme-spacing-block-gap, 1rem)",
    width: "100%",
  };

  const largeStatStyle: React.CSSProperties = {
    textAlign: "center",
    padding: sizeScale === 1 ? "var(--theme-spacing-block-gap, 1rem)" : "0.5rem",
    background: isBackground
      ? "rgba(255,255,255,0.1)"
      : "var(--theme-color-accent-subtle, #f0f9ff)",
    borderRadius: "var(--theme-border-radius, 0.75rem)",
    backdropFilter: isBackground ? "blur(8px)" : undefined,
  };

  const statValueStyle: React.CSSProperties = {
    // Dynamic font size based on stat count - uses calc() to scale the display size
    fontSize:
      sizeScale === 1
        ? "var(--theme-typography-display-size, 3rem)"
        : `calc(var(--theme-typography-display-size, 3rem) * ${sizeScale})`,
    fontWeight: 700,
    lineHeight: 1.1,
    color: isBackground ? "#ffffff" : "var(--theme-color-accent, #3b82f6)",
    letterSpacing: "-0.02em",
  };

  const statLabelStyle: React.CSSProperties = {
    // Scale label proportionally with value
    fontSize:
      sizeScale === 1
        ? "var(--theme-font-size-sm, 0.875rem)"
        : `calc(var(--theme-font-size-sm, 0.875rem) * ${Math.max(sizeScale, 0.85)})`,
    marginTop: "0.5rem",
    opacity: 0.9,
    color: isBackground ? "rgba(255,255,255,0.9)" : "var(--theme-color-foreground-muted, #64748b)",
  };

  if (isSplit) {
    // Split layout: image on left, content on right
    return (
      <SlideLayout className="p-0">
        <div style={{ display: "flex", height: "100%" }}>
          {/* Hero image */}
          <div style={{ flex: "0 0 50%", position: "relative" }}>
            {imageBlock && (
              <ImageBlock
                url={imageBlock.url ?? ""}
                alt={imageBlock.alt ?? ""}
                cropMode="cover"
                isGenerating={isImageGenerating}
              />
            )}
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              padding: "var(--theme-spacing-section, 2rem)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {titleBlock && (
              <SmartBlockRenderer
                block={titleBlock}
                slideIndex={slideIndex}
                blockIndex={titleBlockIndex}
                titleLevel={2}
                editable={editable}
              />
            )}

            {textBlock && (
              <p
                style={{
                  marginTop: "1rem",
                  fontSize: "var(--theme-font-size-body, 1rem)",
                  color: "var(--theme-color-foreground-muted, #64748b)",
                }}
              >
                {textBlock.text}
              </p>
            )}

            <div style={statsContainerStyle}>
              {statBlocks.map(({ block, index }) => (
                <div key={index} style={largeStatStyle}>
                  <div style={statValueStyle}>{block.value}</div>
                  <div style={statLabelStyle}>{block.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SlideLayout>
    );
  }

  return (
    <SlideLayout className={isBackground ? "p-0" : ""}>
      <div style={containerStyle}>
        {/* Hero Image */}
        {imageBlock && (
          <div style={heroImageStyle}>
            <ImageBlock
              url={imageBlock.url ?? ""}
              alt={imageBlock.alt ?? ""}
              cropMode="cover"
              isGenerating={isImageGenerating}
            />
            {isBackground && <div style={overlayStyle} />}
          </div>
        )}

        {/* Content */}
        <div style={contentStyle}>
          {/* Title */}
          {titleBlock && (
            <div style={{ marginBottom: "var(--theme-spacing-block-gap, 1rem)" }}>
              <SmartBlockRenderer
                block={titleBlock}
                slideIndex={slideIndex}
                blockIndex={titleBlockIndex}
                titleLevel={2}
                editable={editable}
              />
            </div>
          )}

          {/* Text */}
          {textBlock && (
            <p
              style={{
                fontSize: "var(--theme-font-size-body, 1rem)",
                color: isBackground
                  ? "rgba(255,255,255,0.9)"
                  : "var(--theme-color-foreground-muted, #64748b)",
                maxWidth: "60ch",
              }}
            >
              {textBlock.text}
            </p>
          )}

          {/* Large Stats */}
          <div style={statsContainerStyle}>
            {statBlocks.map(({ block, index }) => (
              <div key={index} style={largeStatStyle}>
                <div style={statValueStyle}>{block.value}</div>
                <div style={statLabelStyle}>{block.label}</div>
                {block.sublabel && (
                  <div
                    style={{
                      fontSize: "var(--theme-font-size-xs, 0.75rem)",
                      marginTop: "0.25rem",
                      opacity: 0.7,
                    }}
                  >
                    {block.sublabel}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
