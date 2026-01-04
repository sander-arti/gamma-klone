/**
 * Corporate Blue Theme
 *
 * Professional corporate identity with classic blue tones.
 * Suitable for business presentations and formal contexts.
 */

import type { Theme } from "./types";

export const corporateBlue: Theme = {
  id: "corporate_blue",
  name: "Corporate Blue",
  description: "Professional corporate identity",
  tokens: {
    colors: {
      // Primary palette - classic corporate blue
      primary: "#1e40af",
      primaryForeground: "#ffffff",
      secondary: "#6b7280",
      secondaryForeground: "#ffffff",
      accent: "#0369a1",
      accentForeground: "#ffffff",

      // Extended accent colors (Phase 6 - Premium)
      accentPink: "#db2777",
      accentPinkLight: "rgba(219, 39, 119, 0.08)",
      accentPurple: "#7c3aed",
      accentPurpleLight: "rgba(124, 58, 237, 0.08)",
      accentBlue: "#2563eb",
      accentBlueLight: "rgba(37, 99, 235, 0.08)",

      // Background hierarchy - clean whites
      background: "#ffffff",
      backgroundSubtle: "#f9fafb",
      backgroundMuted: "#f3f4f6",

      // Text colors
      foreground: "#111827",
      foregroundMuted: "#4b5563",

      // Semantic colors
      success: "#059669",
      warning: "#d97706",
      error: "#dc2626",
      info: "#2563eb",

      // Border colors
      border: "#d1d5db",
      borderSubtle: "#e5e7eb",
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
      fontFamilyHeading: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',

      // DISPLAY - Conservative but impactful
      displaySize: "clamp(2.75rem, 5cqw, 4rem)",
      displayWeight: "700",
      displayLineHeight: "1",
      displayLetterSpacing: "-0.025em",

      // TITLE - Professional, not too bold
      titleSize: "clamp(2.25rem, 4.5cqw, 3.25rem)",
      titleWeight: "700",
      titleLineHeight: "1.15",
      titleLetterSpacing: "-0.02em",

      // HEADING - Section headings
      headingSize: "clamp(1.375rem, 2.5cqw, 2rem)",
      headingWeight: "600",
      headingLineHeight: "1.25",
      headingLetterSpacing: "-0.015em",

      // SUBHEADING - Card titles
      subheadingSize: "clamp(1.0625rem, 1.75cqw, 1.375rem)",
      subheadingWeight: "600",
      subheadingLineHeight: "1.3",
      subheadingLetterSpacing: "-0.01em",

      // BODY LARGE - Subtitles
      bodyLargeSize: "clamp(1rem, 1.5cqw, 1.1875rem)",
      bodyLargeWeight: "400",
      bodyLargeLineHeight: "1.6",

      // BODY - Default text
      bodySize: "clamp(0.9375rem, 1.35cqw, 1.0625rem)",
      bodyWeight: "400",
      bodyLineHeight: "1.65",

      // BODY SMALL - Secondary text
      bodySmallSize: "clamp(0.8125rem, 1.15cqw, 0.9375rem)",
      bodySmallWeight: "400",
      bodySmallLineHeight: "1.6",

      // CAPTION - Labels
      captionSize: "clamp(0.6875rem, 0.95cqw, 0.8125rem)",
      captionWeight: "500",
      captionLineHeight: "1.4",
      captionLetterSpacing: "0.02em",

      // QUOTE
      quoteSize: "clamp(1.125rem, 2cqw, 1.5rem)",
      quoteWeight: "400",
      quoteStyle: "italic",
      quoteLineHeight: "1.5",

      // Legacy
      smallSize: "clamp(0.8125rem, 1.15cqw, 0.9375rem)",

      letterSpacingTight: "-0.02em",
      letterSpacingNormal: "0",
      letterSpacingWide: "0.03em",
    },
    spacing: {
      // Base unit for calculations
      unit: "8px",

      // 8px grid scale (slightly tighter for corporate/professional)
      xs: "clamp(0.25rem, 0.35cqw, 0.375rem)",   // ~4-6px
      sm: "clamp(0.5rem, 0.7cqw, 0.625rem)",     // ~8-10px
      md: "clamp(0.875rem, 1.25cqw, 1.125rem)",  // ~14-18px
      lg: "clamp(1.25rem, 1.75cqw, 1.75rem)",    // ~20-28px
      xl: "clamp(1.75rem, 2.5cqw, 2.25rem)",     // ~28-36px
      xxl: "clamp(2.5rem, 3.5cqw, 3.5rem)",      // ~40-56px
      xxxl: "clamp(3.5rem, 5cqw, 4.5rem)",       // ~56-72px

      // Semantic tokens (professional, structured spacing)
      slideGutter: "clamp(2.5rem, 4.5cqw, 4.5rem)", // Slightly tighter
      sectionGap: "clamp(2rem, 3.5cqw, 3rem)",      // Clean section breaks
      blockGap: "clamp(1.25rem, 1.75cqw, 1.75rem)", // Structured content
      contentPadding: "clamp(1rem, 1.5cqw, 1.25rem)", // Compact cards
      itemGap: "clamp(0.625rem, 0.9cqw, 0.875rem)", // Tighter list items
      inlineGap: "clamp(0.375rem, 0.6cqw, 0.5rem)", // Compact inline

      // Legacy tokens
      bulletIndent: "1.75em",
      tableGap: "clamp(0.875rem, 1.25cqw, 1.125rem)",
    },
    effects: {
      // Border radius - more subtle for corporate
      borderRadius: "0.5rem",
      borderRadiusSmall: "0.25rem",
      borderRadiusLarge: "0.75rem",

      // Box shadows - subtle
      boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
      boxShadowSmall: "0 1px 2px rgb(0 0 0 / 0.05)",
      boxShadowLarge: "0 8px 20px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)",

      // Callout styling
      calloutBorderWidth: "3px",

      // Professional gradients
      gradientPrimary: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
      gradientAccent: "linear-gradient(135deg, #0369a1 0%, #075985 100%)",
      gradientBackground: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",

      // Glassmorphism effects (Phase 6 - Premium)
      glassBackground: "rgba(255, 255, 255, 0.8)",
      glassBackdropBlur: "blur(10px)",
      glassBorder: "1px solid rgba(209, 213, 219, 0.3)",

      // Colored shadows - subtle for corporate
      shadowPink: "0 4px 12px rgba(219, 39, 119, 0.1)",
      shadowPurple: "0 4px 12px rgba(124, 58, 237, 0.1)",
      shadowBlue: "0 4px 12px rgba(37, 99, 235, 0.1)",

      // Overlay for images
      overlayDark: "linear-gradient(180deg, transparent 0%, rgba(17, 24, 39, 0.7) 100%)",
      overlayLight: "linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)",

      // Slide background system (Punkt 3)
      // Professional gradient with deep blue tint
      slideBackgroundGradient: "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(239, 246, 255, 0.4) 100%)",
      // Subtle vignette for professional focus
      slideBackgroundRadial: "radial-gradient(ellipse at center, transparent 0%, rgba(30, 58, 138, 0.02) 100%)",
      // Corporate corner accent
      slideBackgroundCorner: "radial-gradient(ellipse at top right, rgba(37, 99, 235, 0.04) 0%, transparent 45%)",
      // Professional pattern
      slidePatternColor: "rgba(30, 58, 138, 0.03)",
      slidePatternOpacity: "0.4",

      // Image styling system (Punkt 5) - Professional/conservative
      imageBorderRadius: "0.5rem",
      imageShadow: "0 2px 8px -1px rgba(0, 0, 0, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.03)",
      imageShadowFloating: "0 16px 32px -8px rgba(0, 0, 0, 0.12), 0 6px 16px -4px rgba(0, 0, 0, 0.08)",
      imageInnerShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.03)",
      imageFrameColor: "rgba(30, 58, 138, 0.08)",
      imageFrameWidth: "3px",
      imagePlaceholderBg: "linear-gradient(135deg, #e0e7ff 0%, #eff6ff 100%)",
    },
  },
};
