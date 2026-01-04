/**
 * S3 Storage Client Tests
 *
 * Tests for S3-compatible storage operations.
 * Note: Full integration tests require MinIO running.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getBucket,
  generateExportKey,
  calculateExpiryDate,
  getDefaultExpirySeconds,
} from "../s3-client";

describe("s3-client", () => {
  describe("getBucket", () => {
    it("returns the configured bucket name", () => {
      const bucket = getBucket();
      expect(bucket).toBeDefined();
      expect(typeof bucket).toBe("string");
    });
  });

  describe("generateExportKey", () => {
    it("generates correct PDF key format", () => {
      const generationId = "gen-123";
      const key = generateExportKey(generationId, "pdf");

      expect(key).toContain("exports/");
      expect(key).toContain(generationId);
      expect(key).toMatch(/\.pdf$/);
    });

    it("generates correct PPTX key format", () => {
      const generationId = "gen-456";
      const key = generateExportKey(generationId, "pptx");

      expect(key).toContain("exports/");
      expect(key).toContain(generationId);
      expect(key).toMatch(/\.pptx$/);
    });

    it("includes timestamp for uniqueness", () => {
      const generationId = "gen-789";
      const key1 = generateExportKey(generationId, "pdf");

      // Wait briefly to ensure different timestamp
      vi.useFakeTimers();
      vi.advanceTimersByTime(100);
      const key2 = generateExportKey(generationId, "pdf");
      vi.useRealTimers();

      // Keys should be different due to timestamp
      expect(key1).not.toBe(key2);
    });
  });

  describe("calculateExpiryDate", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("calculates expiry from seconds", () => {
      const expiry = calculateExpiryDate(3600); // 1 hour

      expect(expiry).toBeInstanceOf(Date);
      expect(expiry.getTime()).toBe(new Date("2025-01-15T12:00:00Z").getTime() + 3600 * 1000);
    });

    it("uses default expiry when no argument provided", () => {
      const defaultSeconds = getDefaultExpirySeconds();
      const expiry = calculateExpiryDate();

      expect(expiry.getTime()).toBe(
        new Date("2025-01-15T12:00:00Z").getTime() + defaultSeconds * 1000
      );
    });
  });

  describe("getDefaultExpirySeconds", () => {
    it("returns a positive number", () => {
      const seconds = getDefaultExpirySeconds();
      expect(seconds).toBeGreaterThan(0);
    });
  });
});

describe("s3-client integration", () => {
  // These tests require MinIO to be running
  // Run with: docker-compose up -d minio
  describe.skip("MinIO integration (requires running MinIO)", () => {
    it("can upload a file", async () => {
      // TODO: Implement when MinIO is available
    });

    it("can generate signed URL", async () => {
      // TODO: Implement when MinIO is available
    });

    it("can check if file exists", async () => {
      // TODO: Implement when MinIO is available
    });

    it("can delete a file", async () => {
      // TODO: Implement when MinIO is available
    });
  });
});
