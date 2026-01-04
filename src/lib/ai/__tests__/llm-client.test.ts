import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { getLLMClient, LLMError, OpenAIClient } from "../llm-client";
import { MockLLMClient } from "../mock-llm";

describe("LLM Client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getLLMClient", () => {
    it("returns MockLLMClient when FAKE_LLM=true", () => {
      process.env.FAKE_LLM = "true";
      const client = getLLMClient();
      expect(client).toBeInstanceOf(MockLLMClient);
    });

    it("throws error when FAKE_LLM=false and no API key", () => {
      process.env.FAKE_LLM = "false";
      delete process.env.OPENAI_API_KEY;
      expect(() => getLLMClient()).toThrow("OPENAI_API_KEY environment variable is required");
    });

    it("returns OpenAIClient when FAKE_LLM=false with API key", () => {
      process.env.FAKE_LLM = "false";
      process.env.OPENAI_API_KEY = "test-key";
      const client = getLLMClient();
      expect(client).toBeInstanceOf(OpenAIClient);
    });
  });

  describe("MockLLMClient", () => {
    it("generates valid outline for meeting-related input", async () => {
      const client = new MockLLMClient();
      const schema = z.object({
        title: z.string(),
        slides: z.array(
          z.object({
            title: z.string(),
            suggestedType: z.string().optional(),
            hints: z.array(z.string()).optional(),
          })
        ),
      });

      const result = await client.generateJSON(
        "Generate an outline",
        "Møtereferat fra prosjektmøte",
        schema
      );

      expect(result.title).toBe("Møtereferat");
      expect(result.slides.length).toBeGreaterThan(0);
      expect(result.slides[0].suggestedType).toBe("cover");
    });

    it("generates valid outline for product-related input", async () => {
      const client = new MockLLMClient();
      const schema = z.object({
        title: z.string(),
        slides: z.array(
          z.object({
            title: z.string(),
            suggestedType: z.string().optional(),
            hints: z.array(z.string()).optional(),
          })
        ),
      });

      const result = await client.generateJSON(
        "Generate an outline",
        "Produktlansering for ny app",
        schema
      );

      expect(result.title).toBe("Produktpresentasjon");
      expect(result.slides.length).toBeGreaterThan(0);
    });

    it("generates cover slide for cover-related prompts", async () => {
      const client = new MockLLMClient();
      const schema = z.object({
        type: z.string(),
        layoutVariant: z.string(),
        blocks: z.array(z.object({ kind: z.string(), text: z.string().optional() })),
      });

      const result = await client.generateJSON(
        "Generate slide content",
        "Create a cover slide with tittel",
        schema
      );

      expect(result.type).toBe("cover");
    });

    it("generates agenda slide for agenda-related prompts", async () => {
      const client = new MockLLMClient();
      const schema = z.object({
        type: z.string(),
        layoutVariant: z.string(),
        blocks: z.array(
          z.object({
            kind: z.string(),
            text: z.string().optional(),
            items: z.array(z.string()).optional(),
          })
        ),
      });

      const result = await client.generateJSON(
        "Generate slide content",
        "Create an agenda slide",
        schema
      );

      expect(result.type).toBe("agenda");
    });

    it("generates repaired slide for repair prompts", async () => {
      const client = new MockLLMClient();
      const schema = z.object({
        type: z.string(),
        layoutVariant: z.string(),
        blocks: z.array(
          z.object({
            kind: z.string(),
            text: z.string().optional(),
            items: z.array(z.string()).optional(),
          })
        ),
      });

      const result = await client.generateJSON(
        "Repair the following slide that has violations",
        "Fix this content",
        schema
      );

      expect(result.type).toBe("bullets");
      expect(result.blocks.length).toBeGreaterThan(0);
    });

    it("throws error when schema validation fails", async () => {
      const client = new MockLLMClient();
      const strictSchema = z.object({
        nonExistentField: z.string(),
      });

      await expect(
        client.generateJSON("Generate outline", "Test input", strictSchema)
      ).rejects.toThrow("Mock data validation failed");
    });
  });

  describe("LLMError", () => {
    it("has correct error code for MODEL_ERROR", () => {
      const error = new LLMError("Test error", "MODEL_ERROR");
      expect(error.code).toBe("MODEL_ERROR");
      expect(error.name).toBe("LLMError");
    });

    it("has correct error code for PARSE_ERROR", () => {
      const error = new LLMError("Parse failed", "PARSE_ERROR");
      expect(error.code).toBe("PARSE_ERROR");
    });

    it("preserves cause", () => {
      const cause = new Error("Original error");
      const error = new LLMError("Wrapper", "MODEL_ERROR", cause);
      expect(error.cause).toBe(cause);
    });
  });
});
