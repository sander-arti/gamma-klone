/**
 * Export Integration Tests
 *
 * End-to-end tests for the export pipeline.
 * These tests verify the full flow from deck data to exported files.
 * PDF tests require Playwright Chromium to be installed.
 */

import { describe, it, expect, afterAll } from "vitest";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import {
  renderSlidesToPdf,
  renderDeckToPdf,
  closeBrowser,
} from "../pdf-renderer";
import { renderSlidesToPptx, renderDeckToPptx } from "../pptx-renderer";
import type { Deck } from "@/lib/schemas/deck";
import type { ThemeId } from "@/lib/themes";

// Check if Playwright Chromium is installed
function isPlaywrightInstalled(): boolean {
  const playwrightCache = join(homedir(), "Library/Caches/ms-playwright");
  try {
    return existsSync(playwrightCache);
  } catch {
    return false;
  }
}

const PLAYWRIGHT_AVAILABLE = isPlaywrightInstalled();

// Load golden test fixture
const fixturesPath = join(process.cwd(), "testdata/fixtures");
const deckFixturePath = join(fixturesPath, "deck-example.json");

function loadDeckFixture(): Deck {
  if (!existsSync(deckFixturePath)) {
    // Create a minimal fixture if it doesn't exist
    return {
      deck: {
        title: "Test Presentation",
        language: "no",
        themeId: "nordic_light",
      },
      slides: [
        {
          type: "cover",
          layoutVariant: "default",
          blocks: [
            { kind: "title", text: "Test Presentation" },
            { kind: "text", text: "Subtitle" },
          ],
        },
        {
          type: "bullets",
          layoutVariant: "default",
          blocks: [
            { kind: "title", text: "Points" },
            { kind: "bullets", items: ["Point 1", "Point 2", "Point 3"] },
          ],
        },
      ],
    };
  }

  const content = readFileSync(deckFixturePath, "utf-8");
  return JSON.parse(content) as Deck;
}

const testDeck = loadDeckFixture();
const themeId: ThemeId = "nordic_light";

