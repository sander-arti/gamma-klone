import { describe, it, expect } from "vitest";
import { extractNumberFromTitle } from "../constraints";

describe("extractNumberFromTitle", () => {
  describe("digit patterns", () => {
    it("extracts digit at start", () => {
      expect(extractNumberFromTitle("3 punkter")).toBe(3);
      expect(extractNumberFromTitle("5 tips for deg")).toBe(5);
      expect(extractNumberFromTitle("10 grunner til")).toBe(10);
    });
  });

  describe("Norwegian number words at start", () => {
    it("extracts 'Fire'", () => {
      expect(extractNumberFromTitle("Fire bunnsolide USP-er")).toBe(4);
    });

    it("extracts 'Tre'", () => {
      expect(extractNumberFromTitle("Tre steg til suksess")).toBe(3);
    });

    it("extracts 'Fem'", () => {
      expect(extractNumberFromTitle("Fem fordeler med løsningen")).toBe(5);
    });

    it("is case insensitive", () => {
      expect(extractNumberFromTitle("FIRE PUNKTER")).toBe(4);
      expect(extractNumberFromTitle("tre tips")).toBe(3);
    });
  });

  describe("Norwegian number words with common suffixes", () => {
    it("finds number before 'viktigste'", () => {
      expect(extractNumberFromTitle("De fire viktigste punktene")).toBe(4);
    });

    it("finds number before 'beste'", () => {
      expect(extractNumberFromTitle("Våre tre beste tips")).toBe(3);
    });

    it("finds number before 'hovedpunkter'", () => {
      expect(extractNumberFromTitle("Strategiens fem hovedpunkter")).toBe(5);
    });
  });

  describe("no match cases", () => {
    it("returns null for titles without numbers", () => {
      expect(extractNumberFromTitle("Våre USP-er")).toBeNull();
      expect(extractNumberFromTitle("Viktige punkter")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(extractNumberFromTitle("")).toBeNull();
    });

    it("returns null for numbers not in expected positions", () => {
      expect(extractNumberFromTitle("Produktet koster 100 kr")).toBeNull();
    });
  });
});
