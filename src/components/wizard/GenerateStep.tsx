"use client";

/**
 * GenerateStep
 *
 * Third step - minimal loading state that redirects to editor immediately.
 * Shows spinner while waiting for deck to be created, then redirects.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui";
import { ErrorDisplay } from "@/components/editor/ErrorDisplay";
import { useGenerationStream } from "@/hooks/useGenerationStream";
import type { Outline } from "@/lib/schemas/slide";
import type { ThemeId } from "@/lib/themes";
import { Sparkles } from "lucide-react";

interface GenerateStepProps {
  /** The generation job ID to stream */
  generationId: string | null;
  /** Initial outline (for preview reference) */
  outline: Outline | null;
  /** Theme ID for slide preview */
  themeId?: ThemeId;
  /** Go back to previous step */
  onBack: () => void;
  /** Retry generation */
  onRetry: () => void;
}

export function GenerateStep({ generationId, outline, onBack, onRetry }: GenerateStepProps) {
  const router = useRouter();

  // Use streaming hook - only need liveDeckId for redirect
  const { status, error, isFailed, liveDeckId, result, isComplete } =
    useGenerationStream(generationId);

  // Redirect to deck editor when deck is created (with small delay for better UX)
  useEffect(() => {
    if (liveDeckId && !isFailed) {
      // Small delay so user sees the loading state before redirect
      // Editor takes a moment to load anyway, so this feels smoother
      const timer = setTimeout(() => {
        router.push(`/deck/${liveDeckId}?generating=${generationId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [liveDeckId, generationId, isFailed, router]);

  // Fallback: Redirect when complete (if we never got liveDeckId)
  useEffect(() => {
    if (isComplete && !liveDeckId) {
      let targetDeckId: string | null = null;

      if (result?.deckId) {
        targetDeckId = result.deckId;
      } else if (result?.viewUrl) {
        const urlParts = result.viewUrl.split("/");
        targetDeckId = urlParts[urlParts.length - 1];
      }

      if (targetDeckId) {
        router.push(`/deck/${targetDeckId}?generating=${generationId}`);
      }
    }
  }, [isComplete, liveDeckId, result, generationId, router]);

  // Failed state - show user-friendly error with recovery actions
  if (isFailed) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={onRetry}
        onBack={onBack}
        showTechnical={process.env.NODE_ENV === "development"}
      />
    );
  }

  // Loading state - simple spinner with message
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Animated icon with bouncy side-to-side movement */}
        <div className="relative mb-6 h-24">
          {/* Track/path indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-20 rounded-full border-2 border-emerald-200 bg-emerald-50/50" />

          {/* Bouncing circle */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 left-1/2"
            animate={{
              x: [-60, 60, -60],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{
              x: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
              scale: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            style={{ marginLeft: -40 }}
          >
            <div className="relative">
              {/* Main circle */}
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
              </motion.div>

              {/* Pulsing ring that follows */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald-400"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">Starter generering...</h2>
        <p className="text-gray-500 mb-4">
          {status === "connecting" ? "Kobler til server..." : "Forbereder presentasjonen din"}
        </p>

        {/* Slide count hint */}
        {outline && (
          <p className="text-sm text-gray-400">{outline.slides.length} slides vil bli generert</p>
        )}

        {/* Simple loading indicator */}
        <div className="mt-6">
          <LoadingSpinner size="sm" label="Starter generering" />
        </div>
      </motion.div>
    </div>
  );
}