describe("Export Integration Tests", () => {
  afterAll(async () => {
    if (PLAYWRIGHT_AVAILABLE) {
      await closeBrowser();
    }
  });

  describe.skipIf(!PLAYWRIGHT_AVAILABLE)("PDF Export (requires Playwright)", () => {
    it("exports deck fixture to PDF with correct page count", async () => {
      const buffer = await renderDeckToPdf(testDeck, themeId);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // Verify page count matches slide count
      const pdf = await PDFDocument.load(buffer);
      expect(pdf.getPageCount()).toBe(testDeck.slides.length);
    }, 120000);

    it("PDF has consistent dimensions across all pages", async () => {
      const buffer = await renderDeckToPdf(testDeck, themeId);
      const pdf = await PDFDocument.load(buffer);
      const pages = pdf.getPages();

      // All pages should have same dimensions
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      for (const page of pages) {
        const { width: pageWidth, height: pageHeight } = page.getSize();
        expect(pageWidth).toBeCloseTo(width, 0);
        expect(pageHeight).toBeCloseTo(height, 0);
      }
    }, 120000);

    it("exports with different themes maintaining page count", async () => {
      const themes: ThemeId[] = ["nordic_light", "nordic_dark", "corporate_blue"];

      for (const theme of themes) {
        const buffer = await renderDeckToPdf(testDeck, theme);
        const pdf = await PDFDocument.load(buffer);
        expect(pdf.getPageCount()).toBe(testDeck.slides.length);
      }
    }, 180000);
  });

  describe("PPTX Export", () => {
    it("exports deck fixture to PPTX with all slides", async () => {
      const buffer = await renderDeckToPptx(testDeck, themeId);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // Verify it's a valid PPTX
      const zip = await JSZip.loadAsync(buffer);
      expect(zip.files["[Content_Types].xml"]).toBeDefined();

      // Verify slide count
      for (let i = 1; i <= testDeck.slides.length; i++) {
        expect(zip.files[`ppt/slides/slide${i}.xml`]).toBeDefined();
      }
    });

    it("PPTX contains presentation metadata", async () => {
      const buffer = await renderDeckToPptx(testDeck, themeId);
      const zip = await JSZip.loadAsync(buffer);

      // Check core properties
      const coreXml = await zip.files["docProps/core.xml"]?.async("string");
      expect(coreXml).toBeDefined();
      expect(coreXml).toContain(testDeck.deck.title);
    });

    it("PPTX slides contain text content", async () => {
      const buffer = await renderDeckToPptx(testDeck, themeId);
      const zip = await JSZip.loadAsync(buffer);

      // Check first slide for title text
      const slide1Xml = await zip.files["ppt/slides/slide1.xml"]?.async("string");
      expect(slide1Xml).toBeDefined();

      // The cover slide should contain the title block text
      const coverSlide = testDeck.slides.find((s) => s.type === "cover");
      if (coverSlide) {
        const titleBlock = coverSlide.blocks.find((b) => b.kind === "title");
        if (titleBlock && "text" in titleBlock) {
          expect(slide1Xml).toContain(titleBlock.text);
        }
      }
    });

    it("exports with different themes", async () => {
      const themes: ThemeId[] = ["nordic_light", "nordic_dark", "corporate_blue"];

      for (const theme of themes) {
        const buffer = await renderDeckToPptx(testDeck, theme);
        expect(buffer).toBeInstanceOf(Buffer);

        const zip = await JSZip.loadAsync(buffer);
        for (let i = 1; i <= testDeck.slides.length; i++) {
          expect(zip.files[`ppt/slides/slide${i}.xml`]).toBeDefined();
        }
      }
    });
  });

  describe("Brand Kit Integration", () => {
    const brandKit = {
      primaryColor: "#ff5733",
      secondaryColor: "#33ff57",
    };

    it.skipIf(!PLAYWRIGHT_AVAILABLE)(
      "PDF renders with brand kit colors applied",
      async () => {
        const buffer = await renderDeckToPdf(testDeck, themeId, brandKit);

        expect(buffer).toBeInstanceOf(Buffer);

        const pdf = await PDFDocument.load(buffer);
        expect(pdf.getPageCount()).toBe(testDeck.slides.length);
      },
      120000
    );

    it("PPTX renders with brand kit colors applied", async () => {
      const buffer = await renderDeckToPptx(testDeck, themeId, brandKit);

      expect(buffer).toBeInstanceOf(Buffer);

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.files["ppt/slides/slide1.xml"]).toBeDefined();
    });
  });

  describe("All Slide Types", () => {
    // Create slides for each type
    const allSlideTypes: Deck = {
      deck: {
        title: "All Slide Types Test",
        language: "no",
        themeId: "nordic_light",
      },
      slides: [
        {
          type: "cover",
          layoutVariant: "default",
          blocks: [
            { kind: "title", text: "Cover Slide" },
            { kind: "text", text: "Subtitle" },
          ],
        },
        {
          type: "agenda",
          layoutVariant: "default",
          blocks: [
            { kind: "title", text: "Agenda" },
            { kind: "bullets", items: ["Item 1", "Item 2", "Item 3"] },
          ],
        },
        {
          type: "section_header",
          layoutVariant: "default",
          blocks: [
            { kind: "title", text: "Section Header" },
            { kind: "text", text: "Section subtitle" },
          ],
        },
        {
          type: "bullets",
          layoutVariant: "default",
          blocks: [
            { kind: "title", text: "Bullets" },
            { kind: "bullets", items: ["Point A", "Point B", "Point C"] },
          ],
        },
        {
          type: "two_column_text",
          layoutVariant: "default",
          blocks: [
            { kind: "title", text: "Two Columns" },
            { kind: "text", text: "Left column text content." },
            { kind: "text", text: "Right column text content." },
          ],
        },
        {
          type: "decisions_list",
          layoutVariant: "default",
          blocks: [
            { kind: "title", text: "Decisions" },
            { kind: "bullets", items: ["Decision 1", "Decision 2", "Decision 3"] },
          ],
        },
        {
          type: "action_items_table",
          layoutVariant: "default",
          blocks: [
            { kind: "title", text: "Action Items" },
            {
              kind: "table",
              columns: ["Task", "Owner", "Due"],
              rows: [
                ["Task 1", "Person A", "Jan 1"],
                ["Task 2", "Person B", "Jan 15"],
              ],
            },
          ],
        },
        {
          type: "summary_next_steps",
          layoutVariant: "default",
          blocks: [
            { kind: "title", text: "Summary & Next Steps" },
            { kind: "bullets", items: ["Next step 1", "Next step 2"] },
          ],
        },
        {
          type: "quote_callout",
          layoutVariant: "default",
          blocks: [
            { kind: "title", text: "Quote" },
            { kind: "callout", text: "This is a quote.", style: "quote" },
          ],
        },
      ],
    };

    it.skipIf(!PLAYWRIGHT_AVAILABLE)(
      "PDF exports all 9 slide types without error",
      async () => {
        const buffer = await renderDeckToPdf(allSlideTypes, themeId);

        const pdf = await PDFDocument.load(buffer);
        expect(pdf.getPageCount()).toBe(allSlideTypes.slides.length);
      },
      180000
    );

    it("PPTX exports all 9 slide types without error", async () => {
      const buffer = await renderDeckToPptx(allSlideTypes, themeId);

      const zip = await JSZip.loadAsync(buffer);
      for (let i = 1; i <= allSlideTypes.slides.length; i++) {
        expect(
          zip.files[`ppt/slides/slide${i}.xml`],
          `Slide ${i} should exist`
        ).toBeDefined();
      }
    });
  });
});

describe("Export Format Smoketests", () => {
  afterAll(async () => {
    if (PLAYWRIGHT_AVAILABLE) {
      await closeBrowser();
    }
  });

  it.skipIf(!PLAYWRIGHT_AVAILABLE)(
    "PDF is a valid PDF format",
    async () => {
      const buffer = await renderSlidesToPdf(testDeck.slides, themeId);

      // Check PDF magic bytes
      const header = buffer.slice(0, 5).toString("ascii");
      expect(header).toBe("%PDF-");
    },
    60000
  );

  it("PPTX is a valid ZIP archive", async () => {
    const buffer = await renderSlidesToPptx(testDeck.slides, themeId);

    // Check ZIP magic bytes (PK)
    expect(buffer[0]).toBe(0x50); // P
    expect(buffer[1]).toBe(0x4b); // K
  });

  it("PPTX contains required OOXML structure", async () => {
    const buffer = await renderSlidesToPptx(testDeck.slides, themeId);
    const zip = await JSZip.loadAsync(buffer);

    // Required PPTX files
    const requiredFiles = [
      "[Content_Types].xml",
      "_rels/.rels",
      "docProps/app.xml",
      "docProps/core.xml",
      "ppt/presentation.xml",
      "ppt/_rels/presentation.xml.rels",
    ];

    for (const file of requiredFiles) {
      expect(zip.files[file], `${file} should exist`).toBeDefined();
    }
  });
});
