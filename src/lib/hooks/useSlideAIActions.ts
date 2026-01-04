/**
 * useSlideAIActions Hook
 *
 * React hook for performing AI-driven slide editing actions.
 * Integrates with the EditorProvider for state updates.
 */

import { useState, useCallback } from "react";
import { useEditor } from "@/components/editor/EditorProvider";
import type { Slide } from "@/lib/schemas/slide";

interface AIActionResult {
  success: boolean;
  slides?: Slide[];
  error?: {
    code: string;
    message: string;
  };
}

interface UseSlideAIActionsReturn {
  /** Shorten the slide content to fit constraints */
  shorten: () => Promise<boolean>;
  /** Split the slide into multiple slides */
  split: () => Promise<boolean>;
  /** Whether an AI action is in progress */
  isLoading: boolean;
  /** Current action type being performed */
  currentAction: "shorten" | "split" | null;
  /** Error message if the last action failed */
  error: string | null;
  /** Clear the current error */
  clearError: () => void;
}

/**
 * Hook for AI-driven slide editing actions.
 *
 * @param deckId - The deck ID for API calls
 * @param slideIndex - The index of the slide to perform actions on
 */
export function useSlideAIActions(
  deckId: string,
  slideIndex: number
): UseSlideAIActionsReturn {
  const { actions } = useEditor();
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<"shorten" | "split" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const performAction = useCallback(
    async (action: "shorten" | "split"): Promise<boolean> => {
      setIsLoading(true);
      setCurrentAction(action);
      setError(null);

      try {
        const response = await fetch(`/api/decks/${deckId}/ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, slideIndex }),
        });

        const result: AIActionResult = await response.json();

        if (!result.success || !result.slides) {
          setError(result.error?.message ?? "AI-handling feilet");
          return false;
        }

        // Stop any current editing before applying AI changes
        actions.stopEditing();

        if (action === "shorten") {
          // Replace the slide with the shortened version
          if (result.slides.length === 1) {
            actions.aiReplaceSlide(slideIndex, result.slides[0]);
          }
        } else if (action === "split") {
          // Replace the slide with multiple slides
          actions.aiSplitSlide(slideIndex, result.slides);
        }

        return true;
      } catch (err) {
        console.error("AI action error:", err);
        setError("Kunne ikke utføre AI-handling");
        return false;
      } finally {
        setIsLoading(false);
        setCurrentAction(null);
      }
    },
    [deckId, slideIndex, actions]
  );

  const shorten = useCallback(async (): Promise<boolean> => {
    return performAction("shorten");
  }, [performAction]);

  const split = useCallback(async (): Promise<boolean> => {
    return performAction("split");
  }, [performAction]);

  return {
    shorten,
    split,
    isLoading,
    currentAction,
    error,
    clearError,
  };
}
