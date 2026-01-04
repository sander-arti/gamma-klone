/**
 * Content Extraction Types
 *
 * Shared types for content extractors.
 */

export interface ExtractionResult {
  text: string;
  charCount: number;
  truncated: boolean;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
  };
}

export interface ContentExtractor {
  extract(buffer: Buffer): Promise<ExtractionResult>;
}

// Maximum text length (50,000 characters to match paste input limit)
export const MAX_TEXT_LENGTH = 50000;

/**
 * Sanitize extracted text
 * - Normalize line endings
 * - Collapse excessive whitespace
 * - Trim lines
 * - Remove null bytes (PostgreSQL incompatible)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/\x00/g, "") // Remove null bytes
    .replace(/\r\n/g, "\n") // Normalize CRLF to LF
    .replace(/\r/g, "\n") // Normalize CR to LF
    .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines
    .replace(/[ \t]+/g, " ") // Collapse horizontal whitespace
    .replace(/^\s+|\s+$/gm, "") // Trim each line
    .trim();
}

/**
 * Truncate text if it exceeds the maximum length
 */
export function truncateIfNeeded(
  text: string,
  maxLength: number = MAX_TEXT_LENGTH
): { text: string; truncated: boolean } {
  if (text.length <= maxLength) {
    return { text, truncated: false };
  }

  // Try to truncate at a sentence or paragraph boundary
  let truncatedText = text.substring(0, maxLength);

  // Look for last paragraph break
  const lastParagraph = truncatedText.lastIndexOf("\n\n");
  if (lastParagraph > maxLength * 0.8) {
    truncatedText = truncatedText.substring(0, lastParagraph);
  } else {
    // Look for last sentence break
    const lastSentence = truncatedText.lastIndexOf(". ");
    if (lastSentence > maxLength * 0.8) {
      truncatedText = truncatedText.substring(0, lastSentence + 1);
    }
  }

  return { text: truncatedText.trim(), truncated: true };
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}
