/**
 * Minimal Warm Theme
 *
 * Minimalist design with warm, earthy tones.
 * Approachable and friendly for creative presentations.
 */

import type { Theme } from "./types";

export const minimalWarm: Theme = {
  id: "minimal_warm",
  name: "Minimal Warm",
  description: "Minimalist with warm tones",
  tokens: {
    colors: {
      // Primary palette - warm terracotta
      primary: "#c2410c",
      primaryForeground: "#ffffff",
      secondary: "#78716c",
      secondaryForeground: "#ffffff",
      accent: "#b45309",
      accentForeground: "#ffffff",

      // Extended accent colors (Phase 6 - Premium)
      accentPink: "#be185d",
      accentPinkLight: "rgba(190, 24, 93, 0.08)",
      accentPurple: "#7e22ce",
      accentPurpleLight: "rgba(126, 34, 206, 0.08)",
      accentBlue: "#1d4ed8",
      accentBlueLight: "rgba(29, 78, 216, 0.08)",

      // Background hierarchy - warm cream
      background: "#faf8f5",
      backgroundSubtle: "#f5f1eb",
      backgroundMuted: "#ebe5db",

      // Text colors - warm gray
      foreground: "#292524",
      foregroundMuted: "#57534e",

      // Semantic colors
      success: "#15803d",
      warning: "#a16207",
      error: "#b91c1c",
      info: "#0369a1",

      // Border colors
      border: "#d6d3d1",
      borderSubtle: "#e7e5e4",
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
      fontFamilyHeading: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',

      // DISPLAY - Elegant, not too heavy
      displaySize: "clamp(2.75rem, 5.5cqw, 4.25rem)",
      displayWeight: "700",
      displayLineHeight: "1.05",
      displayLetterSpacing: "-0.025em",

      // TITLE - Refined, dramatic
      titleSize: "clamp(2.5rem, 5cqw, 3.5rem)",
      titleWeight: "600",
      titleLineHeight: "1.1",
      titleLetterSpacing: "-0.02em",

      // HEADING - Lighter weight for elegance
      headingSize: "clamp(1.5rem, 2.75cqw, 2.125rem)",
      headingWeight: "500",
      headingLineHeight: "1.25",
      headingLetterSpacing: "-0.015em",

      // SUBHEADING
      subheadingSize: "clamp(1.125rem, 1.875cqw, 1.4375rem)",
      subheadingWeight: "500",
      subheadingLineHeight: "1.35",
      subheadingLetterSpacing: "-0.01em",

      // BODY LARGE - Generous line height for warmth
      bodyLargeSize: "clamp(1.0625rem, 1.625cqw, 1.25rem)",
      bodyLargeWeight: "400",
      bodyLargeLineHeight: "1.7",

      // BODY
      bodySize: "clamp(0.9375rem, 1.375cqw, 1.0625rem)",
      bodyWeight: "400",
      bodyLineHeight: "1.7",

      // BODY SMALL
      bodySmallSize: "clamp(0.8125rem, 1.175cqw, 0.9375rem)",
      bodySmallWeight: "400",
      bodySmallLineHeight: "1.65",

      // CAPTION
      captionSize: "clamp(0.6875rem, 0.975cqw, 0.8125rem)",
      captionWeight: "500",
      captionLineHeight: "1.4",
      captionLetterSpacing: "0.02em",

      // QUOTE - Warm and inviting
      quoteSize: "clamp(1.25rem, 2.5cqw, 1.75rem)",
      quoteWeight: "400",
      quoteStyle: "italic",
      quoteLineHeight: "1.6",

      // Legacy
      smallSize: "clamp(0.8125rem, 1.175cqw, 0.9375rem)",

      letterSpacingTight: "-0.02em",
      letterSpacingNormal: "0",
      letterSpacingWide: "0.04em",
    },
    spacing: {
      // Base unit for calculations
      unit: "8px",

      // 8px grid scale (extra generous for minimal aesthetic)
      xs: "clamp(0.25rem, 0.5cqw, 0.5rem)",      // ~4-8px
      sm: "clamp(0.5rem, 1cqw, 0.875rem)",       // ~8-14px
      md: "clamp(1rem, 1.75cqw, 1.5rem)",        // ~16-24px
      lg: "clamp(1.75rem, 2.5cqw, 2.25rem)",     // ~28-36px
      xl: "clamp(2.25rem, 3.5cqw, 3rem)",        // ~36-48px
      xxl: "clamp(3.5rem, 5cqw, 4.5rem)",        // ~56-72px
      xxxl: "clamp(4.5rem, 7cqw, 6rem)",         // ~72-96px

      // Semantic tokens (generous breathing room, calm aesthetic)
      slideGutter: "clamp(3.5rem, 6cqw, 5.5rem)",   // Very generous edges
      sectionGap: "clamp(3rem, 5cqw, 4rem)",        // Calm section breaks
      blockGap: "clamp(1.75rem, 2.5cqw, 2.25rem)",  // Relaxed content spacing
      contentPadding: "clamp(1.5rem, 2cqw, 1.75rem)", // Airy card padding
      itemGap: "clamp(0.875rem, 1.25cqw, 1.125rem)", // Relaxed list items
      inlineGap: "clamp(0.5rem, 0.875cqw, 0.75rem)", // Comfortable inline

      // Legacy tokens
      bulletIndent: "1.5em",
      tableGap: "clamp(1.125rem, 1.6cqw, 1.375rem)",
    },
    effects: {
      // Border radius - subtle
      borderRadius: "0.375rem",
      borderRadiusSmall: "0.25rem",
      borderRadiusLarge: "0.5rem",

      // Box shadows - minimal
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
      boxShadowSmall: "0 1px 1px rgba(0, 0, 0, 0.03)",
      boxShadowLarge: "0 4px 12px rgba(0, 0, 0, 0.06)",

      // Callout styling
      calloutBorderWidth: "2px",

      // Warm, subtle gradients
      gradientPrimary: "linear-gradient(135deg, #c2410c 0%, #9a3412 100%)",
      gradientAccent: "linear-gradient(135deg, #b45309 0%, #92400e 100%)",
      gradientBackground: "linear-gradient(180deg, #faf8f5 0%, #f5f1eb 100%)",

      // Glassmorphism effects (Phase 6 - Premium)
      glassBackground: "rgba(250, 248, 245, 0.7)",
      glassBackdropBlur: "blur(8px)",
      glassBorder: "1px solid rgba(214, 211, 209, 0.3)",

      // Colored shadows - warm tones
      shadowPink: "0 4px 12px rgba(190, 24, 93, 0.08)",
      shadowPurple: "0 4px 12px rgba(126, 34, 206, 0.08)",
      shadowBlue: "0 4px 12px rgba(29, 78, 216, 0.08)",

      // Overlay for images
      overlayDark: "linear-gradient(180deg, transparent 0%, rgba(41, 37, 36, 0.6) 100%)",
      overlayLight: "linear-gradient(180deg, rgba(250, 248, 245, 0.1) 0%, rgba(250, 248, 245, 0.95) 100%)",

      // Slide background system (Punkt 3)
      // Warm, cream-tinted gradient
      slideBackgroundGradient: "linear-gradient(180deg, rgba(255, 253, 250, 0.6) 0%, rgba(250, 248, 245, 0.3) 100%)",
      // Soft warm vignette
      slideBackgroundRadial: "radial-gradient(ellipse at center, transparent 0%, rgba(120, 53, 15, 0.015) 100%)",
      // Warm corner accent
      slideBackgroundCorner: "radial-gradient(ellipse at top right, rgba(217, 119, 6, 0.025) 0%, transparent 50%)",
      // Warm minimal pattern
      slidePatternColor: "rgba(180, 83, 9, 0.02)",
      slidePatternOpacity: "0.3",

      // Image styling system (Punkt 5) - Soft, minimal aesthetic
      imageBorderRadius: "0.375rem",
      imageShadow: "0 2px 6px -1px rgba(120, 53, 15, 0.06), 0 1px 3px -1px rgba(120, 53, 15, 0.04)",
      imageShadowFloating: "0 16px 36px -10px rgba(120, 53, 15, 0.1), 0 6px 14px -4px rgba(120, 53, 15, 0.06)",
      imageInnerShadow: "inset 0 0 0 1px rgba(120, 53, 15, 0.03)",
      imageFrameColor: "rgba(254, 243, 199, 0.8)",
      imageFrameWidth: "3px",
      imagePlaceholderBg: "linear-gradient(135deg, #fef3c7 0%, #faf5f0 100%)",
    },
  },
};
