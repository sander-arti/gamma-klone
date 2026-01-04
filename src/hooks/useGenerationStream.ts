/**
 * useGenerationStream Hook
 *
 * React hook for real-time generation streaming via SSE.
 * Connects to /api/generations/:id/stream and manages state.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Slide, Outline } from "@/lib/schemas/slide";
import type { Deck } from "@/lib/schemas/deck";
import type { BlockKind } from "@/lib/schemas/block";
import type { StreamEvent, StreamEventType } from "@/lib/streaming/types";

/**
 * Represents a block being streamed character-by-character
 */
export interface StreamingBlock {
  kind: BlockKind;
  text: string;
  isComplete: boolean;
}

/**
 * State for the currently streaming slide
 */
export interface StreamingSlideState {
  slideIndex: number;
  blocks: StreamingBlock[];
  isStreaming: boolean;
}

export interface GenerationStreamState {
  status: "idle" | "connecting" | "streaming" | "complete" | "failed";
  progress: number;
  currentStage: string;
  outline: Outline | null;
  slides: Slide[];
  deck: Deck | null;
  error: { code: string; message: string } | null;
  /** Generation result from polling fallback */
  result: { deckId: string; viewUrl: string } | null;
  /** Currently streaming slide with character-by-character updates */
  streamingSlide: StreamingSlideState | null;
  /** Deck ID available early for live redirect (before generation completes) */
  liveDeckId: string | null;
  /** Authoritative total slide count - single source of truth */
  totalSlides: number;
  /** Number of slides user requested (from request.numSlides) */
  requestedSlides: number;
  /** Actual number of slides AI generated (from outline.slides.length) */
  actualSlides: number;
  /** Whether currently in image generation phase */
  isGeneratingImages: boolean;
  /** Total number of images being generated */
  totalImages: number;
  /** Current image index (1-based) */
  currentImageIndex: number;
  /** Map of slideIndex to generated imageUrl */
  generatedImages: Record<number, string>;
  /** Actual number of images that have completed successfully */
  imagesCompleted: number;
}

const initialState: GenerationStreamState = {
  status: "idle",
  progress: 0,
  currentStage: "",
  outline: null,
  slides: [],
  deck: null,
  error: null,
  result: null,
  streamingSlide: null,
  liveDeckId: null,
  totalSlides: 0,
  requestedSlides: 0,
  actualSlides: 0,
  isGeneratingImages: false,
  totalImages: 0,
  currentImageIndex: 0,
  generatedImages: {},
  imagesCompleted: 0,
};

interface UseGenerationStreamOptions {
  /** Enable fallback to polling if SSE fails */
  enablePollingFallback?: boolean;
  /** Polling interval in ms (default: 2000) */
  pollingInterval?: number;
  /** Max reconnection attempts for SSE (default: 3) */
  maxReconnectAttempts?: number;
}

