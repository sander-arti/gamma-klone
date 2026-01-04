/**
 * SectionHeaderSlide Component
 *
 * Premium section divider slide.
 * Features: subtle background, animations, centered layout.
 * Layout variants: default, large, subtle
 *
 * Updated in Punkt 6: Added decorative orb via spacious mode.
 */

import type { Slide } from "@/lib/schemas/slide";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer } from "../blocks";

interface SectionHeaderSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
}

export function SectionHeaderSlide({
  slide,
  editable = false,
  slideIndex = 0,
}: SectionHeaderSlideProps) {
  const variant = slide.layoutVariant || "default";

  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const subtitleBlockIndex = slide.blocks.findIndex((b) => b.kind === "text");

  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;
  const subtitleBlock = subtitleBlockIndex >= 0 ? slide.blocks[subtitleBlockIndex] : null;

  const isLarge = variant === "large";
  const isSubtle = variant === "subtle";

  return (
    <SlideLayout contentAlign="center" spacious>
      {/* Decorative top accent line with gradient and animation */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 animate-line-grow"
        style={{
          width: "clamp(6rem, 12cqw, 10rem)",
          height: "4px",
          marginTop: "var(--theme-spacing-slide-gutter, 2rem)",
          background: isSubtle
            ? "var(--theme-color-primary, #2563eb)"
            : "var(--theme-effects-gradient-primary, linear-gradient(90deg, var(--theme-color-primary, #3b82f6) 0%, var(--theme-color-accent-purple, #6366f1) 100%))",
          borderRadius: "9999px",
          opacity: isSubtle ? 0.5 : 1,
          boxShadow: isSubtle
            ? "none"
            : "var(--theme-effects-shadow-blue, 0 2px 8px rgba(59, 130, 246, 0.3))",
        }}
        aria-hidden="true"
      />

      {/* Content - centered with proper spacing */}
      <div
        className={`relative z-10 max-w-4xl flex flex-col items-center text-center ${isLarge ? "scale-105" : ""} ${isSubtle ? "opacity-80" : ""}`}
        style={{ gap: "var(--theme-spacing-lg, clamp(1rem, 2cqw, 1.5rem))" }}
      >
        {titleBlock && (
          <div className="animate-reveal-up">
            <SmartBlockRenderer
              block={titleBlock}
              slideIndex={slideIndex}
              blockIndex={titleBlockIndex}
              titleLevel={1}
              editable={editable}
            />
          </div>
        )}
        {subtitleBlock && (
          <div
            className="animate-fade-in-up delay-150"
            style={{
              opacity: 0.75,
              maxWidth: "85%",
              fontSize: "var(--theme-typography-body-size, clamp(1rem, 1.5cqw, 1.125rem))",
            }}
          >
            <SmartBlockRenderer
              block={subtitleBlock}
              slideIndex={slideIndex}
              blockIndex={subtitleBlockIndex}
              editable={editable}
            />
          </div>
        )}
      </div>
    </SlideLayout>
  );
}
