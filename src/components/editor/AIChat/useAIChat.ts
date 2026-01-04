"use client";

/**
 * useAIChat Hook
 *
 * Manages state and actions for the AI Chat panel.
 * Makes API calls to /api/decks/[id]/ai for server-side AI processing.
 */

import { useState, useCallback, useRef } from "react";
import type { Slide } from "@/lib/schemas/slide";
import type { SlideTransformResult } from "@/lib/ai/slide-agent";
import type { TransformationType } from "@/lib/ai/prompts/slide-transform";

// ============================================================================
// Types
// ============================================================================

export type AIChatStatus = "idle" | "loading" | "streaming" | "success" | "error";

export interface AIChatMessage {
  id: string;
  type: "user" | "assistant" | "error";
  content: string;
  timestamp: Date;
  /** For assistant messages, the transformation result */
  result?: SlideTransformResult;
}

export interface UseAIChatOptions {
  /** Current slide to transform */
  slide: Slide | null;
  /** Current slide index in the deck */
  slideIndex: number;
  /** Deck ID for API calls */
  deckId: string;
  /** Callback when transformation completes */
  onTransformComplete?: (result: SlideTransformResult) => void;
  /** Deck title for context */
  deckTitle?: string;
}

export interface UseAIChatResult {
  /** Current status */
  status: AIChatStatus;
  /** Chat messages */
  messages: AIChatMessage[];
  /** Current input value */
  input: string;
  /** Set input value */
  setInput: (value: string) => void;
  /** Submit custom instruction */
  submit: () => Promise<void>;
  /** Apply a quick action */
  applyQuickAction: (type: TransformationType) => Promise<void>;
  /** Generate a new image for the slide */
  generateImage: () => Promise<void>;
  /** Partial result during streaming */
  partialResult: Partial<SlideTransformResult> | null;
  /** Error message if any */
  error: string | null;
  /** Clear chat history */
  clearHistory: () => void;
  /** Cancel ongoing operation */
  cancel: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useAIChat(options: UseAIChatOptions): UseAIChatResult {
  const { slide, slideIndex, deckId, onTransformComplete, deckTitle } = options;

  const [status, setStatus] = useState<AIChatStatus>("idle");
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [partialResult, setPartialResult] = useState<Partial<SlideTransformResult> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track if we should cancel
  const cancelledRef = useRef(false);

  // Generate unique message ID
  const generateId = useCallback(() => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add message to history
  const addMessage = useCallback(
    (type: AIChatMessage["type"], content: string, result?: SlideTransformResult) => {
      const message: AIChatMessage = {
        id: generateId(),
        type,
        content,
        timestamp: new Date(),
        result,
      };
      setMessages((prev) => [...prev, message]);
      return message;
    },
    [generateId]
  );

  // Execute transformation via API
  const executeTransform = useCallback(
    async (instruction: string, isQuickAction = false) => {
      if (!slide) {
        setError("Ingen slide valgt");
        return;
      }

      cancelledRef.current = false;
      setStatus("loading");
      setError(null);
      setPartialResult(null);

      // Add user message
      if (!isQuickAction) {
        addMessage("user", instruction);
      }

      try {
        // Call the API route for server-side AI processing
        const response = await fetch(`/api/decks/${deckId}/ai`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "transform",
            slideIndex,
            instruction,
            deckTitle,
          }),
        });

        const data = await response.json();

        if (cancelledRef.current) return;

        if (!response.ok || !data.success) {
          const errorMessage = data.error?.message ?? "AI-transformasjon feilet";
          setStatus("error");
          setError(errorMessage);
          addMessage("error", `Feil: ${errorMessage}`);
          return;
        }

        // Build the result from API response
        const result: SlideTransformResult = {
          slide: data.slide,
          changes: data.changes ?? [],
          explanation: data.explanation ?? "Slide ble transformert",
        };

        setPartialResult(null);
        setStatus("success");

        // Add assistant message
        addMessage("assistant", result.explanation, result);

        // Notify parent
        onTransformComplete?.(result);
      } catch (err) {
        if (!cancelledRef.current) {
          const errorMessage = err instanceof Error ? err.message : "Nettverksfeil";
          setStatus("error");
          setError(errorMessage);
          addMessage("error", `Feil: ${errorMessage}`);
        }
      }
    },
    [slide, slideIndex, deckId, deckTitle, onTransformComplete, addMessage]
  );

  // Submit custom instruction
  const submit = useCallback(async () => {
    if (!input.trim()) return;

    const instruction = input.trim();
    setInput("");
    await executeTransform(instruction);
  }, [input, executeTransform]);

  // Apply quick action
  const applyQuickAction = useCallback(
    async (type: TransformationType) => {
      // Dynamic import
      const { getTransformInstruction } = await import("@/lib/ai/prompts/slide-transform");
      const instruction = getTransformInstruction(type);

      // Add a friendly user message for the quick action
      const friendlyNames: Record<TransformationType, string> = {
        simplify: "Forenkle innholdet",
        expand: "Utvid innholdet",
        professional: "Gjør mer profesjonelt",
        casual: "Gjør mer uformelt",
        visualize: "Gjør mer visuelt",
        translate_en: "Oversett til engelsk",
        translate_no: "Oversett til norsk",
      };
      addMessage("user", friendlyNames[type] || type);

      await executeTransform(instruction, true);
    },
    [executeTransform, addMessage]
  );

  // Generate new image for slide using DALL-E/Gemini
  const generateImage = useCallback(async () => {
    if (!slide) {
      setError("Ingen slide valgt");
      return;
    }

    // Check if slide has an image block
    const hasImageBlock = slide.blocks.some((b) => b.kind === "image");
    if (!hasImageBlock) {
      setError("Denne sliden har ikke en bilde-blokk");
      return;
    }

    cancelledRef.current = false;
    setStatus("loading");
    setError(null);
    setPartialResult(null);

    // Add user message
    addMessage("user", "Generer nytt bilde");

    try {
      // Call the API route for actual image generation
      const response = await fetch(`/api/decks/${deckId}/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate_image",
          slideIndex,
          deckTitle,
        }),
      });

      const data = await response.json();

      if (cancelledRef.current) return;

      if (!response.ok || !data.success) {
        const errorMessage = data.error?.message ?? "Kunne ikke generere bilde";
        setStatus("error");
        setError(errorMessage);
        addMessage("error", `Feil: ${errorMessage}`);
        return;
      }

      // Build the result from API response
      const result: SlideTransformResult = {
        slide: data.slide,
        changes: data.changes ?? [],
        explanation: data.explanation ?? "Nytt bilde ble generert",
      };

      setPartialResult(null);
      setStatus("success");

      // Add assistant message
      addMessage("assistant", result.explanation, result);

      // Notify parent
      onTransformComplete?.(result);
    } catch (err) {
      if (!cancelledRef.current) {
        const errorMessage = err instanceof Error ? err.message : "Nettverksfeil";
        setStatus("error");
        setError(errorMessage);
        addMessage("error", `Feil: ${errorMessage}`);
      }
    }
  }, [slide, slideIndex, deckId, deckTitle, onTransformComplete, addMessage]);

  // Clear history
  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
    setPartialResult(null);
    setStatus("idle");
  }, []);

  // Cancel ongoing operation
  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setStatus("idle");
    setPartialResult(null);
  }, []);

  return {
    status,
    messages,
    input,
    setInput,
    submit,
    applyQuickAction,
    generateImage,
    partialResult,
    error,
    clearHistory,
    cancel,
  };
}
