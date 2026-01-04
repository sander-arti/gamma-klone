/**
 * User Messages Tests
 *
 * Ensures all error codes have Norwegian user-friendly messages.
 */

import { describe, it, expect } from "vitest";
import {
  getUserFriendlyError,
  isTemporaryError,
  isUserActionable,
  API_ERROR_MESSAGES,
  PIPELINE_ERROR_MESSAGES,
  LLM_ERROR_MESSAGES,
} from "../user-messages";

describe("getUserFriendlyError", () => {
  describe("API Error Codes", () => {
    const apiCodes = Object.keys(API_ERROR_MESSAGES);

    it("should have messages for all API error codes", () => {
      expect(apiCodes).toContain("INVALID_REQUEST");
      expect(apiCodes).toContain("UNAUTHORIZED");
      expect(apiCodes).toContain("FORBIDDEN");
      expect(apiCodes).toContain("NOT_FOUND");
      expect(apiCodes).toContain("RATE_LIMITED");
      expect(apiCodes).toContain("MODEL_ERROR");
      expect(apiCodes).toContain("INTERNAL_ERROR");
    });

    apiCodes.forEach((code) => {
      it(`should return Norwegian message for ${code}`, () => {
        const result = getUserFriendlyError(code as any);
        expect(result.title).toBeTruthy();
        expect(result.message).toBeTruthy();
        expect(result.title).toMatch(/^[A-ZÆØÅ]/); // Starts with capital
        expect(result.message).toMatch(/^[A-ZÆØÅ]/); // Starts with capital
        expect(typeof result.isTemporary).toBe("boolean");
        expect(typeof result.isUserActionable).toBe("boolean");
      });

      it(`should have recovery actions for ${code}`, () => {
        const result = getUserFriendlyError(code as any);
        if (result.recovery) {
          expect(Array.isArray(result.recovery)).toBe(true);
          expect(result.recovery.length).toBeGreaterThan(0);
          result.recovery.forEach((action) => {
            expect(typeof action).toBe("string");
            expect(action.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  describe("Pipeline Error Codes", () => {
    const pipelineCodes = Object.keys(PIPELINE_ERROR_MESSAGES);

    it("should have messages for all pipeline error codes", () => {
      expect(pipelineCodes).toContain("OUTLINE_FAILED");
      expect(pipelineCodes).toContain("CONTENT_FAILED");
      expect(pipelineCodes).toContain("VALIDATION_FAILED");
      expect(pipelineCodes).toContain("REPAIR_FAILED");
      expect(pipelineCodes).toContain("MAX_RETRIES");
      expect(pipelineCodes).toContain("TEMPLATE_NOT_FOUND");
      expect(pipelineCodes).toContain("TEMPLATE_GENERATION_FAILED");
    });

    pipelineCodes.forEach((code) => {
      it(`should return Norwegian message for ${code}`, () => {
        const result = getUserFriendlyError(code as any);
        expect(result.title).toBeTruthy();
        expect(result.message).toBeTruthy();
        expect(result.recovery).toBeDefined();
        expect(Array.isArray(result.recovery)).toBe(true);
      });
    });
  });

  describe("LLM Error Codes", () => {
    const llmCodes = Object.keys(LLM_ERROR_MESSAGES);

    it("should have messages for all LLM error codes", () => {
      expect(llmCodes).toContain("MODEL_ERROR");
      expect(llmCodes).toContain("INVALID_RESPONSE");
      expect(llmCodes).toContain("RATE_LIMITED");
      expect(llmCodes).toContain("PARSE_ERROR");
    });

    llmCodes.forEach((code) => {
      it(`should return Norwegian message for ${code}`, () => {
        const result = getUserFriendlyError(code as any);
        expect(result.title).toBeTruthy();
        expect(result.message).toBeTruthy();
      });
    });
  });

  describe("Unknown error codes", () => {
    it("should return fallback message for unknown code", () => {
      const result = getUserFriendlyError("UNKNOWN_CODE_12345" as any);
      expect(result.title).toBe("Noe gikk galt");
      expect(result.message).toContain("uventet feil");
      expect(result.isTemporary).toBe(true);
      expect(result.isUserActionable).toBe(true);
    });
  });
});

describe("isTemporaryError", () => {
  it("should identify temporary errors correctly", () => {
    expect(isTemporaryError("RATE_LIMITED" as any)).toBe(true);
    expect(isTemporaryError("MODEL_ERROR" as any)).toBe(true);
    expect(isTemporaryError("INTERNAL_ERROR" as any)).toBe(true);
    expect(isTemporaryError("MAX_RETRIES" as any)).toBe(true);

    expect(isTemporaryError("INVALID_REQUEST" as any)).toBe(false);
    expect(isTemporaryError("UNAUTHORIZED" as any)).toBe(false);
    expect(isTemporaryError("NOT_FOUND" as any)).toBe(false);
  });
});

describe("isUserActionable", () => {
  it("should identify actionable errors correctly", () => {
    expect(isUserActionable("INVALID_REQUEST" as any)).toBe(true);
    expect(isUserActionable("UNAUTHORIZED" as any)).toBe(true);
    expect(isUserActionable("RATE_LIMITED" as any)).toBe(true);
    expect(isUserActionable("OUTLINE_FAILED" as any)).toBe(true);

    expect(isUserActionable("FORBIDDEN" as any)).toBe(false);
    expect(isUserActionable("NOT_FOUND" as any)).toBe(false);
  });
});

describe("Message Quality", () => {
  const allMessages = {
    ...API_ERROR_MESSAGES,
    ...PIPELINE_ERROR_MESSAGES,
    ...LLM_ERROR_MESSAGES,
  };

  Object.entries(allMessages).forEach(([code, message]) => {
    describe(`${code} message quality`, () => {
      it("should have concise title (max 50 chars)", () => {
        expect(message.title.length).toBeLessThanOrEqual(50);
      });

      it("should have clear message (max 200 chars)", () => {
        expect(message.message.length).toBeLessThanOrEqual(200);
      });

      it("should not contain technical jargon in title", () => {
        const technicalTerms = ["API", "JSON", "HTTP", "500", "404"];
        const hasJargon = technicalTerms.some((term) =>
          message.title.includes(term)
        );
        //允许 "API" 在某些情况下出现（如 "API-nøkkelen"）
        if (hasJargon && !message.title.includes("API-")) {
          expect(hasJargon).toBe(false);
        }
      });

      it("should use Norwegian language", () => {
        // Check for common Norwegian words
        const norwegianIndicators = [
          "ikke",
          "er",
          "til",
          "på",
          "for",
          "med",
          "eller",
          "kan",
          "vil",
          "har",
          "om",
          "å",
        ];
        const text = `${message.title} ${message.message}`.toLowerCase();
        const hasNorwegian = norwegianIndicators.some((word) =>
          text.includes(word)
        );
        expect(hasNorwegian).toBe(true);
      });

      if (message.recovery) {
        it("should have actionable recovery steps", () => {
          message.recovery.forEach((step) => {
            // Recovery steps should start with action verbs
            const actionVerbs = [
              "Prøv",
              "Sjekk",
              "Vent",
              "Kontakt",
              "Last",
              "Gå",
              "Velg",
              "Reduser",
              "Øk",
              "Forenkle",
              "Kort",
              "Legg",
              "Oppgrader",
              "Verifiser",
              "Juster",
              "Vær", // "Vær mer spesifikk"
            ];
            const startsWithAction = actionVerbs.some((verb) =>
              step.startsWith(verb)
            );
            expect(startsWithAction).toBe(true);
          });
        });
      }
    });
  });
});
