/**
 * PDF Content Extractor
 *
 * Uses pdf-parse to extract text from PDF files.
 */

import { PDFParse } from "pdf-parse";
import {
  type ExtractionResult,
  sanitizeText,
  truncateIfNeeded,
  countWords,
  MAX_TEXT_LENGTH,
} from "./types";

/**
 * Extract text content from a PDF buffer
 */
export async function extractPdf(buffer: Buffer): Promise<ExtractionResult> {
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();

  // Sanitize the extracted text
  const sanitized = sanitizeText(data.text);

  // Truncate if needed
  const { text, truncated } = truncateIfNeeded(sanitized, MAX_TEXT_LENGTH);

  return {
    text,
    charCount: text.length,
    truncated,
    metadata: {
      pageCount: data.pages.length,
      wordCount: countWords(text),
    },
  };
}
