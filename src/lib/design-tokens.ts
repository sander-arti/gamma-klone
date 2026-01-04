/**
 * Design Tokens - Extended design system values
 *
 * These tokens complement the theme system with:
 * - Animation values (duration, easing, keyframes)
 * - Extended shadows for depth
 * - Gradient utilities
 * - Spacing scale (8px base grid)
 *
 * Theme-specific colors come from src/lib/themes/*.ts
 * These tokens are theme-agnostic utilities.
 */

/**
 * Animation duration tokens
 */
export const duration = {
  instant: "0ms",
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
  slower: "700ms",
} as const;

/**
 * Easing function tokens
 * Based on Material Design and Apple HIG recommendations
 */
export const easing = {
  /** Standard easing for most animations */
  ease: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Accelerating from rest */
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  /** Decelerating to rest */
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  /** Elements entering screen */
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Bouncy spring effect */
  spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  /** Smooth entrance */
  entrance: "cubic-bezier(0, 0, 0.2, 1)",
  /** Smooth exit */
  exit: "cubic-bezier(0.4, 0, 1, 1)",
} as const;

/**
 * Spacing scale (8px base)
 * Use these for consistent spacing throughout the UI
 */
export const spacing = {
  0: "0",
  px: "1px",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
} as const;

/**
 * Extended shadow tokens with depth levels
 * Use higher numbers for more elevated elements
 */
export const shadow = {
  none: "none",
  xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  /** Subtle glow effect */
  glow: "0 0 15px rgba(37, 99, 235, 0.2)",
} as const;

/**
 * Border radius tokens
 */
export const radius = {
  none: "0",
  sm: "0.25rem", // 4px
  md: "0.375rem", // 6px
  DEFAULT: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  "2xl": "1.5rem", // 24px
  "3xl": "2rem", // 32px
  full: "9999px",
} as const;

/**
 * Z-index scale for consistent layering
 */
export const zIndex = {
  behind: -1,
  base: 0,
  above: 10,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
  toast: 600,
  overlay: 700,
} as const;

/**
 * Typography scale
 * Font sizes with recommended line heights
 */
export const fontSize = {
  xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
  sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
  base: ["1rem", { lineHeight: "1.5rem" }], // 16px
  lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
  xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
  "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
  "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
  "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
  "5xl": ["3rem", { lineHeight: "1.1" }], // 48px
  "6xl": ["3.75rem", { lineHeight: "1.1" }], // 60px
  "7xl": ["4.5rem", { lineHeight: "1.1" }], // 72px
} as const;

/**
 * Complete design tokens export
 */
export const tokens = {
  duration,
  easing,
  spacing,
  shadow,
  radius,
  zIndex,
  fontSize,
} as const;

/**
 * CSS custom property generators
 */
export function generateCssVars(): Record<string, string> {
  const vars: Record<string, string> = {};

  // Duration
  Object.entries(duration).forEach(([key, value]) => {
    vars[`--duration-${key}`] = value;
  });

  // Easing
  Object.entries(easing).forEach(([key, value]) => {
    vars[`--ease-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`] = value;
  });

  // Shadows
  Object.entries(shadow).forEach(([key, value]) => {
    vars[`--shadow-${key}`] = value;
  });

  // Radius
  Object.entries(radius).forEach(([key, value]) => {
    const cssKey = key === "DEFAULT" ? "default" : key;
    vars[`--radius-${cssKey}`] = value;
  });

  return vars;
}

export default tokens;
