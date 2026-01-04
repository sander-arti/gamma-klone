/**
 * PDF Renderer
 *
 * Uses Playwright to render slides as PDF pages.
 * Each slide becomes one page in the final PDF.
 */

import { chromium, type Browser, type BrowserContext } from "playwright";
import { PDFDocument } from "pdf-lib";
import type { Slide } from "@/lib/schemas/slide";
import type { Deck } from "@/lib/schemas/deck";
import type { ThemeId, BrandKitOverrides } from "@/lib/themes";
import { renderSlideToHtml, PDF_DIMENSIONS } from "./slide-html";

/**
 * Browser instance singleton for reuse
 */
let browserInstance: Browser | null = null;

/**
 * Get or create browser instance
 */
async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  browserInstance = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  return browserInstance;
}

/**
 * Close browser instance (for cleanup)
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Render a single slide HTML to PDF buffer
 */
async function renderSlideToPdf(
  context: BrowserContext,
  html: string
): Promise<Buffer> {
  const page = await context.newPage();

  try {
    // Set viewport to exact slide dimensions
    await page.setViewportSize({
      width: PDF_DIMENSIONS.width,
      height: PDF_DIMENSIONS.height,
    });

    // Load HTML content
    await page.setContent(html, {
      waitUntil: "networkidle",
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Generate PDF with exact dimensions
    const pdfBuffer = await page.pdf({
      width: `${PDF_DIMENSIONS.width}px`,
      height: `${PDF_DIMENSIONS.height}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

/**
 * Merge multiple single-page PDFs into one document
 */
async function mergePdfs(pdfBuffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBuffer = await mergedPdf.save();
  return Buffer.from(mergedBuffer);
}

/**
 * Render a deck to PDF
 *
 * @param deck - The deck data to render
 * @param themeId - The theme to apply
 * @param brandKit - Optional brand kit color overrides
 * @returns PDF as a Buffer
 */
export async function renderDeckToPdf(
  deck: Deck,
  themeId: ThemeId,
  brandKit?: BrandKitOverrides
): Promise<Buffer> {
  const browser = await getBrowser();
  const context = await browser.newContext();

  try {
    const pdfBuffers: Buffer[] = [];

    // Render each slide to PDF
    for (let i = 0; i < deck.slides.length; i++) {
      const slide = deck.slides[i];
      console.log(`Rendering slide ${i + 1}/${deck.slides.length}...`);

      // Generate HTML for this slide
      const html = renderSlideToHtml(slide, themeId, brandKit);

      // Render to PDF
      const pdfBuffer = await renderSlideToPdf(context, html);
      pdfBuffers.push(pdfBuffer);
    }

    // Merge all PDFs into one
    if (pdfBuffers.length === 1) {
      return pdfBuffers[0];
    }

    console.log("Merging PDF pages...");
    return await mergePdfs(pdfBuffers);
  } finally {
    await context.close();
  }
}

/**
 * Render slides array to PDF (when you already have parsed slides)
 *
 * @param slides - Array of slides to render
 * @param themeId - The theme to apply
 * @param brandKit - Optional brand kit color overrides
 * @returns PDF as a Buffer
 */
export async function renderSlidesToPdf(
  slides: Slide[],
  themeId: ThemeId,
  brandKit?: BrandKitOverrides
): Promise<Buffer> {
  const browser = await getBrowser();
  const context = await browser.newContext();

  try {
    const pdfBuffers: Buffer[] = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      console.log(`Rendering slide ${i + 1}/${slides.length}...`);

      const html = renderSlideToHtml(slide, themeId, brandKit);
      const pdfBuffer = await renderSlideToPdf(context, html);
      pdfBuffers.push(pdfBuffer);
    }

    if (pdfBuffers.length === 1) {
      return pdfBuffers[0];
    }

    return await mergePdfs(pdfBuffers);
  } finally {
    await context.close();
  }
}

/**
 * Render a single slide to PDF (for preview/testing)
 *
 * @param slide - The slide to render
 * @param themeId - The theme to apply
 * @param brandKit - Optional brand kit color overrides
 * @returns PDF as a Buffer
 */
export async function renderSingleSlideToPdf(
  slide: Slide,
  themeId: ThemeId,
  brandKit?: BrandKitOverrides
): Promise<Buffer> {
  const browser = await getBrowser();
  const context = await browser.newContext();

  try {
    const html = renderSlideToHtml(slide, themeId, brandKit);
    return await renderSlideToPdf(context, html);
  } finally {
    await context.close();
  }
}
