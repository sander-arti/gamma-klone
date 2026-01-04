import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  GenerationPipeline,
  createPipeline,
  generatePresentation,
  PipelineError,
} from "../pipeline";
import { MockLLMClient } from "../mock-llm";
import type { GenerationRequest } from "@/lib/schemas/deck";

describe("Generation Pipeline", () => {
  const baseRequest: GenerationRequest = {
    inputText: "Møtenotater fra prosjektmøte uke 50",
    textMode: "condense",
    language: "no",
    amount: "medium",
    imageMode: "none",
  };

  let pipeline: GenerationPipeline;

  beforeEach(() => {
    pipeline = new GenerationPipeline({
      llmClient: new MockLLMClient(),
      maxRepairAttempts: 3,
    });
  });

  describe("generateOutline", () => {
    it("generates valid outline from meeting notes", async () => {
      const outline = await pipeline.generateOutline(baseRequest);

      expect(outline).toBeDefined();
      expect(outline.title).toBeDefined();
      expect(outline.slides).toBeInstanceOf(Array);
      expect(outline.slides.length).toBeGreaterThan(0);
    });

    it("generates outline with cover slide first", async () => {
      const outline = await pipeline.generateOutline(baseRequest);

      expect(outline.slides[0].suggestedType).toBe("cover");
    });

    it("generates outline for product input", async () => {
      const productRequest: GenerationRequest = {
        ...baseRequest,
        inputText: "Produktlansering for ny mobilapp",
      };

      const outline = await pipeline.generateOutline(productRequest);

      expect(outline.title).toBe("Produktpresentasjon");
    });
  });

  describe("generateDeck", () => {
    it("generates complete deck from outline", async () => {
      const outline = await pipeline.generateOutline(baseRequest);
      const deck = await pipeline.generateDeck(outline, baseRequest);

      expect(deck).toBeDefined();
      expect(deck.deck.title).toBe(outline.title);
      expect(deck.slides.length).toBeGreaterThan(0);
    });

    it("generates slides with correct types", async () => {
      const outline = await pipeline.generateOutline(baseRequest);
      const deck = await pipeline.generateDeck(outline, baseRequest);

      // First slide should be cover
      expect(deck.slides[0].type).toBe("cover");

      // All slides should have blocks
      deck.slides.forEach((slide) => {
        expect(slide.blocks).toBeInstanceOf(Array);
        expect(slide.blocks.length).toBeGreaterThan(0);
      });
    });

    it("assigns layout variants to slides", async () => {
      const outline = await pipeline.generateOutline(baseRequest);
      const deck = await pipeline.generateDeck(outline, baseRequest);

      deck.slides.forEach((slide) => {
        expect(slide.layoutVariant).toBeDefined();
      });
    });

    it("includes deck metadata", async () => {
      const outline = await pipeline.generateOutline(baseRequest);
      const deck = await pipeline.generateDeck(outline, baseRequest);

      expect(deck.deck.language).toBe("no");
      expect(deck.deck.themeId).toBe("nordic_light");
    });
  });

  describe("generate (full pipeline)", () => {
    it("generates both outline and deck", async () => {
      const result = await pipeline.generate(baseRequest);

      expect(result.outline).toBeDefined();
      expect(result.deck).toBeDefined();
      expect(result.deck.deck.title).toBe(result.outline.title);
    });

    it("respects custom theme", async () => {
      const themedRequest: GenerationRequest = {
        ...baseRequest,
        themeId: "corporate_blue",
      };

      const result = await pipeline.generate(themedRequest);

      expect(result.deck.deck.themeId).toBe("corporate_blue");
    });

    it("uses default theme when not specified", async () => {
      const result = await pipeline.generate(baseRequest);

      expect(result.deck.deck.themeId).toBe("nordic_light");
    });
  });

  describe("progress callback", () => {
    it("reports progress during generation", async () => {
      const progressUpdates: string[] = [];

      const pipelineWithProgress = new GenerationPipeline({
        llmClient: new MockLLMClient(),
        onProgress: (progress) => {
          progressUpdates.push(`${progress.stage}: ${progress.message}`);
        },
      });

      await pipelineWithProgress.generate(baseRequest);

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates.some((p) => p.includes("outline"))).toBe(true);
      expect(progressUpdates.some((p) => p.includes("content"))).toBe(true);
      expect(progressUpdates.some((p) => p.includes("validation"))).toBe(true);
    });
  });

  describe("createPipeline", () => {
    it("creates pipeline with default options", () => {
      process.env.FAKE_LLM = "true";
      const pipeline = createPipeline();
      expect(pipeline).toBeInstanceOf(GenerationPipeline);
    });

    it("creates pipeline with custom options", () => {
      const customPipeline = createPipeline({
        llmClient: new MockLLMClient(),
        maxRepairAttempts: 5,
      });
      expect(customPipeline).toBeInstanceOf(GenerationPipeline);
    });
  });

  describe("generatePresentation convenience function", () => {
    it("generates presentation with default options", async () => {
      process.env.FAKE_LLM = "true";
      const result = await generatePresentation(baseRequest);

      expect(result.outline).toBeDefined();
      expect(result.deck).toBeDefined();
    });

    it("generates presentation with custom options", async () => {
      const result = await generatePresentation(baseRequest, {
        llmClient: new MockLLMClient(),
      });

      expect(result.outline).toBeDefined();
      expect(result.deck).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("PipelineError has correct structure", () => {
      const error = new PipelineError("Test error", "OUTLINE_FAILED");

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("OUTLINE_FAILED");
      expect(error.name).toBe("PipelineError");
    });

    it("PipelineError preserves cause", () => {
      const cause = new Error("Original");
      const error = new PipelineError("Wrapper", "CONTENT_FAILED", cause);

      expect(error.cause).toBe(cause);
    });
  });
});
