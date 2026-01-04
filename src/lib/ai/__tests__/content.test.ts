import { describe, it, expect } from "vitest";
import { buildContentSystemPrompt, buildContentUserPrompt } from "../prompts/content";
import type { GenerationRequest } from "@/lib/schemas/deck";
import type { OutlineSlide } from "@/lib/schemas/slide";

describe("Content Prompts", () => {
  const baseRequest: GenerationRequest = {
    inputText: "Test input for presentation",
    textMode: "generate",
    language: "no",
    amount: "medium",
    imageMode: "none",
  };

  const baseOutlineSlide: OutlineSlide = {
    title: "Test Slide",
    suggestedType: "bullets",
    hints: ["hint 1", "hint 2"],
  };

  describe("buildContentSystemPrompt", () => {
    it("includes slide position info", () => {
      const prompt = buildContentSystemPrompt(baseOutlineSlide, baseRequest, 2, 10);
      expect(prompt).toContain("slide 3 of 10");
    });

    it("includes slide title and type", () => {
      const prompt = buildContentSystemPrompt(baseOutlineSlide, baseRequest, 0, 5);
      expect(prompt).toContain('Title: "Test Slide"');
      expect(prompt).toContain("Type: bullets");
    });

    it("includes hints when provided", () => {
      const prompt = buildContentSystemPrompt(baseOutlineSlide, baseRequest, 0, 5);
      expect(prompt).toContain("hint 1, hint 2");
    });

    it("shows 'None' when no hints", () => {
      const slideWithoutHints: OutlineSlide = { title: "No hints", suggestedType: "cover" };
      const prompt = buildContentSystemPrompt(slideWithoutHints, baseRequest, 0, 5);
      expect(prompt).toContain("Hints: None");
    });

    it("includes generate mode instructions", () => {
      const prompt = buildContentSystemPrompt(
        baseOutlineSlide,
        { ...baseRequest, textMode: "generate" },
        0,
        5
      );
      expect(prompt).toContain("Create engaging, original content");
    });

    it("includes condense mode instructions", () => {
      const prompt = buildContentSystemPrompt(
        baseOutlineSlide,
        { ...baseRequest, textMode: "condense" },
        0,
        5
      );
      expect(prompt).toContain("Extract and summarize");
    });

    it("includes preserve mode instructions", () => {
      const prompt = buildContentSystemPrompt(
        baseOutlineSlide,
        { ...baseRequest, textMode: "preserve" },
        0,
        5
      );
      expect(prompt).toContain("Use the original text");
    });

    it("includes constraints for bullets slide type", () => {
      const prompt = buildContentSystemPrompt(baseOutlineSlide, baseRequest, 0, 5);
      expect(prompt).toContain("CONSTRAINTS FOR BULLETS");
      expect(prompt).toContain("max 70 characters");
      expect(prompt).toContain("3-6 items");
    });

    it("includes constraints for cover slide type", () => {
      const coverSlide: OutlineSlide = { title: "Cover", suggestedType: "cover" };
      const prompt = buildContentSystemPrompt(coverSlide, baseRequest, 0, 5);
      expect(prompt).toContain("CONSTRAINTS FOR COVER");
      expect(prompt).toContain("max 60 characters");
    });

    it("includes block structure for bullets", () => {
      const prompt = buildContentSystemPrompt(baseOutlineSlide, baseRequest, 0, 5);
      expect(prompt).toContain('{ "kind": "title"');
      expect(prompt).toContain('{ "kind": "bullets"');
    });

    it("includes block structure for action_items_table", () => {
      const tableSlide: OutlineSlide = { title: "Actions", suggestedType: "action_items_table" };
      const prompt = buildContentSystemPrompt(tableSlide, baseRequest, 0, 5);
      expect(prompt).toContain('{ "kind": "table"');
      expect(prompt).toContain('"columns"');
    });

    it("uses bullets as default type when suggestedType is undefined", () => {
      const noTypeSlide: OutlineSlide = { title: "No type" };
      const prompt = buildContentSystemPrompt(noTypeSlide, baseRequest, 0, 5);
      expect(prompt).toContain("Type: bullets");
    });

    it("includes tone when provided", () => {
      const prompt = buildContentSystemPrompt(
        baseOutlineSlide,
        { ...baseRequest, tone: "formal" },
        0,
        5
      );
      expect(prompt).toContain("Tone: formal");
    });

    it("includes Norwegian language instruction", () => {
      const prompt = buildContentSystemPrompt(baseOutlineSlide, baseRequest, 0, 5);
      expect(prompt).toContain("Norwegian (Bokmål)");
    });
  });

  describe("buildContentUserPrompt", () => {
    it("includes original input text", () => {
      const prompt = buildContentUserPrompt(baseOutlineSlide, baseRequest, "Context from original");
      expect(prompt).toContain("Context from original");
    });

    it("includes slide title", () => {
      const prompt = buildContentUserPrompt(baseOutlineSlide, baseRequest, "context");
      expect(prompt).toContain("Title: Test Slide");
    });

    it("includes hints when available", () => {
      const prompt = buildContentUserPrompt(baseOutlineSlide, baseRequest, "context");
      expect(prompt).toContain("Key points to include: hint 1, hint 2");
    });

    it("omits hints section when no hints", () => {
      const noHintsSlide: OutlineSlide = { title: "No hints" };
      const prompt = buildContentUserPrompt(noHintsSlide, baseRequest, "context");
      expect(prompt).not.toContain("Key points to include");
    });
  });
});
