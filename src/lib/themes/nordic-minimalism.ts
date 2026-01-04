/**
 * Nordic Minimalism Theme
 *
 * Dark, sophisticated Scandinavian design with soft contrasts.
 * Modern, AI-first aesthetic with glassmorphism effects.
 * Primary experience theme for ARTI Slides.
 */

import type { Theme } from "./types";

export const nordicMinimalism: Theme = {
  id: "nordic_minimalism",
  name: "Nordic Minimalism",
  description: "Modern dark theme with sophisticated, AI-first aesthetic",
  tokens: {
    colors: {
      // Primary palette - Indigo accent on near-black
      primary: "#6366f1",
      primaryForeground: "#ffffff",
      secondary: "#a1a1aa",
      secondaryForeground: "#0f0f10",
      accent: "#8b5cf6",
      accentForeground: "#ffffff",

      // Extended accent colors (Phase 6 - Premium)
      accentPink: "#ec4899",
      accentPinkLight: "rgba(236, 72, 153, 0.12)",
      accentPurple: "#8b5cf6",
      accentPurpleLight: "rgba(139, 92, 246, 0.12)",
      accentBlue: "#3b82f6",
      accentBlueLight: "rgba(59, 130, 246, 0.12)",

      // Background hierarchy - Near black base
      background: "#0f0f10",
      backgroundSubtle: "#18181b",
      backgroundMuted: "#27272a",

      // Text colors - High contrast
      foreground: "#fafafa",
      foregroundMuted: "#a1a1aa",

      // Semantic colors - Vibrant for dark bg
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",

      // Border colors - Subtle
      border: "#3f3f46",
      borderSubtle: "#27272a",
    },
    typography: {
      // Font families - System fonts for performance
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      fontFamilyHeading: '"Inter", system-ui, -apple-system, sans-serif',

      // DISPLAY - Hero numbers, stats (largest)
      displaySize: "clamp(3.5rem, 8cqw, 6rem)",
      displayWeight: "700",
      displayLineHeight: "1",
      displayLetterSpacing: "-0.03em",

      // TITLE - Slide titles
      titleSize: "clamp(2.75rem, 6cqw, 4rem)",
      titleWeight: "600",
      titleLineHeight: "1.1",
      titleLetterSpacing: "-0.025em",

      // HEADING - Section headings
      headingSize: "clamp(1.75rem, 3.5cqw, 2.5rem)",
      headingWeight: "600",
      headingLineHeight: "1.2",
      headingLetterSpacing: "-0.02em",

      // SUBHEADING - Card titles, sub-sections
      subheadingSize: "clamp(1.25rem, 2.25cqw, 1.625rem)",
      subheadingWeight: "500",
      subheadingLineHeight: "1.3",
      subheadingLetterSpacing: "-0.015em",

      // BODY LARGE - Lead paragraphs, subtitles
      bodyLargeSize: "clamp(1.125rem, 1.8cqw, 1.375rem)",
      bodyLargeWeight: "400",
      bodyLargeLineHeight: "1.6",

      // BODY - Default text
      bodySize: "clamp(1rem, 1.5cqw, 1.25rem)",
      bodyWeight: "400",
      bodyLineHeight: "1.7",

      // BODY SMALL - Secondary text
      bodySmallSize: "clamp(0.875rem, 1.25cqw, 1rem)",
      bodySmallWeight: "400",
      bodySmallLineHeight: "1.6",

      // CAPTION - Labels, metadata
      captionSize: "clamp(0.75rem, 1cqw, 0.875rem)",
      captionWeight: "500",
      captionLineHeight: "1.4",
      captionLetterSpacing: "0.02em",

      // QUOTE - Block quotes
      quoteSize: "clamp(1.375rem, 2.75cqw, 1.875rem)",
      quoteWeight: "400",
      quoteStyle: "italic",
      quoteLineHeight: "1.5",

      // Legacy token
      smallSize: "clamp(0.875rem, 1.25cqw, 1rem)",

      // General letter spacing tokens
      letterSpacingTight: "-0.02em",
      letterSpacingNormal: "-0.01em",
      letterSpacingWide: "0.04em",
    },
    spacing: {
      // Base unit for calculations
      unit: "8px",

      // 8px grid scale (responsive with container queries)
      xs: "clamp(0.25rem, 0.5cqw, 0.375rem)", // ~4-6px
      sm: "clamp(0.5rem, 1cqw, 0.875rem)", // ~8-14px
      md: "clamp(1rem, 1.75cqw, 1.5rem)", // ~16-24px
      lg: "clamp(1.75rem, 2.5cqw, 2.5rem)", // ~28-40px
      xl: "clamp(2.5rem, 3.5cqw, 3.5rem)", // ~40-56px
      xxl: "clamp(3.5rem, 5cqw, 5rem)", // ~56-80px
      xxxl: "clamp(5rem, 7cqw, 6.5rem)", // ~80-104px

      // Semantic tokens (generous "breathing room")
      slideGutter: "clamp(3.5rem, 6cqw, 6rem)", // Maps to xxl-xxxl
      sectionGap: "clamp(3rem, 4.5cqw, 4.5rem)", // Large section breaks
      blockGap: "clamp(2rem, 2.75cqw, 2.75rem)", // Between content blocks
      contentPadding: "clamp(1.5rem, 2cqw, 2rem)", // Inside cards
      itemGap: "clamp(1rem, 1.25cqw, 1.25rem)", // List items, grid gaps
      inlineGap: "clamp(0.625rem, 0.875cqw, 0.875rem)", // Icon-text spacing

      // Legacy tokens
      bulletIndent: "1.75em",
      tableGap: "clamp(1.25rem, 1.75cqw, 1.5rem)",
    },
    effects: {
      // Border radius - Slightly larger for modern feel
      borderRadius: "0.875rem",
      borderRadiusSmall: "0.5rem",
      borderRadiusLarge: "1.25rem",

      // Box shadows - Optimized for dark mode with subtle glow
      boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.4)",
      boxShadowSmall: "0 0 0 1px rgba(255, 255, 255, 0.04), 0 2px 6px rgba(0, 0, 0, 0.3)",
      boxShadowLarge: "0 0 0 1px rgba(255, 255, 255, 0.06), 0 12px 32px rgba(0, 0, 0, 0.5)",

      // Callout styling
      calloutBorderWidth: "3px",

      // Dark mode gradients with subtle depth
      gradientPrimary: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
      gradientAccent: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      gradientBackground: "linear-gradient(180deg, #0f0f10 0%, #18181b 100%)",

      // Glassmorphism effects - Key to Nordic Minimalism
      glassBackground: "rgba(24, 24, 27, 0.8)",
      glassBackdropBlur: "blur(12px)",
      glassBorder: "1px solid rgba(255, 255, 255, 0.06)",

      // Colored shadows with soft glow effect
      shadowPink: "0 4px 24px rgba(236, 72, 153, 0.2)",
      shadowPurple: "0 4px 24px rgba(139, 92, 246, 0.2)",
      shadowBlue: "0 4px 24px rgba(59, 130, 246, 0.2)",

      // Overlay for images
      overlayDark: "linear-gradient(180deg, transparent 0%, rgba(15, 15, 16, 0.85) 100%)",
      overlayLight: "linear-gradient(180deg, rgba(15, 15, 16, 0.2) 0%, rgba(15, 15, 16, 0.9) 100%)",

      // Slide background system
      // Subtle gradient adding depth
      slideBackgroundGradient:
        "linear-gradient(180deg, rgba(24, 24, 27, 0.5) 0%, rgba(15, 15, 16, 0.3) 100%)",
      // Radial vignette for focus
      slideBackgroundRadial:
        "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.12) 100%)",
      // Corner accent with primary glow
      slideBackgroundCorner:
        "radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.06) 0%, transparent 50%)",
      // Pattern overlay (subtle dots on dark)
      slidePatternColor: "rgba(161, 161, 170, 0.03)",
      slidePatternOpacity: "0.3",

      // Image styling system
      imageBorderRadius: "0.875rem",
      imageShadow: "0 4px 20px -4px rgba(0, 0, 0, 0.5), 0 2px 8px -2px rgba(0, 0, 0, 0.35)",
      imageShadowFloating:
        "0 28px 56px -16px rgba(0, 0, 0, 0.55), 0 16px 32px -12px rgba(0, 0, 0, 0.45)",
      imageInnerShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.04)",
      imageFrameColor: "rgba(24, 24, 27, 0.95)",
      imageFrameWidth: "3px",
      imagePlaceholderBg: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
    },
  },
};