export function useGenerationStream(
  generationId: string | null,
  options: UseGenerationStreamOptions = {}
) {
  const {
    enablePollingFallback = true,
    pollingInterval = 2000,
    maxReconnectAttempts = 3,
  } = options;

  const [state, setState] = useState<GenerationStreamState>(initialState);
  const reconnectAttemptsRef = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state
  const reset = useCallback(() => {
    setState(initialState);
    reconnectAttemptsRef.current = 0;
  }, []);

  // Polling fallback
  const startPolling = useCallback(
    (id: string) => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      const poll = async () => {
        try {
          const res = await fetch(`/api/generations/${id}`);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          const data = await res.json();
          // API returns directly at root level, not nested under "generation"
          const job = data;

          setState((s) => ({
            ...s,
            progress: job.progress ?? s.progress,
            currentStage:
              job.status === "running"
                ? `Genererer... ${job.progress ?? 0}%`
                : s.currentStage,
          }));

          if (job.status === "completed") {
            // Extract deckId from viewUrl: "/deck/{deckId}"
            const deckId = job.viewUrl?.split("/").pop() ?? null;
            setState((s) => ({
              ...s,
              status: "complete",
              progress: 100,
              currentStage: "Ferdig!",
              result: deckId
                ? { deckId, viewUrl: job.viewUrl }
                : null,
            }));
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          } else if (job.status === "failed") {
            setState((s) => ({
              ...s,
              status: "failed",
              error: {
                code: job.error?.code ?? "UNKNOWN",
                message: job.error?.message ?? "En feil oppstod",
              },
            }));
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        } catch (err) {
          console.error("Polling failed:", err);
        }
      };

      // Initial poll
      poll();

      // Set up interval
      pollingIntervalRef.current = setInterval(poll, pollingInterval);
    },
    [pollingInterval]
  );

  // Handle stream events
  const handleEvent = useCallback((event: StreamEvent) => {
    const { type, data } = event;

    // Extract deckId from ANY event that contains it (for redirect reliability)
    // This ensures we can redirect even if deck_created event was missed
    const eventDeckId = data?.deckId as string | undefined;
    if (eventDeckId) {
      setState((s) => ({
        ...s,
        liveDeckId: s.liveDeckId ?? eventDeckId,
      }));
    }

    switch (type) {
      case "connected":
        setState((s) => ({
          ...s,
          status: "streaming",
          currentStage: "Tilkoblet...",
        }));
        break;

      case "generation_started":
        setState((s) => ({
          ...s,
          status: "streaming",
          progress: data?.progress ?? 0,
          currentStage: "Starter generering...",
          // Set requestedSlides from SSE event (user's choice)
          requestedSlides: (data?.requestedSlides as number) ?? s.requestedSlides,
        }));
        break;

      case "outline_complete": {
        const outline = (data?.outline as Outline) ?? null;
        // Get actualSlides from SSE event (what AI actually generated)
        const actualFromEvent = (data?.actualSlides as number) ?? outline?.slides?.length ?? 0;
        setState((s) => ({
          ...s,
          outline,
          progress: data?.progress ?? 10,
          currentStage: "Outline klar, genererer slides...",
          // Set authoritative total from actualSlides (what AI generated)
          totalSlides: actualFromEvent || s.totalSlides,
          actualSlides: actualFromEvent || s.actualSlides,
        }));
        break;
      }

      case "deck_created":
        // Deck is ready for live viewing - store ID for redirect
        setState((s) => ({
          ...s,
          liveDeckId: (data?.deckId as string) ?? null,
          outline: (data?.outline as Outline) ?? s.outline,
          currentStage: "Deck opprettet, starter slides...",
        }));
        break;

      case "slide_started":
        setState((s) => {
          // Use actualSlides from SSE event or existing state
          const actualFromEvent = (data?.actualSlides as number) ?? s.actualSlides;
          const newTotal = actualFromEvent || s.totalSlides;
          return {
            ...s,
            progress: data?.progress ?? s.progress,
            totalSlides: newTotal,
            actualSlides: actualFromEvent || s.actualSlides,
            currentStage: `Genererer slide ${(data?.slideIndex ?? 0) + 1} av ${newTotal || "?"}...`,
            // Initialize streaming slide state
            streamingSlide: {
              slideIndex: data?.slideIndex ?? 0,
              blocks: [],
              isStreaming: true,
            },
          };
        });
        break;

      case "block_started":
        setState((s) => {
          if (!s.streamingSlide) {
            // Initialize if slide_started wasn't received
            return {
              ...s,
              streamingSlide: {
                slideIndex: data?.slideIndex ?? 0,
                blocks: [{
                  kind: (data?.blockKind as BlockKind) ?? "text",
                  text: data?.delta ?? "",
                  isComplete: false,
                }],
                isStreaming: true,
              },
            };
          }
          return {
            ...s,
            streamingSlide: {
              ...s.streamingSlide,
              blocks: [...s.streamingSlide.blocks, {
                kind: (data?.blockKind as BlockKind) ?? "text",
                text: data?.delta ?? "",
                isComplete: false,
              }],
            },
          };
        });
        break;

      case "block_delta":
        setState((s) => {
          if (!s.streamingSlide) return s;

          const blockIndex = data?.blockIndex ?? s.streamingSlide.blocks.length - 1;
          const blocks = [...s.streamingSlide.blocks];

          if (blocks[blockIndex]) {
            blocks[blockIndex] = {
              ...blocks[blockIndex],
              text: blocks[blockIndex].text + (data?.delta ?? ""),
            };
          }

          return {
            ...s,
            streamingSlide: {
              ...s.streamingSlide,
              blocks,
            },
          };
        });
        break;

      case "block_complete":
        setState((s) => {
          if (!s.streamingSlide) return s;

          const blockIndex = data?.blockIndex ?? s.streamingSlide.blocks.length - 1;
          const blocks = [...s.streamingSlide.blocks];

          if (blocks[blockIndex]) {
            blocks[blockIndex] = {
              ...blocks[blockIndex],
              isComplete: true,
            };
          }

          return {
            ...s,
            streamingSlide: {
              ...s.streamingSlide,
              blocks,
            },
          };
        });
        break;

      case "slide_content":
        setState((s) => {
          const newSlide = data?.slide as Slide | undefined;
          const newSlides = newSlide ? [...s.slides, newSlide] : s.slides;
          // Use actualSlides as authoritative total
          const actualFromEvent = (data?.actualSlides as number) ?? s.actualSlides;
          const total = actualFromEvent || s.totalSlides || "?";

          return {
            ...s,
            slides: newSlides,
            progress: data?.progress ?? s.progress,
            actualSlides: actualFromEvent || s.actualSlides,
            currentStage: `Slide ${(data?.slideIndex ?? 0) + 1} av ${total} ferdig`,
            // Clear streaming state when slide is complete
            streamingSlide: null,
          };
        });
        break;

      case "slide_validated":
        setState((s) => ({
          ...s,
          progress: data?.progress ?? s.progress,
          currentStage: "Validerer innhold...",
        }));
        break;

      case "generation_complete":
        setState((s) => ({
          ...s,
          status: "complete",
          progress: 100,
          currentStage: "Ferdig!",
          deck: (data?.deck as Deck) ?? null,
          // Set final actualSlides from completed deck
          actualSlides: (data?.actualSlides as number) ?? s.actualSlides,
          totalSlides: (data?.totalSlides as number) ?? s.totalSlides,
          // Reset image generation state
          isGeneratingImages: false,
          // Also extract deckId/viewUrl for immediate completion case
          result: data?.deckId
            ? { deckId: data.deckId as string, viewUrl: data.viewUrl as string }
            : s.result,
        }));
        break;

      case "generation_failed":
        setState((s) => ({
          ...s,
          status: "failed",
          error: data?.error ?? { code: "UNKNOWN", message: "En feil oppstod" },
        }));
        break;

      // Image generation events
      case "image_started":
        setState((s) => ({
          ...s,
          isGeneratingImages: true,
          totalImages: (data?.totalImages as number) ?? 0,
          currentImageIndex: 0,
          currentStage: "Genererer bilder...",
        }));
        break;

      case "image_progress": {
        const imageUrl = data?.imageUrl as string | undefined;
        const slideIdx = data?.slideIndex as number | undefined;

        setState((s) => {
          const totalImgs = (data?.totalImages as number) ?? s.totalImages;
          const currentImg = (data?.imageIndex as number) ?? s.currentImageIndex + 1;

          const newGeneratedImages = { ...s.generatedImages };
          // Only count as new completion if we have a URL and haven't already recorded this slide
          const isNewCompletion = imageUrl && slideIdx !== undefined && !s.generatedImages[slideIdx];

          if (imageUrl && slideIdx !== undefined) {
            newGeneratedImages[slideIdx] = imageUrl;
          }

          // Calculate actual completed count for display
          const newImagesCompleted = isNewCompletion ? s.imagesCompleted + 1 : s.imagesCompleted;

          // Show completed count for cleaner UX (avoids confusing "X av Y" during retries)
          const stageText = newImagesCompleted > 0
            ? `${newImagesCompleted} bilder generert...`
            : "Genererer bilder...";

          return {
            ...s,
            isGeneratingImages: true,
            totalImages: totalImgs,
            currentImageIndex: currentImg,
            generatedImages: newGeneratedImages,
            // Count actual completions (when imageUrl is provided for a new slide)
            imagesCompleted: newImagesCompleted,
            progress: data?.progress ?? s.progress,
            currentStage: stageText,
          };
        });
        break;
      }

      case "image_complete": {
        const imageUrl = data?.imageUrl as string | undefined;
        const slideIdx = data?.slideIndex as number | undefined;

        setState((s) => {
          const newGeneratedImages = { ...s.generatedImages };
          // Only count as new completion if we haven't already recorded this slide's image
          const isNewCompletion = imageUrl && slideIdx !== undefined && !s.generatedImages[slideIdx];

          if (imageUrl && slideIdx !== undefined) {
            newGeneratedImages[slideIdx] = imageUrl;
          }

          return {
            ...s,
            generatedImages: newGeneratedImages,
            // Only increment imagesCompleted for genuinely new image completions
            imagesCompleted: isNewCompletion ? s.imagesCompleted + 1 : s.imagesCompleted,
            currentStage: "Bilde ferdig",
          };
        });
        break;
      }
    }
  }, []);

  // Initial status check - fetch current job state in case deck already exists
  // This handles the race condition where deck_created SSE event was missed
  useEffect(() => {
    if (!generationId) return;

    const checkInitialStatus = async () => {
      try {
        const res = await fetch(`/api/generations/${generationId}`);
        if (!res.ok) return;

        const job = await res.json();

        // If deckId is already set, update state immediately for redirect
        if (job.deckId) {
          console.log(`[useGenerationStream] Found existing deckId on job: ${job.deckId}`);
          setState((s) => ({
            ...s,
            liveDeckId: s.liveDeckId ?? job.deckId, // Don't overwrite if already set
          }));
        }
      } catch (err) {
        console.warn("Failed to check initial generation status:", err);
      }
    };

    checkInitialStatus();
  }, [generationId]);

  // Main SSE connection effect
  useEffect(() => {
    if (!generationId) {
      setState(initialState);
      return;
    }

    // Clean up any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setState((s) => ({ ...s, status: "connecting" }));

    const connectSSE = () => {
      const eventSource = new EventSource(
        `/api/generations/${generationId}/stream`
      );
      eventSourceRef.current = eventSource;

      // Generic message handler for all event types
      const eventTypes: StreamEventType[] = [
        "connected",
        "generation_started",
        "outline_complete",
        "deck_created",
        "slide_started",
        "slide_content",
        "slide_validated",
        "generation_complete",
        "generation_failed",
        // Character-level streaming events
        "block_started",
        "block_delta",
        "block_complete",
        // Image generation events
        "image_started",
        "image_progress",
        "image_complete",
      ];

      eventTypes.forEach((eventType) => {
        eventSource.addEventListener(eventType, (e: MessageEvent) => {
          try {
            const event: StreamEvent = JSON.parse(e.data);
            handleEvent(event);

            // Reset reconnect attempts on successful message
            reconnectAttemptsRef.current = 0;

            // Close on terminal states
            if (
              eventType === "generation_complete" ||
              eventType === "generation_failed"
            ) {
              eventSource.close();
              eventSourceRef.current = null;
            }
          } catch (err) {
            console.error(`Failed to parse ${eventType} event:`, err);
          }
        });
      });

      eventSource.onerror = (err) => {
        console.warn("SSE connection error:", err);

        eventSource.close();
        eventSourceRef.current = null;

        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(
            `SSE reconnect attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`
          );

          // Exponential backoff
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current - 1),
            10000
          );
          setTimeout(connectSSE, delay);
        } else if (enablePollingFallback) {
          console.log("SSE failed, falling back to polling");
          setState((s) => ({
            ...s,
            currentStage: "Bruker alternativ tilkobling...",
          }));
          startPolling(generationId);
        } else {
          setState((s) => ({
            ...s,
            status: "failed",
            error: {
              code: "CONNECTION_FAILED",
              message: "Kunne ikke koble til serveren",
            },
          }));
        }
      };
    };

    connectSSE();

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [
    generationId,
    handleEvent,
    startPolling,
    enablePollingFallback,
    maxReconnectAttempts,
  ]);

  return {
    ...state,
    reset,
    /** Whether the generation is in progress */
    isGenerating: state.status === "connecting" || state.status === "streaming",
    /** Whether the generation completed successfully */
    isComplete: state.status === "complete",
    /** Whether the generation failed */
    isFailed: state.status === "failed",
  };
}
