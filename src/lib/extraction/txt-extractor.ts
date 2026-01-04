/**
 * TXT Content Extractor
 *
 * Simple text file extraction with encoding detection.
 */

import {
  type ExtractionResult,
  sanitizeText,
  truncateIfNeeded,
  countWords,
  MAX_TEXT_LENGTH,
} from "./types";

/**
 * Extract text content from a plain text buffer
 */
export async function extractTxt(buffer: Buffer): Promise<ExtractionResult> {
  // Convert buffer to string (assume UTF-8)
  const rawText = buffer.toString("utf-8");

  // Sanitize the text
  const sanitized = sanitizeText(rawText);

  // Truncate if needed
  const { text, truncated } = truncateIfNeeded(sanitized, MAX_TEXT_LENGTH);

  return {
    text,
    charCount: text.length,
    truncated,
    metadata: {
      wordCount: countWords(text),
    },
  };
}
