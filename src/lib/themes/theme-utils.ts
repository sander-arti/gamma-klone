/**
 * Theme Utilities
 *
 * Functions for converting theme tokens to CSS custom properties
 * and applying brand kit overrides.
 */

import type { Theme, ThemeTokens, BrandKitOverrides } from "./types";

/**
 * Convert camelCase to kebab-case
 */
function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Calculate contrasting text color for a given background
 * Returns white for dark backgrounds, black for light backgrounds
 */
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace("#", "");

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark colors, dark gray for light colors
  return luminance > 0.5 ? "#1f2937" : "#ffffff";
}

/**
 * Convert theme tokens to CSS custom properties object
 *
 * Naming convention: --theme-[category]-[property]
 * Example: --theme-color-primary, --theme-typography-title-size
 */
export function themeToCssVars(tokens: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {};

  // Colors
  for (const [key, value] of Object.entries(tokens.colors)) {
    vars[`--theme-color-${toKebabCase(key)}`] = value;
  }

  // Typography - Font families
  vars["--theme-font-family"] = tokens.typography.fontFamily;
  vars["--theme-font-family-heading"] = tokens.typography.fontFamilyHeading;

  // Display typography (hero numbers, stats)
  vars["--theme-typography-display-size"] = tokens.typography.displaySize;
  vars["--theme-typography-display-weight"] = tokens.typography.displayWeight;
  vars["--theme-typography-display-line-height"] = tokens.typography.displayLineHeight;
  vars["--theme-typography-display-letter-spacing"] = tokens.typography.displayLetterSpacing;

  // Title typography (slide titles)
  vars["--theme-typography-title-size"] = tokens.typography.titleSize;
  vars["--theme-typography-title-weight"] = tokens.typography.titleWeight;
  vars["--theme-typography-title-line-height"] = tokens.typography.titleLineHeight;
  vars["--theme-typography-title-letter-spacing"] = tokens.typography.titleLetterSpacing;

  // Heading typography (section headings)
  vars["--theme-typography-heading-size"] = tokens.typography.headingSize;
  vars["--theme-typography-heading-weight"] = tokens.typography.headingWeight;
  vars["--theme-typography-heading-line-height"] = tokens.typography.headingLineHeight;
  vars["--theme-typography-heading-letter-spacing"] = tokens.typography.headingLetterSpacing;

  // Subheading typography (card titles, h3/h4)
  vars["--theme-typography-subheading-size"] = tokens.typography.subheadingSize;
  vars["--theme-typography-subheading-weight"] = tokens.typography.subheadingWeight;
  vars["--theme-typography-subheading-line-height"] = tokens.typography.subheadingLineHeight;
  vars["--theme-typography-subheading-letter-spacing"] = tokens.typography.subheadingLetterSpacing;

  // Body Large typography (lead paragraphs, subtitles)
  vars["--theme-typography-body-large-size"] = tokens.typography.bodyLargeSize;
  vars["--theme-typography-body-large-weight"] = tokens.typography.bodyLargeWeight;
  vars["--theme-typography-body-large-line-height"] = tokens.typography.bodyLargeLineHeight;

  // Body typography (default text)
  vars["--theme-typography-body-size"] = tokens.typography.bodySize;
  vars["--theme-typography-body-weight"] = tokens.typography.bodyWeight;
  vars["--theme-typography-body-line-height"] = tokens.typography.bodyLineHeight;

  // Body Small typography (secondary text)
  vars["--theme-typography-body-small-size"] = tokens.typography.bodySmallSize;
  vars["--theme-typography-body-small-weight"] = tokens.typography.bodySmallWeight;
  vars["--theme-typography-body-small-line-height"] = tokens.typography.bodySmallLineHeight;

  // Caption typography (labels, metadata)
  vars["--theme-typography-caption-size"] = tokens.typography.captionSize;
  vars["--theme-typography-caption-weight"] = tokens.typography.captionWeight;
  vars["--theme-typography-caption-line-height"] = tokens.typography.captionLineHeight;
  vars["--theme-typography-caption-letter-spacing"] = tokens.typography.captionLetterSpacing;

  // Quote typography
  vars["--theme-typography-quote-size"] = tokens.typography.quoteSize;
  vars["--theme-typography-quote-weight"] = tokens.typography.quoteWeight;
  vars["--theme-typography-quote-style"] = tokens.typography.quoteStyle;
  vars["--theme-typography-quote-line-height"] = tokens.typography.quoteLineHeight;

  // Legacy tokens (backwards compatibility)
  vars["--theme-typography-small-size"] = tokens.typography.smallSize;

  // General letter spacing tokens
  vars["--theme-letter-spacing-tight"] = tokens.typography.letterSpacingTight;
  vars["--theme-letter-spacing-normal"] = tokens.typography.letterSpacingNormal;
  vars["--theme-letter-spacing-wide"] = tokens.typography.letterSpacingWide;

  // Spacing
  for (const [key, value] of Object.entries(tokens.spacing)) {
    vars[`--theme-spacing-${toKebabCase(key)}`] = value;
  }

  // Effects
  for (const [key, value] of Object.entries(tokens.effects)) {
    vars[`--theme-effects-${toKebabCase(key)}`] = value;
  }

  return vars;
}

/**
 * Apply brand kit overrides to a theme
 *
 * Brand kit allows per-deck customization of colors without
 * changing the underlying theme structure.
 */
export function applyBrandKit(
  theme: Theme,
  brandKit?: BrandKitOverrides
): Theme {
  // Return original theme if no brand kit
  if (!brandKit) return theme;

  // Check if there are any actual overrides
  const hasOverrides = brandKit.primaryColor || brandKit.secondaryColor;
  if (!hasOverrides) return theme;

  // Create deep copy of tokens
  const overriddenTokens: ThemeTokens = {
    ...theme.tokens,
    colors: { ...theme.tokens.colors },
  };

  // Apply primary color override
  if (brandKit.primaryColor) {
    overriddenTokens.colors.primary = brandKit.primaryColor;
    overriddenTokens.colors.primaryForeground = getContrastColor(
      brandKit.primaryColor
    );
  }

  // Apply secondary color override
  if (brandKit.secondaryColor) {
    overriddenTokens.colors.secondary = brandKit.secondaryColor;
    overriddenTokens.colors.secondaryForeground = getContrastColor(
      brandKit.secondaryColor
    );
  }

  return {
    ...theme,
    tokens: overriddenTokens,
  };
}

/**
 * Create inline style object from CSS variables
 * Used by ThemeProvider to apply variables to the DOM
 */
export function cssVarsToStyle(
  cssVars: Record<string, string>
): React.CSSProperties {
  return cssVars as unknown as React.CSSProperties;
}

/**
 * Merge multiple CSS variable objects
 */
export function mergeCssVars(
  ...varObjects: Record<string, string>[]
): Record<string, string> {
  return Object.assign({}, ...varObjects);
}
