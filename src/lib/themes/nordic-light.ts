/**
 * Nordic Light Theme
 *
 * Clean Scandinavian design with soft, muted colors.
 * Primary theme for professional presentations.
 */

import type { Theme } from "./types";

export const nordicLight: Theme = {
  id: "nordic_light",
  name: "Nordic Light",
  description: "Clean Scandinavian design with soft colors",
  tokens: {
    colors: {
      // Primary palette - soft blue
      primary: "#2563eb",
      primaryForeground: "#ffffff",
      secondary: "#64748b",
      secondaryForeground: "#ffffff",
      accent: "#0891b2",
      accentForeground: "#ffffff",

      // Extended accent colors (Phase 6 - Premium)
      accentPink: "#ec4899",
      accentPinkLight: "rgba(236, 72, 153, 0.1)",
      accentPurple: "#8b5cf6",
      accentPurpleLight: "rgba(139, 92, 246, 0.1)",
      accentBlue: "#3b82f6",
      accentBlueLight: "rgba(59, 130, 246, 0.1)",

      // Background hierarchy - warm whites
      background: "#f8fafc",
      backgroundSubtle: "#f1f5f9",
      backgroundMuted: "#e2e8f0",

      // Text colors
      foreground: "#0f172a",
      foregroundMuted: "#475569",

      // Semantic colors
      success: "#16a34a",
      warning: "#ca8a04",
      error: "#dc2626",
      info: "#0284c7",

      // Border colors
      border: "#cbd5e1",
      borderSubtle: "#e2e8f0",
    },
    typography: {
      // Font families
      fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
      fontFamilyHeading: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',

      // =================================================================
      // DISPLAY - Hero numbers, stats (largest, most impactful)
      // =================================================================
      displaySize: "clamp(3rem, 6cqw, 4.5rem)",
      displayWeight: "800",
      displayLineHeight: "1",
      displayLetterSpacing: "-0.03em",

      // =================================================================
      // TITLE - Slide titles (dramatic, attention-grabbing)
      // Increased from 5rem to 5.5rem max for more "wow"
      // =================================================================
      titleSize: "clamp(2.5rem, 5.5cqw, 3.5rem)",
      titleWeight: "700",
      titleLineHeight: "1.1",
      titleLetterSpacing: "-0.025em",

      // =================================================================
      // HEADING - Section headings (h2 equivalent, clear hierarchy)
      // =================================================================
      headingSize: "clamp(1.5rem, 3cqw, 2.25rem)",
      headingWeight: "600",
      headingLineHeight: "1.2",
      headingLetterSpacing: "-0.02em",

      // =================================================================
      // SUBHEADING - Card titles, sub-sections (h3/h4)
      // =================================================================
      subheadingSize: "clamp(1.125rem, 2cqw, 1.5rem)",
      subheadingWeight: "600",
      subheadingLineHeight: "1.3",
      subheadingLetterSpacing: "-0.01em",

      // =================================================================
      // BODY LARGE - Lead paragraphs, slide subtitles
      // Lighter weight for better title contrast
      // =================================================================
      bodyLargeSize: "clamp(1.0625rem, 1.75cqw, 1.25rem)",
      bodyLargeWeight: "400",
      bodyLargeLineHeight: "1.6",

      // =================================================================
      // BODY - Default text (optimized for readability)
      // Slightly reduced to create more hierarchy contrast
      // =================================================================
      bodySize: "clamp(0.9375rem, 1.4cqw, 1.125rem)",
      bodyWeight: "400",
      bodyLineHeight: "1.65",

      // =================================================================
      // BODY SMALL - Secondary text, supporting info
      // =================================================================
      bodySmallSize: "clamp(0.8125rem, 1.2cqw, 0.9375rem)",
      bodySmallWeight: "400",
      bodySmallLineHeight: "1.6",

      // =================================================================
      // CAPTION - Labels, metadata, table headers
      // =================================================================
      captionSize: "clamp(0.6875rem, 1cqw, 0.8125rem)",
      captionWeight: "500",
      captionLineHeight: "1.4",
      captionLetterSpacing: "0.025em",

      // =================================================================
      // QUOTE - Block quotes (elegant, readable)
      // =================================================================
      quoteSize: "clamp(1.25rem, 2.5cqw, 1.75rem)",
      quoteWeight: "400",
      quoteStyle: "italic",
      quoteLineHeight: "1.5",

      // Legacy token (backwards compatibility)
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
      xs: "clamp(0.25rem, 0.4cqw, 0.375rem)", // ~4-6px
      sm: "clamp(0.5rem, 0.8cqw, 0.75rem)", // ~8-12px
      md: "clamp(1rem, 1.5cqw, 1.25rem)", // ~16-20px
      lg: "clamp(1.5rem, 2cqw, 2rem)", // ~24-32px
      xl: "clamp(2rem, 3cqw, 2.5rem)", // ~32-40px
      xxl: "clamp(3rem, 4cqw, 4rem)", // ~48-64px
      xxxl: "clamp(4rem, 6cqw, 5rem)", // ~64-80px

      // Semantic tokens (generous "breathing room")
      slideGutter: "clamp(3rem, 5cqw, 5rem)", // Maps to xxl-xxxl
      sectionGap: "clamp(2.5rem, 4cqw, 3.5rem)", // Large section breaks
      blockGap: "clamp(1.5rem, 2cqw, 2rem)", // Between content blocks
      contentPadding: "clamp(1.25rem, 1.75cqw, 1.5rem)", // Inside cards
      itemGap: "clamp(0.75rem, 1cqw, 1rem)", // List items, grid gaps
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

      // Box shadows
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
      boxShadowSmall: "0 1px 3px rgb(0 0 0 / 0.08)",
      boxShadowLarge: "0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.08)",

      // Callout styling
      calloutBorderWidth: "4px",

      // Gradients for visual depth
      gradientPrimary: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      gradientAccent: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
      gradientBackground: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",

      // Glassmorphism effects (Phase 6 - Premium)
      glassBackground: "rgba(255, 255, 255, 0.7)",
      glassBackdropBlur: "blur(12px)",
      glassBorder: "1px solid rgba(255, 255, 255, 0.3)",

      // Colored shadows for premium cards
      shadowPink: "0 4px 14px rgba(236, 72, 153, 0.15)",
      shadowPurple: "0 4px 14px rgba(139, 92, 246, 0.15)",
      shadowBlue: "0 4px 14px rgba(59, 130, 246, 0.15)",

      // Overlay for images
      overlayDark: "linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 100%)",
      overlayLight:
        "linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)",

      // Slide background system (Punkt 3)
      // Subtle top-to-bottom gradient for depth
      slideBackgroundGradient:
        "linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(241, 245, 249, 0.3) 100%)",
      // Radial gradient for soft vignette/focus effect
      slideBackgroundRadial:
        "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.02) 100%)",
      // Corner accent with primary color
      slideBackgroundCorner:
        "radial-gradient(ellipse at top right, rgba(37, 99, 235, 0.03) 0%, transparent 50%)",
      // Pattern overlay (subtle dots)
      slidePatternColor: "rgba(37, 99, 235, 0.04)",
      slidePatternOpacity: "0.5",

      // Image styling system (Punkt 5)
      imageBorderRadius: "0.75rem",
      imageShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)",
      imageShadowFloating:
        "0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 8px 20px -8px rgba(0, 0, 0, 0.1)",
      imageInnerShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.04)",
      imageFrameColor: "rgba(255, 255, 255, 0.9)",
      imageFrameWidth: "4px",
      imagePlaceholderBg: "linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%)",
    },
  },
};
