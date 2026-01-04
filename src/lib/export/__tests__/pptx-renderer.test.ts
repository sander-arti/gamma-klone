/**
 * PPTX Renderer Tests
 *
 * Tests for PPTX export functionality using PptxGenJS.
 */

import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { renderSlidesToPptx, renderDeckToPptx } from "../pptx-renderer";
import {
  themeToPptxStyles,
  PPTX_DIMENSIONS,
  SLIDE_MARGINS,
  CONTENT_AREA,
} from "../pptx-theme-mapper";
import { getTheme } from "@/lib/themes";
import type { Slide } from "@/lib/schemas/slide";
import type { Deck } from "@/lib/schemas/deck";
import type { ThemeId } from "@/lib/themes";

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

const createAgendaSlide = (): Slide => ({
  type: "agenda",
  layoutVariant: "default",
  blocks: [
    { kind: "title", text: "Agenda" },
    {
      kind: "bullets",
      items: ["Introduction", "Main Topic", "Discussion", "Conclusion"],
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

const createQuoteSlide = (): Slide => ({
  type: "quote_callout",
  layoutVariant: "default",
  blocks: [
    { kind: "title", text: "Inspirational Quote" },
    {
      kind: "callout",
      text: "The best way to predict the future is to create it.",
      style: "quote",
    },
  ],
});

const createSectionHeaderSlide = (): Slide => ({
  type: "section_header",
  layoutVariant: "default",
  blocks: [
    { kind: "title", text: "Section Title" },
    { kind: "text", text: "Optional subtitle" },
  ],
});

const createTwoColumnSlide = (): Slide => ({
  type: "two_column_text",
  layoutVariant: "default",
  blocks: [
    { kind: "title", text: "Two Columns" },
    { kind: "text", text: "Left column content goes here with some text." },
    { kind: "text", text: "Right column content goes here with more text." },
  ],
});

const createTestDeck = (): Deck => ({
  deck: {
    title: "Test Deck",
    language: "no",
    themeId: "nordic_light",
  },
  slides: [
    createCoverSlide(),
    createAgendaSlide(),
    createBulletsSlide(),
    createTableSlide(),
    createQuoteSlide(),
  ],
});

const themeId: ThemeId = "nordic_light";

describe("pptx-theme-mapper", () => {
  describe("PPTX_DIMENSIONS", () => {
    it("has correct 16:9 aspect ratio dimensions", () => {
      const ratio = PPTX_DIMENSIONS.width / PPTX_DIMENSIONS.height;
      expect(ratio).toBeCloseTo(16 / 9, 1);
    });

    it("has expected dimensions in inches", () => {
      expect(PPTX_DIMENSIONS.width).toBeCloseTo(13.333, 2);
      expect(PPTX_DIMENSIONS.height).toBe(7.5);
    });
  });

  describe("SLIDE_MARGINS", () => {
    it("has defined margins", () => {
      expect(SLIDE_MARGINS.top).toBeGreaterThan(0);
      expect(SLIDE_MARGINS.left).toBeGreaterThan(0);
      expect(SLIDE_MARGINS.right).toBeGreaterThan(0);
      expect(SLIDE_MARGINS.bottom).toBeGreaterThan(0);
    });
  });

  describe("CONTENT_AREA", () => {
    it("has valid content area dimensions", () => {
      expect(CONTENT_AREA.x).toBeGreaterThanOrEqual(0);
      expect(CONTENT_AREA.y).toBeGreaterThanOrEqual(0);
      expect(CONTENT_AREA.width).toBeGreaterThan(0);
      expect(CONTENT_AREA.height).toBeGreaterThan(0);

      // Content area should fit within slide dimensions
      expect(CONTENT_AREA.x + CONTENT_AREA.width).toBeLessThanOrEqual(PPTX_DIMENSIONS.width);
      expect(CONTENT_AREA.y + CONTENT_AREA.height).toBeLessThanOrEqual(PPTX_DIMENSIONS.height);
    });
  });

  describe("themeToPptxStyles", () => {
    it("converts theme tokens to PPTX styles", () => {
      const theme = getTheme("nordic_light");
      const styles = themeToPptxStyles(theme.tokens);

      expect(styles).toHaveProperty("colors");
      expect(styles).toHaveProperty("title");
      expect(styles).toHaveProperty("heading");
      expect(styles).toHaveProperty("body");
      expect(styles).toHaveProperty("quote");
    });

    it("produces colors without hash prefix", () => {
      const theme = getTheme("nordic_light");
      const styles = themeToPptxStyles(theme.tokens);

      // PPTX colors should not have # prefix
      expect(styles.colors.primary).not.toContain("#");
      expect(styles.colors.background).not.toContain("#");
      expect(styles.colors.foreground).not.toContain("#");
    });

    it("produces font sizes in points", () => {
      const theme = getTheme("nordic_light");
      const styles = themeToPptxStyles(theme.tokens);

      // Font sizes should be positive numbers (points)
      expect(styles.title.fontSize).toBeGreaterThan(0);
      expect(styles.body.fontSize).toBeGreaterThan(0);
    });

    it("works for all themes", () => {
      const themes: ThemeId[] = [
        "nordic_light",
        "nordic_dark",
        "corporate_blue",
        "minimal_warm",
        "modern_contrast",
      ];

      for (const themeId of themes) {
        const theme = getTheme(themeId);
        const styles = themeToPptxStyles(theme.tokens);
        expect(styles.colors.primary).toBeDefined();
        expect(styles.title.fontFace).toBeDefined();
      }
    });
  });
});

describe("pptx-renderer", () => {
  describe("renderSlidesToPptx", () => {
    it("renders cover slide to valid PPTX", async () => {
      const slides = [createCoverSlide()];
      const buffer = await renderSlidesToPptx(slides, themeId);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // Verify it's a valid PPTX (ZIP archive)
      const zip = await JSZip.loadAsync(buffer);
      expect(zip.files["[Content_Types].xml"]).toBeDefined();
      expect(zip.files["ppt/presentation.xml"]).toBeDefined();
    });

    it("renders bullets slide to valid PPTX", async () => {
      const slides = [createBulletsSlide()];
      const buffer = await renderSlidesToPptx(slides, themeId);

      expect(buffer).toBeInstanceOf(Buffer);

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.files["ppt/slides/slide1.xml"]).toBeDefined();
    });

    it("renders agenda slide with numbered bullets", async () => {
      const slides = [createAgendaSlide()];
      const buffer = await renderSlidesToPptx(slides, themeId);

      expect(buffer).toBeInstanceOf(Buffer);
    });

    it("renders table slide to valid PPTX", async () => {
      const slides = [createTableSlide()];
      const buffer = await renderSlidesToPptx(slides, themeId);

      expect(buffer).toBeInstanceOf(Buffer);
    });

    it("renders quote/callout slide to valid PPTX", async () => {
      const slides = [createQuoteSlide()];
      const buffer = await renderSlidesToPptx(slides, themeId);

      expect(buffer).toBeInstanceOf(Buffer);
    });

    it("renders section header slide to valid PPTX", async () => {
      const slides = [createSectionHeaderSlide()];
      const buffer = await renderSlidesToPptx(slides, themeId);

      expect(buffer).toBeInstanceOf(Buffer);
    });

    it("renders two-column slide to valid PPTX", async () => {
      const slides = [createTwoColumnSlide()];
      const buffer = await renderSlidesToPptx(slides, themeId);

      expect(buffer).toBeInstanceOf(Buffer);
    });

    it("renders multiple slides to PPTX", async () => {
      const slides = [createCoverSlide(), createBulletsSlide(), createTableSlide()];

      const buffer = await renderSlidesToPptx(slides, themeId);

      expect(buffer).toBeInstanceOf(Buffer);

      // Verify slide count
      const zip = await JSZip.loadAsync(buffer);
      expect(zip.files["ppt/slides/slide1.xml"]).toBeDefined();
      expect(zip.files["ppt/slides/slide2.xml"]).toBeDefined();
      expect(zip.files["ppt/slides/slide3.xml"]).toBeDefined();
    });

    it("renders with brand kit overrides", async () => {
      const slides = [createCoverSlide()];
      const brandKit = {
        primaryColor: "#ff0000",
        secondaryColor: "#00ff00",
      };

      const buffer = await renderSlidesToPptx(slides, themeId, brandKit);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("sets presentation title", async () => {
      const slides = [createCoverSlide()];
      const title = "My Custom Title";

      const buffer = await renderSlidesToPptx(slides, themeId, undefined, title);

      expect(buffer).toBeInstanceOf(Buffer);

      // Check core.xml for title
      const zip = await JSZip.loadAsync(buffer);
      const coreXml = await zip.files["docProps/core.xml"]?.async("string");
      expect(coreXml).toContain(title);
    });

    it("works with all themes", async () => {
      const slides = [createCoverSlide()];
      const themes: ThemeId[] = [
        "nordic_light",
        "nordic_dark",
        "corporate_blue",
        "minimal_warm",
        "modern_contrast",
      ];

      for (const theme of themes) {
        const buffer = await renderSlidesToPptx(slides, theme);
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
      }
    });
  });

  describe("renderDeckToPptx", () => {
    it("renders full deck to PPTX", async () => {
      const deck = createTestDeck();
      const buffer = await renderDeckToPptx(deck, themeId);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // Verify all slides are present
      const zip = await JSZip.loadAsync(buffer);
      for (let i = 1; i <= deck.slides.length; i++) {
        expect(zip.files[`ppt/slides/slide${i}.xml`]).toBeDefined();
      }
    });

    it("uses deck title in presentation metadata", async () => {
      const deck = createTestDeck();
      const buffer = await renderDeckToPptx(deck, themeId);

      const zip = await JSZip.loadAsync(buffer);
      const coreXml = await zip.files["docProps/core.xml"]?.async("string");
      expect(coreXml).toContain(deck.deck.title);
    });

    it("renders with brand kit from deck", async () => {
      const deck: Deck = {
        deck: {
          title: "Branded Deck",
          language: "no",
          themeId: "nordic_light",
          brandKit: {
            primaryColor: "#123456",
            secondaryColor: "#654321",
          },
        },
        slides: [createCoverSlide()],
      };

      const buffer = await renderDeckToPptx(deck, themeId, deck.deck.brandKit);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});
