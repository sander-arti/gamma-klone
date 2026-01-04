/**
 * Export Module
 *
 * PDF and PPTX export functionality for presentations.
 */

// PDF exports
export {
  renderDeckToPdf,
  renderSlidesToPdf,
  renderSingleSlideToPdf,
  closeBrowser,
} from "./pdf-renderer";

export { renderSlideToHtml, renderSlidesToHtml, PDF_DIMENSIONS } from "./slide-html";

// PPTX exports
export { renderDeckToPptx, renderSlidesToPptx } from "./pptx-renderer";

export {
  themeToPptxStyles,
  PPTX_DIMENSIONS,
  SLIDE_MARGINS,
  CONTENT_AREA,
  type PptxThemeStyles,
} from "./pptx-theme-mapper";
