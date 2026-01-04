/**
 * Nordic Dark Theme
 *
 * Dark Scandinavian design with deep blues and soft contrasts.
 * Elegant dark mode for professional presentations.
 */

import type { Theme } from "./types";

export const nordicDark: Theme = {
  id: "nordic_dark",
  name: "Nordic Dark",
  description: "Elegant dark Scandinavian aesthetic",
  tokens: {
    colors: {
      // Primary palette - bright blue on dark
      primary: "#3b82f6",
      primaryForeground: "#ffffff",
      secondary: "#94a3b8",
      secondaryForeground: "#0f172a",
      accent: "#22d3ee",
      accentForeground: "#0f172a",

      // Extended accent colors (Phase 6 - Premium)
      accentPink: "#f472b6",
      accentPinkLight: "rgba(244, 114, 182, 0.15)",
      accentPurple: "#a78bfa",
      accentPurpleLight: "rgba(167, 139, 250, 0.15)",
      accentBlue: "#60a5fa",
      accentBlueLight: "rgba(96, 165, 250, 0.15)",

      // Background hierarchy - deep blues
      background: "#0f172a",
      backgroundSubtle: "#1e293b",
      backgroundMuted: "#334155",

      // Text colors - high contrast
      foreground: "#f1f5f9",
      foregroundMuted: "#94a3b8",

      // Semantic colors - brighter for dark bg
      success: "#22c55e",
      warning: "#eab308",
      error: "#ef4444",
      info: "#38bdf8",

      // Border colors
      border: "#475569",
      borderSubtle: "#334155",
    },
    typography: {
      // Font families
      fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
      fontFamilyHeading: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',

      // DISPLAY - Hero numbers, stats
      displaySize: "clamp(3rem, 6cqw, 4.5rem)",
      displayWeight: "800",
      displayLineHeight: "1",
      displayLetterSpacing: "-0.03em",

      // TITLE - Slide titles
      titleSize: "clamp(2.5rem, 5.5cqw, 3.5rem)",
      titleWeight: "700",
      titleLineHeight: "1.1",
      titleLetterSpacing: "-0.025em",

      // HEADING - Section headings
      headingSize: "clamp(1.5rem, 3cqw, 2.25rem)",
      headingWeight: "600",
      headingLineHeight: "1.2",
      headingLetterSpacing: "-0.02em",

      // SUBHEADING - Card titles, sub-sections
      subheadingSize: "clamp(1.125rem, 2cqw, 1.5rem)",
      subheadingWeight: "600",
      subheadingLineHeight: "1.3",
      subheadingLetterSpacing: "-0.01em",

      // BODY LARGE - Lead paragraphs, subtitles
      bodyLargeSize: "clamp(1.0625rem, 1.75cqw, 1.25rem)",
      bodyLargeWeight: "400",
      bodyLargeLineHeight: "1.6",

      // BODY - Default text
      bodySize: "clamp(0.9375rem, 1.4cqw, 1.125rem)",
      bodyWeight: "400",
      bodyLineHeight: "1.65",

      // BODY SMALL - Secondary text
      bodySmallSize: "clamp(0.8125rem, 1.2cqw, 0.9375rem)",
      bodySmallWeight: "400",
      bodySmallLineHeight: "1.6",

      // CAPTION - Labels, metadata
      captionSize: "clamp(0.6875rem, 1cqw, 0.8125rem)",
      captionWeight: "500",
      captionLineHeight: "1.4",
      captionLetterSpacing: "0.025em",

      // QUOTE - Block quotes
      quoteSize: "clamp(1.25rem, 2.5cqw, 1.75rem)",
      quoteWeight: "400",
      quoteStyle: "italic",
      quoteLineHeight: "1.5",

      // Legacy token
      smallSize: "clamp(0.8125rem, 1.2cqw, 0.9375rem)",

      // General letter spacing tokens
      letterSpacingTight: "-0.025em",
      letterSpacingNormal: "0",
      letterSpacingWide: "0.05em",
    },
    spacing: {
      // Base unit for calculations
      unit: "8px",

      // 8px grid scale (responsive with container queries)
      xs: "clamp(0.25rem, 0.4cqw, 0.375rem)",    // ~4-6px
      sm: "clamp(0.5rem, 0.8cqw, 0.75rem)",      // ~8-12px
      md: "clamp(1rem, 1.5cqw, 1.25rem)",        // ~16-20px
      lg: "clamp(1.5rem, 2cqw, 2rem)",           // ~24-32px
      xl: "clamp(2rem, 3cqw, 2.5rem)",           // ~32-40px
      xxl: "clamp(3rem, 4cqw, 4rem)",            // ~48-64px
      xxxl: "clamp(4rem, 6cqw, 5rem)",           // ~64-80px

      // Semantic tokens (generous "breathing room")
      slideGutter: "clamp(3rem, 5cqw, 5rem)",    // Maps to xxl-xxxl
      sectionGap: "clamp(2.5rem, 4cqw, 3.5rem)", // Large section breaks
      blockGap: "clamp(1.5rem, 2cqw, 2rem)",     // Between content blocks
      contentPadding: "clamp(1.25rem, 1.75cqw, 1.5rem)", // Inside cards
      itemGap: "clamp(0.75rem, 1cqw, 1rem)",     // List items, grid gaps
      inlineGap: "clamp(0.5rem, 0.75cqw, 0.75rem)", // Icon-text spacing

      // Legacy tokens
      bulletIndent: "1.5em",
      tableGap: "clamp(1rem, 1.5cqw, 1.25rem)",
    },
    effects: {
      // Border radius
      borderRadius: "0.75rem",
      borderRadiusSmall: "0.375rem",
      borderRadiusLarge: "1rem",

      // Box shadows - darker for dark mode
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2)",
      boxShadowSmall: "0 1px 3px rgb(0 0 0 / 0.25)",
      boxShadowLarge: "0 10px 25px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)",

      // Callout styling
      calloutBorderWidth: "4px",

      // Dark mode gradients with subtle glow
      gradientPrimary: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      gradientAccent: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
      gradientBackground: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",

      // Glassmorphism effects for dark mode
      glassBackground: "rgba(30, 41, 59, 0.7)",
      glassBackdropBlur: "blur(12px)",
      glassBorder: "1px solid rgba(148, 163, 184, 0.1)",

      // Colored shadows with glow effect
      shadowPink: "0 4px 20px rgba(244, 114, 182, 0.25)",
      shadowPurple: "0 4px 20px rgba(167, 139, 250, 0.25)",
      shadowBlue: "0 4px 20px rgba(96, 165, 250, 0.25)",

      // Overlay for images
      overlayDark: "linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.8) 100%)",
      overlayLight: "linear-gradient(180deg, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)",

      // Slide background system (Punkt 3)
      // Subtle gradient adding depth to dark theme
      slideBackgroundGradient: "linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.2) 100%)",
      // Radial vignette for focus
      slideBackgroundRadial: "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)",
      // Corner accent with primary glow
      slideBackgroundCorner: "radial-gradient(ellipse at top right, rgba(96, 165, 250, 0.08) 0%, transparent 50%)",
      // Pattern overlay (subtle dots on dark)
      slidePatternColor: "rgba(148, 163, 184, 0.05)",
      slidePatternOpacity: "0.4",

      // Image styling system (Punkt 5)
      imageBorderRadius: "0.75rem",
      imageShadow: "0 4px 16px -2px rgba(0, 0, 0, 0.4), 0 2px 8px -2px rgba(0, 0, 0, 0.3)",
      imageShadowFloating: "0 24px 48px -12px rgba(0, 0, 0, 0.5), 0 12px 24px -8px rgba(0, 0, 0, 0.4)",
      imageInnerShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
      imageFrameColor: "rgba(30, 41, 59, 0.9)",
      imageFrameWidth: "4px",
      imagePlaceholderBg: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    },
  },
};
