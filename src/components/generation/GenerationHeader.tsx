"use client";

/**
 * GenerationHeader Component
 *
 * Fixed header shown during AI generation with pulsing animation.
 * Creates the "magic moment" feel with sparkles and progress.
 */

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface GenerationHeaderProps {
  progress: number;
  currentStage: string;
  slidesGenerated: number;
  totalSlides: number;
  /** Whether currently generating images */
  isGeneratingImages?: boolean;
  /** Current image index (1-based) - actual images completed */
  currentImageIndex?: number;
  /** Total number of images being generated (actual slides with images, not callbacks) */
  totalImages?: number;
  /** Number of images that have completed successfully */
  imagesCompleted?: number;
}

export function GenerationHeader({
  progress,
  currentStage,
  slidesGenerated,
  totalSlides,
  isGeneratingImages = false,
  currentImageIndex = 0,
  totalImages = 0,
  imagesCompleted = 0,
}: GenerationHeaderProps) {
  // Determine what to show in the progress display
  // For images: Show simple "Generating images..." with count of completed
  // This avoids confusion from inflated totalImages during retries
  const showImageProgress = isGeneratingImages;

  // Use imagesCompleted if provided, otherwise fall back to a simpler display
  const imageProgressLabel = imagesCompleted > 0
    ? `${imagesCompleted} bilder generert`
    : "Genererer bilder...";

  const progressLabel = showImageProgress
    ? imageProgressLabel
    : `${slidesGenerated} / ${totalSlides} slides`;
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-lg"
    >
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: AI Generating message */}
          <div className="flex items-center gap-3">
            {/* Pulsing sparkle icon */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <Sparkles className="w-5 h-5" />
              {/* Glow effect */}
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 blur-md bg-white/30 rounded-full"
              />
            </motion.div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">AI Generating</span>
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-white/70 text-sm"
                >
                  Ikke lukk denne fanen...
                </motion.span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">{currentStage}</p>
            </div>
          </div>

          {/* Right: Progress info */}
          <div className="flex items-center gap-4">
            {/* Slide/Image count */}
            <div className="text-right">
              <div className="text-sm font-medium">
                {progressLabel}
              </div>
              <div className="text-xs text-white/70">
                {Math.round(progress)}% ferdig
              </div>
            </div>

            {/* Circular progress indicator */}
            <div className="relative w-10 h-10">
              <svg className="w-full h-full -rotate-90">
                {/* Background circle */}
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={100.53}
                  initial={{ strokeDashoffset: 100.53 }}
                  animate={{ strokeDashoffset: 100.53 - (progress / 100) * 100.53 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </svg>
              {/* Center sparkle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4 text-white/80" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/80"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
