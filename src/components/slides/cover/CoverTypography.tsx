"use client";

/**
 * CoverTypography Component
 *
 * Dramatic typography styling for cover slides.
 * Features:
 * - Large, bold titles with tight letter-spacing
 * - Text shadows for depth and readability
 * - Staggered animations
 * - Theme-aware colors
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface CoverTitleProps {
  children: ReactNode;
  /** Use light text (for dark backgrounds/images) */
  light?: boolean;
  /** Size variant */
  size?: "default" | "large" | "hero";
  /** Enable animation */
  animated?: boolean;
  /** Animation delay in seconds */
  delay?: number;
  /** Additional class names */
  className?: string;
  /** Editable mode */
  editable?: boolean;
  /** Content editable callback */
  onInput?: (text: string) => void;
}

const titleSizes = {
  default: "clamp(2.5rem, 6cqw, 4rem)",
  large: "clamp(3rem, 8cqw, 5.5rem)",
  hero: "clamp(3.5rem, 10cqw, 7rem)",
};

export function CoverTitle({
  children,
  light = false,
  size = "large",
  animated = true,
  delay = 0.2,
  className = "",
  editable = false,
  onInput,
}: CoverTitleProps) {
  // Override theme CSS variables when light mode is active
  // This ensures nested components (like TitleBlock) inherit correct colors
  const lightModeOverrides: React.CSSProperties = light
    ? ({
        "--theme-color-foreground": "#ffffff",
        "--theme-color-foreground-muted": "rgba(255, 255, 255, 0.9)",
      } as React.CSSProperties)
    : {};

  const baseStyle: React.CSSProperties = {
    ...lightModeOverrides,
    fontSize: titleSizes[size],
    fontWeight: 900,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    color: light ? "#ffffff" : "var(--theme-color-foreground, #0f172a)",
    textShadow: light ? "0 2px 4px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)" : "none",
    margin: 0,
    maxWidth: "90%",
    wordBreak: "break-word",
  };

  // Use div instead of h1 to avoid nesting issues when SmartBlockRenderer
  // renders TitleBlock which also uses h1. ARIA attributes maintain accessibility.
  const content = (
    <div
      role="heading"
      aria-level={1}
      style={baseStyle}
      className={className}
      contentEditable={editable}
      suppressContentEditableWarning
      onInput={(e) => onInput?.(e.currentTarget.textContent || "")}
    >
      {children}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

interface CoverSubtitleProps {
  children: ReactNode;
  /** Use light text (for dark backgrounds/images) */
  light?: boolean;
  /** Enable animation */
  animated?: boolean;
  /** Animation delay in seconds */
  delay?: number;
  /** Additional class names */
  className?: string;
  /** Max width */
  maxWidth?: string;
  /** Editable mode */
  editable?: boolean;
  /** Content editable callback */
  onInput?: (text: string) => void;
}

export function CoverSubtitle({
  children,
  light = false,
  animated = true,
  delay = 0.5,
  className = "",
  maxWidth = "600px",
  editable = false,
  onInput,
}: CoverSubtitleProps) {
  // Override theme CSS variables when light mode is active
  // This ensures nested components (like TextBlock) inherit correct colors
  const lightModeOverrides: React.CSSProperties = light
    ? ({
        "--theme-color-foreground": "#ffffff",
        "--theme-color-foreground-muted": "rgba(255, 255, 255, 0.9)",
      } as React.CSSProperties)
    : {};

  const baseStyle: React.CSSProperties = {
    ...lightModeOverrides,
    fontSize: "clamp(1.125rem, 2cqw, 1.5rem)",
    fontWeight: 400,
    letterSpacing: "0",
    lineHeight: 1.5,
    color: light ? "rgba(255, 255, 255, 0.9)" : "var(--theme-color-foreground-muted, #64748b)",
    textShadow: light ? "0 1px 2px rgba(0,0,0,0.3)" : "none",
    margin: 0,
    maxWidth,
  };

  const content = (
    <div
      style={baseStyle}
      className={className}
      contentEditable={editable}
      suppressContentEditableWarning
      onInput={(e) => onInput?.(e.currentTarget.textContent || "")}
    >
      {children}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

/**
 * Optional badge/tag above the title
 */
interface CoverBadgeProps {
  children: ReactNode;
  /** Badge color (uses theme primary if not specified) */
  color?: string;
  /** Use light variant */
  light?: boolean;
  /** Enable animation */
  animated?: boolean;
  /** Animation delay */
  delay?: number;
  className?: string;
}

export function CoverBadge({
  children,
  color,
  light = false,
  animated = true,
  delay = 0,
  className = "",
}: CoverBadgeProps) {
  const bgColor =
    color || (light ? "rgba(255,255,255,0.2)" : "var(--theme-color-primary, #2563eb)");
  const textColor = light ? "#ffffff" : "var(--theme-color-primary-foreground, #ffffff)";

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: textColor,
    backgroundColor: bgColor,
    borderRadius: "9999px",
    backdropFilter: light ? "blur(8px)" : "none",
    border: light ? "1px solid rgba(255,255,255,0.2)" : "none",
  };

  const content = (
    <span style={badgeStyle} className={className}>
      {children}
    </span>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.5,
          delay,
          ease: "easeOut",
        }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

/**
 * Container for cover text content with proper spacing
 */
interface CoverTextContainerProps {
  children: ReactNode;
  /** Vertical alignment */
  align?: "top" | "center" | "bottom";
  /** Horizontal alignment */
  justify?: "left" | "center" | "right";
  /** Padding */
  padding?: string;
  className?: string;
}

export function CoverTextContainer({
  children,
  align = "bottom",
  justify = "left",
  padding = "clamp(2rem, 5cqw, 4rem)",
  className = "",
}: CoverTextContainerProps) {
  const alignMap = {
    top: "flex-start",
    center: "center",
    bottom: "flex-end",
  };

  const justifyMap = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: justifyMap[justify],
    justifyContent: alignMap[align],
    padding,
    gap: "clamp(1rem, 2cqw, 1.5rem)",
    zIndex: 10,
  };

  return (
    <div style={containerStyle} className={className}>
      {children}
    </div>
  );
}
