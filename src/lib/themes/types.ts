/**
 * Theme System Types
 *
 * Defines the structure for theme tokens that control all visual aspects
 * of slide rendering. CSS custom properties are generated from these tokens.
 */

/**
 * Color palette tokens
 */
export interface ThemeColors {
  // Primary palette
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;

  // Extended accent colors (Phase 6 - Premium)
  accentPink: string;
  accentPinkLight: string;
  accentPurple: string;
  accentPurpleLight: string;
  accentBlue: string;
  accentBlueLight: string;

  // Background hierarchy
  background: string;
  backgroundSubtle: string;
  backgroundMuted: string;

  // Text colors
  foreground: string;
  foregroundMuted: string;

  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Border colors
  border: string;
  borderSubtle: string;
}

/**
 * Typography tokens
 *
 * Hierarchy scale (largest to smallest):
 * 1. Display - Hero numbers, stats (3.5-4rem)
 * 2. Title - Slide titles (2.75-3.5rem)
 * 3. Heading - Section headings (1.5-2rem)
 * 4. Subheading - Card titles, sub-sections (1.25-1.5rem)
 * 5. Body Large - Lead paragraphs, subtitles (1.125-1.25rem)
 * 6. Body - Default text (1-1.125rem)
 * 7. Body Small - Secondary text (0.875-1rem)
 * 8. Caption - Labels, metadata (0.75-0.875rem)
 */
export interface ThemeTypography {
  // Font families
  fontFamily: string;
  fontFamilyHeading: string;

  // Display - Hero numbers, stats (largest)
  displaySize: string;
  displayWeight: string;
  displayLineHeight: string;
  displayLetterSpacing: string;

  // Slide title (primary heading on slide)
  titleSize: string;
  titleWeight: string;
  titleLineHeight: string;
  titleLetterSpacing: string;

  // Section headings (h2 equivalent)
  headingSize: string;
  headingWeight: string;
  headingLineHeight: string;
  headingLetterSpacing: string;

  // Subheadings (h3/h4 equivalent)
  subheadingSize: string;
  subheadingWeight: string;
  subheadingLineHeight: string;
  subheadingLetterSpacing: string;

  // Body Large - Lead paragraphs, subtitles
  bodyLargeSize: string;
  bodyLargeWeight: string;
  bodyLargeLineHeight: string;

  // Body text (default)
  bodySize: string;
  bodyWeight: string;
  bodyLineHeight: string;

  // Body Small - Secondary text
  bodySmallSize: string;
  bodySmallWeight: string;
  bodySmallLineHeight: string;

  // Caption/Label text (smallest)
  captionSize: string;
  captionWeight: string;
  captionLineHeight: string;
  captionLetterSpacing: string;

  // Quote styling
  quoteSize: string;
  quoteWeight: string;
  quoteStyle: string;
  quoteLineHeight: string;

  // Legacy tokens for backwards compatibility
  smallSize: string;

  // Letter spacing tokens (general)
  letterSpacingTight: string;
  letterSpacingNormal: string;
  letterSpacingWide: string;
}

/**
 * Spacing tokens (8px grid system)
 *
 * Scale based on 8px unit:
 * xs:   4px  (0.25rem) - micro spacing
 * sm:   8px  (0.5rem)  - tight spacing
 * md:   16px (1rem)    - default content gap
 * lg:   24px (1.5rem)  - comfortable spacing
 * xl:   32px (2rem)    - generous spacing
 * 2xl:  48px (3rem)    - section spacing
 * 3xl:  64px (4rem)    - large gutters
 */
export interface ThemeSpacing {
  // Base unit for calculations
  unit: string;

  // 8px scale (responsive with clamp)
  xs: string;    // ~4px - icon gaps, micro adjustments
  sm: string;    // ~8px - tight spacing, small gaps
  md: string;    // ~16px - default content gap
  lg: string;    // ~24px - comfortable spacing
  xl: string;    // ~32px - generous spacing
  xxl: string;   // ~48px - section spacing
  xxxl: string;  // ~64px - large gutters

  // Semantic tokens (map to scale for clarity)
  slideGutter: string;     // Padding from slide edges (xl-xxxl)
  sectionGap: string;      // Gap between major sections (xxl)
  blockGap: string;        // Gap between content blocks (lg)
  contentPadding: string;  // Inside cards/callouts (md-lg)
  itemGap: string;         // Between list items, grid items (sm-md)
  inlineGap: string;       // Icon-to-text, inline elements (xs-sm)

  // Legacy tokens
  bulletIndent: string;
  tableGap: string;
}

/**
 * Visual effects tokens
 */
export interface ThemeEffects {
  // Border radius for cards/containers
  borderRadius: string;
  borderRadiusSmall: string;
  borderRadiusLarge: string;

  // Box shadow for elevated elements
  boxShadow: string;
  boxShadowSmall: string;
  boxShadowLarge: string;

  // Callout left border width
  calloutBorderWidth: string;

  // Gradient overlays for visual depth
  gradientPrimary: string;
  gradientAccent: string;
  gradientBackground: string;

  // Glassmorphism effects (Phase 6 - Premium)
  glassBackground: string;
  glassBackdropBlur: string;
  glassBorder: string;

  // Colored shadows for premium cards
  shadowPink: string;
  shadowPurple: string;
  shadowBlue: string;

  // Overlay for images
  overlayDark: string;
  overlayLight: string;

  // Slide background system (Punkt 3)
  // Subtle gradient to add depth to slides
  slideBackgroundGradient: string;
  // Radial gradient for vignette/focus effect
  slideBackgroundRadial: string;
  // Corner accent gradient for modern look
  slideBackgroundCorner: string;
  // Pattern overlay (dots/grid) for texture
  slidePatternColor: string;
  slidePatternOpacity: string;

  // Image styling system (Punkt 5)
  // Border radius for images
  imageBorderRadius: string;
  // Box shadow for image containers
  imageShadow: string;
  // Elevated shadow for floating images
  imageShadowFloating: string;
  // Subtle inner overlay for depth (gradient from edges)
  imageInnerShadow: string;
  // Frame/border for framed variant
  imageFrameColor: string;
  imageFrameWidth: string;
  // Placeholder background
  imagePlaceholderBg: string;
}

/**
 * Complete theme tokens structure
 */
export interface ThemeTokens {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  effects: ThemeEffects;
}

/**
 * Theme definition
 */
export interface Theme {
  id: string;
  name: string;
  description: string;
  tokens: ThemeTokens;
}

/**
 * Brand kit overrides (optional per-deck customization)
 */
export interface BrandKitOverrides {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Theme ID type (matches Zod schema)
 */
export type ThemeId =
  | "nordic_light"
  | "nordic_dark"
  | "nordic_minimalism"
  | "corporate_blue"
  | "minimal_warm"
  | "modern_contrast";

/**
 * All available theme IDs
 */
export const THEME_IDS: ThemeId[] = [
  "nordic_light",
  "nordic_dark",
  "nordic_minimalism",
  "corporate_blue",
  "minimal_warm",
  "modern_contrast",
];
