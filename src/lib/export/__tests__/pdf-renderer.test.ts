/**
 * PDF Renderer Tests
 *
 * Tests for PDF export functionality using Playwright.
 * Note: Requires Playwright Chromium to be installed.
 * Run `pnpm exec playwright install chromium` to install.
 */

import { describe, it, expect, afterAll } from "vitest";
import { PDFDocument } from "pdf-lib";
import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import {
  renderSlidesToPdf,
  renderSingleSlideToPdf,
  closeBrowser,
} from "../pdf-renderer";
import { renderSlideToHtml, PDF_DIMENSIONS } from "../slide-html";
import type { Slide } from "@/lib/schemas/slide";
import type { ThemeId } from "@/lib/themes";

// Check if Playwright Chromium is installed
function isPlaywrightInstalled(): boolean {
  const playwrightCache = join(homedir(), "Library/Caches/ms-playwright");
  // Check for any chromium directory
  try {
    return existsSync(playwrightCache);
  } catch {
    return false;
  }
}

const PLAYWRIGHT_AVAILABLE = isPlaywrightInstalled();

// Test fixtures
const createCoverSlide = (): Slide => ({
  type: "cover",
  layoutVariant: "default",
  blocks: [
    { kind: "title", text: "Test Presentation" },
    { kind: "text", text: "Subtitle text here" },
  ],
});

const createBulletsSlide = (): Slide => ({
  type: "bullets",
  layoutVariant: "default",
  blocks: [
    { kind: "title", text: "Key Points" },
    {
      kind: "bullets",
      items: ["First point", "Second point", "Third point"],
    },
  ],
});

const createTableSlide = (): Slide => ({
  type: "action_items_table",
  layoutVariant: "default",
  blocks: [
    { kind: "title", text: "Action Items" },
    {
      kind: "table",
      columns: ["Task", "Owner", "Due"],
      rows: [
        ["Complete report", "John", "Dec 20"],
        ["Review code", "Jane", "Dec 22"],
      ],
    },
  ],
});

const themeId: ThemeId = "nordic_light";

describe("slide-html", () => {
  describe("renderSlideToHtml", () => {
    it("generates valid HTML for cover slide", () => {
      const slide = createCoverSlide();
      const html = renderSlideToHtml(slide, themeId);

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<html");
      expect(html).toContain("Test Presentation");
      expect(html).toContain("Subtitle text here");
    });

    it("generates valid HTML for bullets slide", () => {
      const slide = createBulletsSlide();
      const html = renderSlideToHtml(slide, themeId);

      expect(html).toContain("Key Points");
      expect(html).toContain("First point");
      expect(html).toContain("Second point");
      expect(html).toContain("Third point");
    });

    it("generates valid HTML for table slide", () => {
      const slide = createTableSlide();
      const html = renderSlideToHtml(slide, themeId);

      expect(html).toContain("Action Items");
      expect(html).toContain("Task");
      expect(html).toContain("Owner");
      expect(html).toContain("Complete report");
    });

    it("includes theme CSS variables", () => {
      const slide = createCoverSlide();
      const html = renderSlideToHtml(slide, themeId);

      expect(html).toContain("--theme-");
      expect(html).toContain("background");
    });

    it("applies brand kit overrides", () => {
      const slide = createCoverSlide();
      const brandKit = {
        primaryColor: "#ff0000",
        secondaryColor: "#00ff00",
      };
      const html = renderSlideToHtml(slide, themeId, brandKit);

      expect(html).toContain("#ff0000");
    });
  });

  describe("PDF_DIMENSIONS", () => {
    it("has correct aspect ratio (16:9)", () => {
      const ratio = PDF_DIMENSIONS.width / PDF_DIMENSIONS.height;
      expect(ratio).toBeCloseTo(16 / 9, 1);
    });

    it("has expected dimensions", () => {
      expect(PDF_DIMENSIONS.width).toBe(1280);
      expect(PDF_DIMENSIONS.height).toBe(720);
    });
  });
});

describe.skipIf(!PLAYWRIGHT_AVAILABLE)(
  "pdf-renderer (requires Playwright)",
  () => {
    afterAll(async () => {
      await closeBrowser();
    });

  describe("renderSingleSlideToPdf", () => {
    it("renders a cover slide to PDF buffer", async () => {
      const slide = createCoverSlide();
      const buffer = await renderSingleSlideToPdf(slide, themeId);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // Verify it's a valid PDF
      const pdf = await PDFDocument.load(buffer);
      expect(pdf.getPageCount()).toBe(1);
    }, 30000);

    it("renders a bullets slide to PDF buffer", async () => {
      const slide = createBulletsSlide();
      const buffer = await renderSingleSlideToPdf(slide, themeId);

      expect(buffer).toBeInstanceOf(Buffer);

      const pdf = await PDFDocument.load(buffer);
      expect(pdf.getPageCount()).toBe(1);
    }, 30000);

    it("renders a table slide to PDF buffer", async () => {
      const slide = createTableSlide();
      const buffer = await renderSingleSlideToPdf(slide, themeId);

      expect(buffer).toBeInstanceOf(Buffer);

      const pdf = await PDFDocument.load(buffer);
      expect(pdf.getPageCount()).toBe(1);
    }, 30000);
  });

  describe("renderSlidesToPdf", () => {
    it("renders multiple slides to a single PDF", async () => {
      const slides = [createCoverSlide(), createBulletsSlide(), createTableSlide()];

      const buffer = await renderSlidesToPdf(slides, themeId);

      expect(buffer).toBeInstanceOf(Buffer);

      // Verify page count matches slide count
      const pdf = await PDFDocument.load(buffer);
      expect(pdf.getPageCount()).toBe(slides.length);
    }, 60000);

    it("renders slides with brand kit overrides", async () => {
      const slides = [createCoverSlide()];
      const brandKit = {
        primaryColor: "#123456",
        secondaryColor: "#654321",
      };

      const buffer = await renderSlidesToPdf(slides, themeId, brandKit);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    }, 30000);

    it("renders slides with different themes", async () => {
      const slides = [createCoverSlide()];
      const themes: ThemeId[] = [
        "nordic_light",
        "nordic_dark",
        "corporate_blue",
        "minimal_warm",
        "modern_contrast",
      ];

      for (const theme of themes) {
        const buffer = await renderSlidesToPdf(slides, theme);
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
      }
    }, 120000);
  });
});
