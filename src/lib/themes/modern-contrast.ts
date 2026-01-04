/**
 * Modern Contrast Theme
 *
 * High-contrast contemporary design with bold colors.
 * Impactful for presentations that need to stand out.
 */

import type { Theme } from "./types";

export const modernContrast: Theme = {
  id: "modern_contrast",
  name: "Modern Contrast",
  description: "High-contrast contemporary design",
  tokens: {
    colors: {
      // Primary palette - vibrant purple
      primary: "#7c3aed",
      primaryForeground: "#ffffff",
      secondary: "#374151",
      secondaryForeground: "#ffffff",
      accent: "#ec4899",
      accentForeground: "#ffffff",

      // Extended accent colors (Phase 6 - Premium)
      accentPink: "#ec4899",
      accentPinkLight: "rgba(236, 72, 153, 0.12)",
      accentPurple: "#8b5cf6",
      accentPurpleLight: "rgba(139, 92, 246, 0.12)",
      accentBlue: "#3b82f6",
      accentBlueLight: "rgba(59, 130, 246, 0.12)",

      // Background hierarchy - pure black/white
      background: "#ffffff",
      backgroundSubtle: "#fafafa",
      backgroundMuted: "#f4f4f5",

      // Text colors - maximum contrast
      foreground: "#09090b",
      foregroundMuted: "#52525b",

      // Semantic colors - vivid
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#6366f1",

      // Border colors
      border: "#e4e4e7",
      borderSubtle: "#f4f4f5",
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
      fontFamilyHeading: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',

      // DISPLAY - Maximum impact
      displaySize: "clamp(3.25rem, 6.5cqw, 5rem)",
      displayWeight: "900",
      displayLineHeight: "0.95",
      displayLetterSpacing: "-0.035em",

      // TITLE - Bold and impactful
      titleSize: "clamp(2.75rem, 6cqw, 4rem)",
      titleWeight: "800",
      titleLineHeight: "1.05",
      titleLetterSpacing: "-0.03em",

      // HEADING - Strong hierarchy
      headingSize: "clamp(1.625rem, 3.25cqw, 2.5rem)",
      headingWeight: "700",
      headingLineHeight: "1.15",
      headingLetterSpacing: "-0.025em",

      // SUBHEADING
      subheadingSize: "clamp(1.1875rem, 2.25cqw, 1.625rem)",
      subheadingWeight: "600",
      subheadingLineHeight: "1.25",
      subheadingLetterSpacing: "-0.015em",

      // BODY LARGE
      bodyLargeSize: "clamp(1.0625rem, 1.75cqw, 1.25rem)",
      bodyLargeWeight: "400",
      bodyLargeLineHeight: "1.6",

      // BODY - Slightly reduced for contrast with bold titles
      bodySize: "clamp(0.9375rem, 1.4cqw, 1.0625rem)",
      bodyWeight: "400",
      bodyLineHeight: "1.6",

      // BODY SMALL
      bodySmallSize: "clamp(0.8125rem, 1.2cqw, 0.9375rem)",
      bodySmallWeight: "400",
      bodySmallLineHeight: "1.55",

      // CAPTION - All caps for contrast
      captionSize: "clamp(0.6875rem, 1cqw, 0.8125rem)",
      captionWeight: "600",
      captionLineHeight: "1.3",
      captionLetterSpacing: "0.04em",

      // QUOTE - Bold, not italic
      quoteSize: "clamp(1.375rem, 2.75cqw, 2rem)",
      quoteWeight: "500",
      quoteStyle: "normal",
      quoteLineHeight: "1.45",

      // Legacy
      smallSize: "clamp(0.8125rem, 1.2cqw, 0.9375rem)",

      letterSpacingTight: "-0.03em",
      letterSpacingNormal: "0",
      letterSpacingWide: "0.06em",
    },
    spacing: {
      // Base unit for calculations
      unit: "8px",

      // 8px grid scale (bold, confident spacing)
      xs: "clamp(0.25rem, 0.4cqw, 0.375rem)",    // ~4-6px
      sm: "clamp(0.5rem, 0.8cqw, 0.75rem)",      // ~8-12px
      md: "clamp(1rem, 1.5cqw, 1.25rem)",        // ~16-20px
      lg: "clamp(1.5rem, 2.25cqw, 2rem)",        // ~24-32px
      xl: "clamp(2rem, 3cqw, 2.75rem)",          // ~32-44px
      xxl: "clamp(3rem, 4.5cqw, 4rem)",          // ~48-64px
      xxxl: "clamp(4rem, 6cqw, 5.5rem)",         // ~64-88px

      // Semantic tokens (confident, modern spacing)
      slideGutter: "clamp(3rem, 5.5cqw, 5rem)",    // Bold edge padding
      sectionGap: "clamp(2.5rem, 4cqw, 3.5rem)",   // Clear section breaks
      blockGap: "clamp(1.5rem, 2.25cqw, 2rem)",    // Confident content gaps
      contentPadding: "clamp(1.25rem, 1.75cqw, 1.5rem)", // Spacious cards
      itemGap: "clamp(0.75rem, 1.1cqw, 1rem)",     // Clear list spacing
      inlineGap: "clamp(0.5rem, 0.75cqw, 0.625rem)", // Modern inline gaps

      // Legacy tokens
      bulletIndent: "1.5em",
      tableGap: "clamp(1rem, 1.5cqw, 1.25rem)",
    },
    effects: {
      // Border radius - bold
      borderRadius: "1rem",
      borderRadiusSmall: "0.5rem",
      borderRadiusLarge: "1.5rem",

      // Box shadows - pronounced
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      boxShadowSmall: "0 2px 4px rgb(0 0 0 / 0.08)",
      boxShadowLarge: "0 12px 30px -5px rgb(0 0 0 / 0.15), 0 4px 6px -4px rgb(0 0 0 / 0.1)",

      // Callout styling
      calloutBorderWidth: "4px",

      // Bold, vibrant gradients
      gradientPrimary: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)",
      gradientAccent: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
      gradientBackground: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",

      // Glassmorphism effects (Phase 6 - Premium)
      glassBackground: "rgba(255, 255, 255, 0.6)",
      glassBackdropBlur: "blur(16px)",
      glassBorder: "1px solid rgba(255, 255, 255, 0.4)",

      // Colored shadows - vibrant
      shadowPink: "0 8px 25px rgba(236, 72, 153, 0.25)",
      shadowPurple: "0 8px 25px rgba(139, 92, 246, 0.25)",
      shadowBlue: "0 8px 25px rgba(59, 130, 246, 0.25)",

      // Overlay for images
      overlayDark: "linear-gradient(180deg, transparent 0%, rgba(9, 9, 11, 0.7) 100%)",
      overlayLight: "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.95) 100%)",

      // Slide background system (Punkt 3)
      // Modern gradient with slight purple tint
      slideBackgroundGradient: "linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(250, 250, 255, 0.4) 100%)",
      // Focused vignette for modern look
      slideBackgroundRadial: "radial-gradient(ellipse at center, transparent 0%, rgba(124, 58, 237, 0.02) 100%)",
      // Bold corner accent with gradient
      slideBackgroundCorner: "radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.05) 0%, transparent 45%)",
      // Modern geometric pattern hint
      slidePatternColor: "rgba(124, 58, 237, 0.03)",
      slidePatternOpacity: "0.5",

      // Image styling system (Punkt 5) - Bold, modern aesthetic
      imageBorderRadius: "1rem",
      imageShadow: "0 6px 16px -3px rgba(124, 58, 237, 0.12), 0 3px 8px -2px rgba(0, 0, 0, 0.06)",
      imageShadowFloating: "0 24px 50px -12px rgba(124, 58, 237, 0.2), 0 10px 24px -8px rgba(0, 0, 0, 0.15)",
      imageInnerShadow: "inset 0 0 0 1px rgba(124, 58, 237, 0.06)",
      imageFrameColor: "rgba(124, 58, 237, 0.1)",
      imageFrameWidth: "4px",
      imagePlaceholderBg: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)",
    },
  },
};
