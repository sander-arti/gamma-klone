/**
 * Theme System
 *
 * Barrel export for all theme-related functionality.
 */

// Type exports
export type {
  Theme,
  ThemeTokens,
  ThemeColors,
  ThemeTypography,
  ThemeSpacing,
  ThemeEffects,
  BrandKitOverrides,
  ThemeId,
} from "./types";

export { THEME_IDS } from "./types";

// Utility exports
export {
  themeToCssVars,
  applyBrandKit,
  getContrastColor,
  cssVarsToStyle,
  mergeCssVars,
} from "./theme-utils";

// Theme imports
import { nordicLight } from "./nordic-light";
import { nordicDark } from "./nordic-dark";
import { nordicMinimalism } from "./nordic-minimalism";
import { corporateBlue } from "./corporate-blue";
import { minimalWarm } from "./minimal-warm";
import { modernContrast } from "./modern-contrast";

import type { Theme, ThemeId } from "./types";

/**
 * All available themes
 */
export const themes: Record<ThemeId, Theme> = {
  nordic_light: nordicLight,
  nordic_dark: nordicDark,
  nordic_minimalism: nordicMinimalism,
  corporate_blue: corporateBlue,
  minimal_warm: minimalWarm,
  modern_contrast: modernContrast,
};

/**
 * Get a theme by ID
 *
 * @param themeId - The theme identifier
 * @returns The theme object
 * @throws Error if theme ID is not found
 */
export function getTheme(themeId: string): Theme {
  const theme = themes[themeId as ThemeId];

  if (!theme) {
    console.warn(`Theme "${themeId}" not found, falling back to nordic_light`);
    return themes.nordic_light;
  }

  return theme;
}

/**
 * Check if a theme ID is valid
 */
export function isValidThemeId(themeId: string): themeId is ThemeId {
  return themeId in themes;
}

/**
 * Get the default theme
 */
export function getDefaultTheme(): Theme {
  return themes.nordic_light;
}

// Direct theme exports for convenience
export { nordicLight } from "./nordic-light";
export { nordicDark } from "./nordic-dark";
export { nordicMinimalism } from "./nordic-minimalism";
export { corporateBlue } from "./corporate-blue";
export { minimalWarm } from "./minimal-warm";
export { modernContrast } from "./modern-contrast";
