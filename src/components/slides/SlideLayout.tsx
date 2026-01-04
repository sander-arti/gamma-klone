/**
 * SlideLayout Component
 *
 * Base wrapper for all slide types providing consistent padding
 * and background styling based on theme.
 *
 * Updated in Punkt 3 to use SlideBackground for visual depth.
 * Updated in Punkt 6 to support content alignment options.
 */

import type { ReactNode } from "react";
import { SlideBackground, type SlideBackgroundVariant } from "./SlideBackground";

/** Vertical content alignment within the slide */
export type ContentAlignment = "top" | "center" | "distributed" | "bottom";

interface SlideLayoutProps {
  children: ReactNode;
  className?: string;
  /** Background variant - controls visual depth layers */
  backgroundVariant?: SlideBackgroundVariant;
  /** Show subtle dot pattern */
  showPattern?: boolean;
  /** Custom background color (overrides theme) */
  customBackground?: string;
  /** Vertical content alignment - default is "distributed" for natural spacing */
  contentAlign?: ContentAlignment;
  /** Enable larger content padding for slides with less content */
  spacious?: boolean;
}

/**
 * Maps alignment prop to CSS justify-content value
 */
function getJustifyContent(align: ContentAlignment): string {
  switch (align) {
    case "top":
      return "flex-start";
    case "center":
      return "center";
    case "bottom":
      return "flex-end";
    case "distributed":
    default:
      return "flex-start"; // Use flex-start but with flex-grow on content wrapper
  }
}

export function SlideLayout({
  children,
  className = "",
  backgroundVariant = "depth",
  showPattern = false,
  customBackground,
  contentAlign = "distributed",
  spacious = false,
}: SlideLayoutProps) {
  const justifyContent = getJustifyContent(contentAlign);

  // For distributed layout, we want content to have breathing room
  // but not be fully centered (title stays near top, content expands down)
  const isDistributed = contentAlign === "distributed";

  // Use more visual background for spacious/content-light slides
  const effectiveBackgroundVariant = spacious && backgroundVariant === "depth"
    ? "accent"  // More visual depth for content-light slides
    : backgroundVariant;

  // Show decorative orb on spacious slides for visual interest
  const showOrb = spacious;

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      {/* Background layers */}
      <SlideBackground
        variant={effectiveBackgroundVariant}
        showPattern={showPattern}
        showOrb={showOrb}
        customBackground={customBackground}
      />

      {/* Content layer with subtle entrance animation */}
      <div
        className="relative z-10 w-full h-full flex flex-col animate-slide-entrance"
        style={{
          padding: spacious
            ? 'var(--theme-spacing-slide-gutter-spacious, clamp(2.5rem, 5cqw, 4rem))'
            : 'var(--theme-spacing-slide-gutter, clamp(1.5rem, 3cqw, 2.5rem))',
          justifyContent,
          // For distributed, add padding-bottom for visual balance
          paddingBottom: isDistributed
            ? 'var(--theme-spacing-slide-gutter-bottom, clamp(2rem, 4cqw, 3rem))'
            : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
