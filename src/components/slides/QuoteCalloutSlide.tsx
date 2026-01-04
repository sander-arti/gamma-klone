/**
 * QuoteCalloutSlide Component
 *
 * Quote or callout slide with prominent text.
 * Layout variants: default, large, subtle, centered
 *
 * Updated in Punkt 6: Improved centering and typography.
 */

import type { Slide } from "@/lib/schemas/slide";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer } from "../blocks";

interface QuoteCalloutSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
}

export function QuoteCalloutSlide({
  slide,
  editable = false,
  slideIndex = 0,
}: QuoteCalloutSlideProps) {
  const variant = slide.layoutVariant || "default";

  // Find quote block - could be text or callout
  const quoteBlockIndex = slide.blocks.findIndex((b) => b.kind === "text" || b.kind === "callout");

  // Find attribution block (a second text block)
  let attributionBlockIndex = -1;
  slide.blocks.forEach((block, index) => {
    if (block.kind === "text" && index !== quoteBlockIndex) {
      attributionBlockIndex = index;
    }
  });

  const quoteBlock = quoteBlockIndex >= 0 ? slide.blocks[quoteBlockIndex] : null;
  const attributionBlock = attributionBlockIndex >= 0 ? slide.blocks[attributionBlockIndex] : null;

  // Quote slide is always content-light, so use spacious mode
  // Center alignment for all quote variants for visual impact
  const isCentered = variant === "centered" || variant === "large";

  // In editable mode, use SmartBlockRenderer for direct editing
  if (editable) {
    return (
      <SlideLayout contentAlign="center" spacious>
        <div
          style={{
            maxWidth: "90%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: isCentered ? "center" : "flex-start",
            gap: "var(--theme-spacing-md, 1rem)",
          }}
        >
          {quoteBlock && (
            <SmartBlockRenderer
              block={quoteBlock}
              slideIndex={slideIndex}
              blockIndex={quoteBlockIndex}
              editable={editable}
            />
          )}
          {attributionBlock && (
            <div
              style={{
                fontSize: "var(--theme-typography-body-size, 1rem)",
                color: "var(--theme-color-foreground-muted, #64748b)",
              }}
            >
              <SmartBlockRenderer
                block={attributionBlock}
                slideIndex={slideIndex}
                blockIndex={attributionBlockIndex}
                editable={editable}
              />
            </div>
          )}
        </div>
      </SlideLayout>
    );
  }

  // Read-only mode: Use styled quote rendering
  const quoteText = quoteBlock?.text || "";
  const attribution = attributionBlock?.text;

  // Quote styles based on variant
  const quoteStyles: Record<string, React.CSSProperties> = {
    default: {
      fontSize: "var(--theme-typography-quote-size, clamp(1.5rem, 2.5cqw, 2rem))",
      textAlign: "left" as const,
    },
    large: {
      fontSize: "clamp(1.75rem, 3.5cqw, 2.75rem)",
      textAlign: "center" as const,
    },
    subtle: {
      fontSize: "var(--theme-typography-body-size, clamp(1rem, 1.5cqw, 1.125rem))",
      color: "var(--theme-color-foreground-muted, #64748b)",
      textAlign: "left" as const,
    },
    centered: {
      fontSize: "var(--theme-typography-quote-size, clamp(1.5rem, 2.5cqw, 2rem))",
      textAlign: "center" as const,
    },
  };

  const currentStyle = quoteStyles[variant] || quoteStyles.default;

  return (
    <SlideLayout contentAlign="center" spacious>
      <figure
        style={{
          maxWidth: "90%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: isCentered ? "center" : "flex-start",
        }}
      >
        <blockquote
          style={{
            ...currentStyle,
            fontStyle: "italic",
            color: currentStyle.color || "var(--theme-color-foreground, #0f172a)",
            lineHeight: 1.6,
            position: "relative",
            paddingLeft: isCentered ? 0 : "clamp(1.5rem, 3cqw, 2.5rem)",
            margin: 0,
          }}
        >
          {/* Decorative quote mark */}
          <span
            style={{
              position: isCentered ? "relative" : "absolute",
              left: isCentered ? "auto" : 0,
              top: isCentered ? "auto" : "-0.25em",
              fontSize: "clamp(3rem, 5cqw, 4rem)",
              lineHeight: 1,
              color: "var(--theme-color-primary, #3b82f6)",
              opacity: 0.3,
              fontStyle: "normal",
              display: isCentered ? "block" : "inline",
              marginBottom: isCentered ? "-0.5rem" : 0,
            }}
            aria-hidden="true"
          >
            &ldquo;
          </span>
          {quoteText}
        </blockquote>
        {attribution && (
          <figcaption
            style={{
              marginTop: "var(--theme-spacing-lg, clamp(1.5rem, 2cqw, 2rem))",
              fontSize: "var(--theme-typography-body-size, clamp(0.9rem, 1.3cqw, 1rem))",
              color: "var(--theme-color-foreground-muted, #64748b)",
              fontStyle: "normal",
            }}
          >
            &mdash; {attribution}
          </figcaption>
        )}
      </figure>
    </SlideLayout>
  );
}
