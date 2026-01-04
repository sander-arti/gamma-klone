/**
 * LivePreview Component
 *
 * Displays slides as they're generated in real-time with smooth animations.
 * Shows a progress bar and grid of slides that "pop in" as they're ready.
 * Enhanced with skeleton loading states and shimmer effects.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SlideCanvas } from "@/components/viewer/SlideCanvas";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { ThemeProvider } from "@/components/viewer/ThemeProvider";
import { GeneratingIndicator, StreamingSlidePreview } from "@/components/generation";
import type { Slide, Outline } from "@/lib/schemas/slide";
import type { ThemeId } from "@/lib/themes";
import type { StreamingSlideState } from "@/hooks/useGenerationStream";

interface LivePreviewProps {
  slides: Slide[];
  outline: Outline | null;
  progress: number;
  currentStage: string;
  themeId?: ThemeId;
  /** Total expected slides (from outline) */
  totalSlides?: number;
  /** Show generating indicator */
  isGenerating?: boolean;
  /** Currently streaming slide (character-by-character) */
  streamingSlide?: StreamingSlideState | null;
}

export function LivePreview({
  slides,
  outline,
  progress,
  currentStage,
  themeId = "nordic_light",
  totalSlides,
  isGenerating = false,
  streamingSlide,
}: LivePreviewProps) {
  // Calculate expected total from outline if available
  const expectedTotal = totalSlides ?? outline?.slides?.length ?? slides.length;
  const slidesRemaining = Math.max(0, expectedTotal - slides.length);

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">{currentStage || "Starter..."}</span>
          <span className="font-mono text-muted-foreground">{Math.round(progress)}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            {slides.length} av {expectedTotal} slides ferdig
          </span>
          {outline && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Outline klar
            </span>
          )}
        </div>
      </div>

      {/* Slide grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {/* Generated slides */}
          {slides.map((slide, index) => {
            const isLatest = index === slides.length - 1 && isGenerating;
            return (
              <motion.div
                key={`slide-${index}`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.175, 0.885, 0.32, 1.275], // Spring easing
                  delay: 0.05,
                }}
                className="relative group"
              >
                {/* Glow ring for latest slide during generation */}
                {isLatest && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-xl blur-sm"
                  />
                )}

                <div
                  className={`
                  relative aspect-video rounded-lg overflow-hidden shadow-lg
                  ${isLatest ? "ring-2 ring-emerald-500" : "ring-1 ring-black/5"}
                `}
                >
                  <ThemeProvider themeId={themeId}>
                    <SlideCanvas>
                      <SlideRenderer slide={slide} slideIndex={index} />
                    </SlideCanvas>
                  </ThemeProvider>
                </div>

                {/* Slide number badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                  {index + 1}
                </div>

                {/* NEW badge for latest slide */}
                {isLatest && (
                  <div className="absolute top-2 right-2">
                    <GeneratingIndicator label="Ny" size="sm" />
                  </div>
                )}

                {/* Slide type badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-white/80 backdrop-blur-sm text-muted-foreground text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatSlideType(slide.type)}
                </div>
              </motion.div>
            );
          })}

          {/* Streaming slide with real-time typing effect */}
          {streamingSlide?.isStreaming && (
            <motion.div
              key="streaming-slide"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative"
            >
              {/* Animated glow border */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-xl blur-sm"
              />

              <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg ring-2 ring-emerald-500 bg-white">
                <ThemeProvider themeId={themeId}>
                  <StreamingSlidePreview
                    blocks={streamingSlide.blocks}
                    slideIndex={streamingSlide.slideIndex}
                  />
                </ThemeProvider>
              </div>

              {/* Slide number badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                {streamingSlide.slideIndex + 1}
              </div>

              {/* Live badge */}
              <div className="absolute top-2 right-2">
                <GeneratingIndicator label="Live" size="sm" />
              </div>
            </motion.div>
          )}

          {/* Skeleton placeholder with shimmer for next slide (only if not streaming) */}
          {isGenerating && !streamingSlide?.isStreaming && slidesRemaining > 0 && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-dashed border-gray-200"
            >
              {/* Shimmer effect */}
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              />

              {/* Skeleton content */}
              <div className="absolute inset-4 flex flex-col gap-2">
                <div className="h-3 w-3/4 rounded bg-gray-200" />
                <div className="h-2 w-1/2 rounded bg-gray-200" />
                <div className="flex-1 flex gap-2 mt-2">
                  <div className="flex-1 rounded bg-gray-200" />
                  <div className="flex-1 rounded bg-gray-200" />
                </div>
              </div>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                </motion.div>
                <span className="text-xs text-gray-500 font-medium">
                  Slide {slides.length + 1} kommer...
                </span>
              </div>
            </motion.div>
          )}

          {/* Empty state when no slides yet */}
          {slides.length === 0 && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full aspect-video max-w-md mx-auto rounded-lg bg-muted/30 border-2 border-dashed border-muted-foreground/10 flex items-center justify-center"
            >
              <p className="text-sm text-muted-foreground">Venter på generering...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Outline preview (collapsible) */}
      {outline && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            Se outline ({outline.slides.length} slides planlagt)
          </summary>
          <div className="mt-3 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">{outline.title}</h4>
            <ol className="space-y-1 text-sm text-muted-foreground">
              {outline.slides.map((outlineSlide, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-5 text-right font-mono text-xs">{index + 1}.</span>
                  <span className={index < slides.length ? "line-through opacity-50" : ""}>
                    {outlineSlide.title}
                  </span>
                  {index < slides.length && <span className="text-green-600 text-xs">✓</span>}
                </li>
              ))}
            </ol>
          </div>
        </details>
      )}
    </div>
  );
}

/**
 * Format slide type for display
 */
function formatSlideType(type: string): string {
  const typeMap: Record<string, string> = {
    cover: "Cover",
    agenda: "Agenda",
    section_header: "Seksjon",
    bullets: "Punkter",
    two_column_text: "To kolonner",
    text_plus_image: "Tekst + bilde",
    decisions_list: "Beslutninger",
    action_items_table: "Handlinger",
    summary_next_steps: "Oppsummering",
    quote_callout: "Sitat",
  };
  return typeMap[type] ?? type;
}
