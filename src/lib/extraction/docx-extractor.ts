/**
 * DOCX Content Extractor
 *
 * Uses mammoth to extract text from Word documents.
 */

import mammoth from "mammoth";
import {
  type ExtractionResult,
  sanitizeText,
  truncateIfNeeded,
  countWords,
  MAX_TEXT_LENGTH,
} from "./types";

/**
 * Extract text content from a DOCX buffer
 */
export async function extractDocx(buffer: Buffer): Promise<ExtractionResult> {
  const result = await mammoth.extractRawText({ buffer });

  // Sanitize the extracted text
  const sanitized = sanitizeText(result.value);

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
