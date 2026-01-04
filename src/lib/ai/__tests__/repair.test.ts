import { describe, it, expect } from "vitest";
import {
  buildRepairSystemPrompt,
  buildRepairUserPrompt,
  buildSplitSystemPrompt,
  buildSplitUserPrompt,
} from "../prompts/repair";
import type { Slide } from "@/lib/schemas/slide";
import type { ConstraintViolation } from "@/lib/validation/constraints";

describe("Repair Prompts", () => {
  const sampleSlide: Slide = {
    type: "bullets",
    layoutVariant: "default",
    blocks: [
      { kind: "title", text: "Test Title" },
      { kind: "bullets", items: ["Point 1", "Point 2", "Point 3"] },
    ],
  };

  const shortenViolation: ConstraintViolation = {
    field: "title",
    message: "Title exceeds 70 characters",
    current: 100,
    limit: 70,
    action: "shorten",
  };

  const splitViolation: ConstraintViolation = {
    field: "bullets",
    message: "Exceeds maximum 6 bullet points",
    current: 10,
    limit: 6,
    action: "split",
  };

  describe("buildRepairSystemPrompt", () => {
    it("lists all violations", () => {
      const prompt = buildRepairSystemPrompt([shortenViolation]);
      expect(prompt).toContain("title");
      expect(prompt).toContain("exceeds 70 characters");
      expect(prompt).toContain("current: 100");
      expect(prompt).toContain("limit: 70");
    });

    it("includes SHORTEN action for shorten violations", () => {
      const prompt = buildRepairSystemPrompt([shortenViolation]);
      expect(prompt).toContain("SHORTEN");
      expect(prompt).toContain("reduce length");
    });

    it("includes SPLIT guidance for split violations", () => {
      const prompt = buildRepairSystemPrompt([splitViolation]);
      expect(prompt).toContain("Consider restructuring");
    });

    it("includes both actions when mixed violations", () => {
      const prompt = buildRepairSystemPrompt([shortenViolation, splitViolation]);
      expect(prompt).toContain("SHORTEN the content");
      expect(prompt).toContain("Keep the core meaning");
    });

    it("preserves slide structure rule", () => {
      const prompt = buildRepairSystemPrompt([shortenViolation]);
      expect(prompt).toContain("Return the SAME slide structure");
    });

    it("includes JSON output format", () => {
      const prompt = buildRepairSystemPrompt([shortenViolation]);
      expect(prompt).toContain("Return ONLY valid JSON");
      expect(prompt).toContain('"type"');
      expect(prompt).toContain('"blocks"');
    });
  });

  describe("buildRepairUserPrompt", () => {
    it("includes slide as JSON", () => {
      const prompt = buildRepairUserPrompt(sampleSlide);
      expect(prompt).toContain("Please repair this slide");
      expect(prompt).toContain('"type": "bullets"');
      expect(prompt).toContain('"kind": "title"');
    });

    it("includes all blocks", () => {
      const prompt = buildRepairUserPrompt(sampleSlide);
      expect(prompt).toContain("Point 1");
      expect(prompt).toContain("Point 2");
    });
  });

  describe("buildSplitSystemPrompt", () => {
    it("includes original title", () => {
      const prompt = buildSplitSystemPrompt("My Long Slide");
      expect(prompt).toContain('ORIGINAL SLIDE TITLE: "My Long Slide"');
    });

    it("specifies 2-3 slides output", () => {
      const prompt = buildSplitSystemPrompt("Title");
      expect(prompt).toContain("Create 2-3 slides");
    });

    it("includes continuation naming convention", () => {
      const prompt = buildSplitSystemPrompt("Test Title");
      expect(prompt).toContain("Test Title (fortsettelse)");
    });

    it("includes JSON output format for array", () => {
      const prompt = buildSplitSystemPrompt("Title");
      expect(prompt).toContain('"slides"');
      expect(prompt).toContain("array of slides");
    });
  });

  describe("buildSplitUserPrompt", () => {
    it("includes violation summary", () => {
      const prompt = buildSplitUserPrompt(sampleSlide, [shortenViolation, splitViolation]);
      expect(prompt).toContain("title: 100 chars (limit: 70)");
      expect(prompt).toContain("bullets: 10 chars (limit: 6)");
    });

    it("includes slide JSON", () => {
      const prompt = buildSplitUserPrompt(sampleSlide, [shortenViolation]);
      expect(prompt).toContain('"type": "bullets"');
    });

    it("requests split explicitly", () => {
      const prompt = buildSplitUserPrompt(sampleSlide, [splitViolation]);
      expect(prompt).toContain("split it into multiple slides");
    });
  });
});
