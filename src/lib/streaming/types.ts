/**
 * Stream Event Types for Real-time Generation
 *
 * These types define the SSE events sent from the worker
 * to the frontend during deck generation.
 */

import type { Slide, Outline } from "@/lib/schemas/slide";
import type { Deck } from "@/lib/schemas/deck";
import type { BlockKind } from "@/lib/schemas/block";

/**
 * All possible stream event types
 */
export type StreamEventType =
  | "connected"
  | "generation_started"
  | "outline_complete"
  | "deck_created"     // Deck created early - redirect to editor
  | "slide_started"
  | "slide_content"
  | "slide_validated"
  | "generation_complete"
  | "generation_failed"
  // Character-level streaming events (Gamma-style typing effect)
  | "block_started"   // A new block within a slide started generating
  | "block_delta"     // Text chunk for the current block
  | "block_complete"  // Block finished generating
  // Image generation events
  | "image_started"   // Image generation phase started
  | "image_progress"  // Individual image being generated
  | "image_complete"; // Single image finished (includes URL)

/**
 * Error information for failed generations
 */
export interface StreamError {
  code: string;
  message: string;
}

/**
 * Data payload for stream events
 */
export interface StreamEventData {
  /** Current pipeline stage */
  stage?: string;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Current slide index (0-based) */
  slideIndex?: number;
  /** Total number of slides being generated (from outline.slides.length) */
  totalSlides?: number;
  /** Number of slides the user requested (from request.numSlides) - single source of truth */
  requestedSlides?: number;
  /** Actual number of slides AI generated (from outline.slides.length) */
  actualSlides?: number;
  /** Completed slide content */
  slide?: Slide;
  /** Completed outline */
  outline?: Outline;
  /** Final deck (on completion) */
  deck?: Deck;
  /** Deck ID (for immediate completion case) */
  deckId?: string;
  /** View URL (for immediate completion case) */
  viewUrl?: string | null;
  /** Error details (on failure) */
  error?: StreamError;

  // Character-level streaming fields (Gamma-style typing effect)
  /** Block index within the slide (0-based) */
  blockIndex?: number;
  /** Type of block being generated */
  blockKind?: BlockKind;
  /** Text delta/chunk to append (only the new characters) */
  delta?: string;

  // Image generation fields (for image_* events)
  /** Total number of images being generated */
  totalImages?: number;
  /** Current image index (1-based for display) */
  imageIndex?: number;
  /** Generated image URL (when complete) */
  imageUrl?: string;
}

/**
 * A single stream event
 */
export interface StreamEvent {
  /** Event type */
  type: StreamEventType;
  /** Generation ID for correlation */
  generationId: string;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** Event-specific data */
  data?: StreamEventData;
}

/**
 * Create a stream event
 */
export function createStreamEvent(
  type: StreamEventType,
  generationId: string,
  data?: StreamEventData
): StreamEvent {
  return {
    type,
    generationId,
    timestamp: Date.now(),
    data,
  };
}

/**
 * Format a stream event for SSE
 */
export function formatSSE(event: StreamEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}
