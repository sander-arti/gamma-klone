/**
 * Slide HTML Generator
 *
 * Converts React slide components to static HTML for PDF export.
 * Uses renderToStaticMarkup to generate server-side HTML.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import type { Slide } from "@/lib/schemas/slide";
import type { ThemeId, BrandKitOverrides } from "@/lib/themes";
import { getTheme, applyBrandKit, themeToCssVars } from "@/lib/themes";
import { SlideRenderer } from "@/components/slides";

/**
 * Base dimensions for PDF rendering (matches SlideCanvas)
 */
export const PDF_DIMENSIONS = {
  width: 1280,
  height: 720,
} as const;

/**
 * Generate CSS variables string from theme
 */
function generateCssVarsStyle(cssVars: Record<string, string>): string {
  return Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n    ");
}

/**
 * Generate inline CSS for PDF rendering
 *
 * This includes base styles that would normally come from Tailwind,
 * but we inline them here for standalone HTML rendering.
 */
function generateBaseStyles(cssVars: Record<string, string>): string {
  return `
    :root {
      ${generateCssVarsStyle(cssVars)}
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--theme-font-family);
      font-size: var(--theme-typography-body-size);
      font-weight: var(--theme-typography-body-weight);
      line-height: var(--theme-typography-body-line-height);
      color: var(--theme-color-foreground);
      background-color: var(--theme-color-background);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .slide-container {
      width: ${PDF_DIMENSIONS.width}px;
      height: ${PDF_DIMENSIONS.height}px;
      padding: var(--theme-spacing-slide-gutter);
      background-color: var(--theme-color-background);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Typography utilities */
    .font-heading {
      font-family: var(--theme-font-family-heading);
    }

    .text-title {
      font-size: var(--theme-typography-title-size);
      font-weight: var(--theme-typography-title-weight);
      line-height: var(--theme-typography-title-line-height);
    }

    .text-heading {
      font-size: var(--theme-typography-heading-size);
      font-weight: var(--theme-typography-heading-weight);
      line-height: var(--theme-typography-heading-line-height);
    }

    .text-body {
      font-size: var(--theme-typography-body-size);
      font-weight: var(--theme-typography-body-weight);
      line-height: var(--theme-typography-body-line-height);
    }

    .text-small {
      font-size: var(--theme-typography-small-size);
    }

    /* Color utilities */
    .text-foreground { color: var(--theme-color-foreground); }
    .text-muted { color: var(--theme-color-foreground-muted); }
    .text-primary { color: var(--theme-color-primary); }
    .text-secondary { color: var(--theme-color-secondary); }

    .bg-background { background-color: var(--theme-color-background); }
    .bg-subtle { background-color: var(--theme-color-background-subtle); }
    .bg-primary { background-color: var(--theme-color-primary); }
    .bg-secondary { background-color: var(--theme-color-secondary); }

    /* Layout utilities */
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-row { flex-direction: row; }
    .flex-1 { flex: 1 1 0%; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .items-end { align-items: flex-end; }
    .justify-center { justify-content: center; }
    .justify-start { justify-content: flex-start; }
    .justify-end { justify-content: flex-end; }
    .justify-between { justify-content: space-between; }
    .gap-2 { gap: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }

    /* Spacing utilities */
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mt-auto { margin-top: auto; }

    /* Width/Height utilities */
    .w-full { width: 100%; }
    .w-1\\/2 { width: 50%; }
    .h-full { height: 100%; }
    .min-h-0 { min-height: 0; }

    /* Border utilities */
    .border { border-width: 1px; border-style: solid; }
    .border-l-4 { border-left-width: 4px; border-left-style: solid; }
    .border-border { border-color: var(--theme-color-border); }
    .border-subtle { border-color: var(--theme-color-border-subtle); }
    .border-primary { border-color: var(--theme-color-primary); }
    .rounded { border-radius: var(--theme-effects-border-radius); }
    .rounded-lg { border-radius: calc(var(--theme-effects-border-radius) * 1.5); }

    /* List styles */
    ul { list-style-type: disc; padding-left: 1.5rem; }
    ol { list-style-type: decimal; padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
    li:last-child { margin-bottom: 0; }

    /* Table styles */
    table { width: 100%; border-collapse: collapse; }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--theme-color-border);
    }
    th {
      font-weight: 600;
      background-color: var(--theme-color-background-subtle);
    }
    tr:last-child td { border-bottom: none; }

    /* Callout styles */
    .callout {
      padding: 1rem 1.5rem;
      border-left-width: var(--theme-effects-callout-border-width);
      border-left-style: solid;
      border-radius: var(--theme-effects-border-radius);
      background-color: var(--theme-color-background-subtle);
    }
    .callout-info { border-left-color: var(--theme-color-info); }
    .callout-warning { border-left-color: var(--theme-color-warning); }
    .callout-success { border-left-color: var(--theme-color-success); }
    .callout-error { border-left-color: var(--theme-color-error); }

    /* Quote styles */
    .quote {
      font-size: var(--theme-typography-quote-size);
      font-style: var(--theme-typography-quote-style);
      padding-left: 1.5rem;
      border-left: 4px solid var(--theme-color-primary);
    }

    /* Image styles */
    img {
      max-width: 100%;
      height: auto;
      object-fit: cover;
    }
    .img-cover { object-fit: cover; }
    .img-contain { object-fit: contain; }
    .img-fill { object-fit: fill; }

    /* Text utilities */
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .italic { font-style: italic; }
    .uppercase { text-transform: uppercase; }
    .tracking-wide { letter-spacing: 0.025em; }

    /* Overflow */
    .overflow-hidden { overflow: hidden; }
    .text-ellipsis { text-overflow: ellipsis; }
    .whitespace-nowrap { white-space: nowrap; }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Shadow */
    .shadow { box-shadow: var(--theme-effects-box-shadow); }
  `;
}

/**
 * Render a single slide to static HTML
 *
 * @param slide - The slide data to render
 * @param themeId - The theme to apply
 * @param brandKit - Optional brand kit color overrides
 * @returns Complete HTML document string
 */
export function renderSlideToHtml(
  slide: Slide,
  themeId: ThemeId,
  brandKit?: BrandKitOverrides
): string {
  // Get and apply theme
  const baseTheme = getTheme(themeId);
  const theme = applyBrandKit(baseTheme, brandKit);
  const cssVars = themeToCssVars(theme.tokens);

  // Render slide component to static markup
  const slideElement = createElement(SlideRenderer, { slide });
  const slideHtml = renderToStaticMarkup(slideElement);

  // Wrap in full HTML document
  const html = `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${PDF_DIMENSIONS.width}, height=${PDF_DIMENSIONS.height}">
  <title>Slide</title>
  <style>
    ${generateBaseStyles(cssVars)}
  </style>
</head>
<body>
  <div class="slide-container">
    ${slideHtml}
  </div>
</body>
</html>`;

  return html;
}

/**
 * Render multiple slides to an array of HTML strings
 *
 * @param slides - Array of slides to render
 * @param themeId - The theme to apply
 * @param brandKit - Optional brand kit color overrides
 * @returns Array of HTML document strings
 */
export function renderSlidesToHtml(
  slides: Slide[],
  themeId: ThemeId,
  brandKit?: BrandKitOverrides
): string[] {
  return slides.map((slide) => renderSlideToHtml(slide, themeId, brandKit));
}
