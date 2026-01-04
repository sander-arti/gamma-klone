/**
 * Content Extraction Factory
 *
 * Central entry point for extracting text from various file types.
 */

import { extractPdf } from "./pdf-extractor";
import { extractDocx } from "./docx-extractor";
import { extractTxt } from "./txt-extractor";
import type { ExtractionResult } from "./types";

export type { ExtractionResult } from "./types";
export { MAX_TEXT_LENGTH, sanitizeText, truncateIfNeeded } from "./types";

// Supported MIME types
export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

// File extension mappings
export const MIME_TYPE_EXTENSIONS: Record<SupportedMimeType, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "text/plain": ".txt",
};

// Human-readable format names
export const MIME_TYPE_NAMES: Record<SupportedMimeType, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word (DOCX)",
  "text/plain": "Tekstfil (TXT)",
};

/**
 * Check if a MIME type is supported for extraction
 */
export function isSupportedMimeType(
  mimeType: string
): mimeType is SupportedMimeType {
  return SUPPORTED_MIME_TYPES.includes(mimeType as SupportedMimeType);
}

/**
 * Extract text content from a file buffer based on MIME type
 *
 * @param buffer - The file content as a Buffer
 * @param mimeType - The MIME type of the file
 * @returns Extraction result with text and metadata
 * @throws Error if MIME type is not supported
 */
export async function extractContent(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  switch (mimeType) {
    case "application/pdf":
      return extractPdf(buffer);

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractDocx(buffer);

    case "text/plain":
      return extractTxt(buffer);

    default:
      throw new Error(`Unsupported MIME type: ${mimeType}`);
  }
}

/**
 * Validate file for upload
 *
 * @param mimeType - The MIME type of the file
 * @param size - The file size in bytes
 * @param maxSize - Maximum allowed file size in bytes (default: 10MB)
 * @returns Validation result with error message if invalid
 */
export function validateFile(
  mimeType: string,
  size: number,
  maxSize: number = 10 * 1024 * 1024 // 10MB default
): { valid: boolean; error?: string; errorCode?: string } {
  if (!isSupportedMimeType(mimeType)) {
    return {
      valid: false,
      error: `Ugyldig filtype. Støttede formater: PDF, DOCX, TXT`,
      errorCode: "INVALID_FILE_TYPE",
    };
  }

  if (size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `Filen er for stor. Maks størrelse: ${maxMB} MB`,
      errorCode: "FILE_TOO_LARGE",
    };
  }

  if (size === 0) {
    return {
      valid: false,
      error: "Filen er tom",
      errorCode: "FILE_EMPTY",
    };
  }

  return { valid: true };
}
