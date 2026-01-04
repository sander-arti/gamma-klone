import { describe, it, expect } from "vitest";
import { buildOutlineSystemPrompt, buildOutlineUserPrompt } from "../prompts/outline";
import type { GenerationRequest } from "@/lib/schemas/deck";

describe("Outline Prompts", () => {
  const baseRequest: GenerationRequest = {
    inputText: "Test input",
    textMode: "generate",
    language: "no",
    amount: "medium",
    imageMode: "none",
  };

  describe("buildOutlineSystemPrompt", () => {
    it("includes generate mode instructions", () => {
      const prompt = buildOutlineSystemPrompt({
        ...baseRequest,
        textMode: "generate",
      });
      expect(prompt).toContain("Create original, engaging content");
    });

    it("includes condense mode instructions", () => {
      const prompt = buildOutlineSystemPrompt({
        ...baseRequest,
        textMode: "condense",
      });
      expect(prompt).toContain("Summarize and structure");
    });

    it("includes preserve mode instructions", () => {
      const prompt = buildOutlineSystemPrompt({
        ...baseRequest,
        textMode: "preserve",
      });
      expect(prompt).toContain("preserving the original phrasing");
    });

    it("includes Norwegian language instruction for 'no'", () => {
      const prompt = buildOutlineSystemPrompt({
        ...baseRequest,
        language: "no",
      });
      expect(prompt).toContain("Norwegian (Bokmål)");
    });

    it("uses provided language when not 'no'", () => {
      const prompt = buildOutlineSystemPrompt({
        ...baseRequest,
        language: "en",
      });
      expect(prompt).toContain("Language: en");
    });

    it("includes slide count for numSlides", () => {
      const prompt = buildOutlineSystemPrompt({
        ...baseRequest,
        numSlides: 10,
      });
      expect(prompt).toContain("Create exactly 10 slides");
    });

    it("includes brief guidance for amount=brief", () => {
      const prompt = buildOutlineSystemPrompt({
        ...baseRequest,
        amount: "brief",
      });
      expect(prompt).toContain("4-6 slides");
    });

    it("includes detailed guidance for amount=detailed", () => {
      const prompt = buildOutlineSystemPrompt({
        ...baseRequest,
        amount: "detailed",
      });
      expect(prompt).toContain("10-15 slides");
    });

    it("includes medium guidance for amount=medium", () => {
      const prompt = buildOutlineSystemPrompt({
        ...baseRequest,
        amount: "medium",
      });
      expect(prompt).toContain("6-10 slides");
    });

    it("includes tone instruction when provided", () => {
      const prompt = buildOutlineSystemPrompt({
        ...baseRequest,
        tone: "professional",
      });
      expect(prompt).toContain("professional tone");
    });

    it("includes audience instruction when provided", () => {
      const prompt = buildOutlineSystemPrompt({
        ...baseRequest,
        audience: "ledere og beslutningstakere",
      });
      expect(prompt).toContain("ledere og beslutningstakere");
    });

    it("includes all slide types", () => {
      const prompt = buildOutlineSystemPrompt(baseRequest);
      expect(prompt).toContain("cover");
      expect(prompt).toContain("agenda");
      expect(prompt).toContain("section_header");
      expect(prompt).toContain("bullets");
      expect(prompt).toContain("two_column_text");
      expect(prompt).toContain("text_plus_image");
      expect(prompt).toContain("decisions_list");
      expect(prompt).toContain("action_items_table");
      expect(prompt).toContain("summary_next_steps");
      expect(prompt).toContain("quote_callout");
    });

    it("includes JSON output format instructions", () => {
      const prompt = buildOutlineSystemPrompt(baseRequest);
      expect(prompt).toContain("Return ONLY valid JSON");
      expect(prompt).toContain('"title"');
      expect(prompt).toContain('"slides"');
    });
  });

  describe("buildOutlineUserPrompt", () => {
    it("returns the input text directly", () => {
      const prompt = buildOutlineUserPrompt({
        ...baseRequest,
        inputText: "Møtenotater fra prosjektmøte 15. desember",
      });
      expect(prompt).toBe("Møtenotater fra prosjektmøte 15. desember");
    });

    it("handles long input text", () => {
      const longInput = "A".repeat(5000);
      const prompt = buildOutlineUserPrompt({
        ...baseRequest,
        inputText: longInput,
      });
      expect(prompt).toBe(longInput);
    });

    it("handles special characters", () => {
      const specialInput = "Møte med årsrapport: «viktig» & <test>";
      const prompt = buildOutlineUserPrompt({
        ...baseRequest,
        inputText: specialInput,
      });
      expect(prompt).toBe(specialInput);
    });
  });
});
