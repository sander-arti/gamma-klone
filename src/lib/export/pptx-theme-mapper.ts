/**
 * PPTX Theme Mapper
 *
 * Converts theme tokens to PptxGenJS-compatible styles.
 * PptxGenJS uses different units and formats than CSS.
 */

import type { ThemeTokens } from "@/lib/themes";

/**
 * Slide dimensions in inches (standard PowerPoint 16:9)
 */
export const PPTX_DIMENSIONS = {
  width: 13.333, // inches (16:9 ratio)
  height: 7.5, // inches
} as const;

/**
 * Convert hex color to PPTX format (without #)
 */
export function hexToRgb(hex: string): string {
  return hex.replace("#", "");
}

/**
 * Convert CSS px to inches (assuming 96 DPI)
 */
export function pxToInches(px: number): number {
  return px / 96;
}

/**
 * Convert CSS rem/px size to points
 * Assumes base font size of 16px
 */
export function cssToPoints(size: string): number {
  if (size.endsWith("rem")) {
    const rem = parseFloat(size);
    return rem * 12; // 1rem = 16px = 12pt
  }
  if (size.endsWith("px")) {
    const px = parseFloat(size);
    return px * 0.75; // 1px = 0.75pt
  }
  return parseFloat(size) || 12;
}

/**
 * Extract font family name (first one in fallback list)
 */
export function extractFontFamily(fontFamily: string): string {
  const firstFont = fontFamily.split(",")[0].trim();
  // Remove quotes if present
  return firstFont.replace(/["']/g, "");
}

/**
 * PPTX text style options
 */
export interface PptxTextStyle {
  fontFace: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic?: boolean;
}

/**
 * PPTX styles derived from theme
 */
export interface PptxThemeStyles {
  title: PptxTextStyle;
  heading: PptxTextStyle;
  body: PptxTextStyle;
  small: PptxTextStyle;
  quote: PptxTextStyle;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    background: string;
    backgroundSubtle: string;
    foreground: string;
    foregroundMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  defaultFont: string;
  headingFont: string;
}

/**
 * Convert theme tokens to PPTX styles
 */
export function themeToPptxStyles(tokens: ThemeTokens): PptxThemeStyles {
  const defaultFont = extractFontFamily(tokens.typography.fontFamily);
  const headingFont = extractFontFamily(tokens.typography.fontFamilyHeading);

  return {
    title: {
      fontFace: headingFont,
      fontSize: cssToPoints(tokens.typography.titleSize),
      color: hexToRgb(tokens.colors.foreground),
      bold: parseInt(tokens.typography.titleWeight) >= 600,
    },
    heading: {
      fontFace: headingFont,
      fontSize: cssToPoints(tokens.typography.headingSize),
      color: hexToRgb(tokens.colors.foreground),
      bold: parseInt(tokens.typography.headingWeight) >= 600,
    },
    body: {
      fontFace: defaultFont,
      fontSize: cssToPoints(tokens.typography.bodySize),
      color: hexToRgb(tokens.colors.foreground),
      bold: parseInt(tokens.typography.bodyWeight) >= 600,
    },
    small: {
      fontFace: defaultFont,
      fontSize: cssToPoints(tokens.typography.smallSize),
      color: hexToRgb(tokens.colors.foregroundMuted),
      bold: false,
    },
    quote: {
      fontFace: defaultFont,
      fontSize: cssToPoints(tokens.typography.quoteSize),
      color: hexToRgb(tokens.colors.foreground),
      bold: false,
      italic: tokens.typography.quoteStyle === "italic",
    },
    colors: {
      primary: hexToRgb(tokens.colors.primary),
      primaryForeground: hexToRgb(tokens.colors.primaryForeground),
      secondary: hexToRgb(tokens.colors.secondary),
      secondaryForeground: hexToRgb(tokens.colors.secondaryForeground),
      background: hexToRgb(tokens.colors.background),
      backgroundSubtle: hexToRgb(tokens.colors.backgroundSubtle),
      foreground: hexToRgb(tokens.colors.foreground),
      foregroundMuted: hexToRgb(tokens.colors.foregroundMuted),
      border: hexToRgb(tokens.colors.border),
      success: hexToRgb(tokens.colors.success),
      warning: hexToRgb(tokens.colors.warning),
      error: hexToRgb(tokens.colors.error),
      info: hexToRgb(tokens.colors.info),
    },
    defaultFont,
    headingFont,
  };
}

/**
 * Standard slide margins in inches
 */
export const SLIDE_MARGINS = {
  left: 0.5,
  right: 0.5,
  top: 0.5,
  bottom: 0.5,
} as const;

/**
 * Content area dimensions (after margins)
 */
export const CONTENT_AREA = {
  x: SLIDE_MARGINS.left,
  y: SLIDE_MARGINS.top,
  width: PPTX_DIMENSIONS.width - SLIDE_MARGINS.left - SLIDE_MARGINS.right,
  height: PPTX_DIMENSIONS.height - SLIDE_MARGINS.top - SLIDE_MARGINS.bottom,
} as const;
