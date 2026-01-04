/**
 * DeckViewer Component
 *
 * Full presentation viewer with slide navigation, thumbnails,
 * and keyboard controls.
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Deck } from "@/lib/schemas/deck";
import type { ThemeId, BrandKitOverrides } from "@/lib/themes";
import { ThemeProvider } from "./ThemeProvider";
import { SlideCanvas } from "./SlideCanvas";
import { SlideRenderer } from "../slides";

interface DeckViewerProps {
  deck: Deck;
  themeId?: ThemeId;
  brandKit?: BrandKitOverrides;
  initialSlide?: number;
  showThumbnails?: boolean;
  showNavigation?: boolean;
  className?: string;
  onSlideChange?: (index: number) => void;
}

/**
 * DeckViewer provides a complete presentation viewing experience.
 *
 * Features:
 * - Thumbnail sidebar (optional)
 * - Previous/Next navigation buttons
 * - Keyboard navigation (Left/Right arrows, Home/End)
 * - Slide index display
 */
export function DeckViewer({
  deck,
  themeId = "nordic_light",
  brandKit,
  initialSlide = 0,
  showThumbnails = true,
  showNavigation = true,
  className = "",
  onSlideChange,
}: DeckViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(initialSlide, deck.slides.length - 1))
  );
  const [direction, setDirection] = useState(0);
  const prevIndexRef = useRef(currentIndex);

  const currentSlide = deck.slides[currentIndex];
  const totalSlides = deck.slides.length;

  // Slide transition variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  // Navigation handlers
  const goToSlide = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, totalSlides - 1));
      const dir = clampedIndex > prevIndexRef.current ? 1 : -1;
      setDirection(dir);
      prevIndexRef.current = clampedIndex;
      setCurrentIndex(clampedIndex);
      onSlideChange?.(clampedIndex);
    },
    [totalSlides, onSlideChange]
  );

  const goToPrevious = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const goToFirst = useCallback(() => {
    goToSlide(0);
  }, [goToSlide]);

  const goToLast = useCallback(() => {
    goToSlide(totalSlides - 1);
  }, [totalSlides, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
        case "ArrowDown":
        case " ": // Space
          e.preventDefault();
          goToNext();
          break;
        case "Home":
          e.preventDefault();
          goToFirst();
          break;
        case "End":
          e.preventDefault();
          goToLast();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext, goToFirst, goToLast]);

  return (
    <ThemeProvider themeId={themeId} brandKit={brandKit}>
      <div className={`flex h-full ${className}`}>
        {/* Thumbnail sidebar */}
        {showThumbnails && (
          <div className="w-48 flex-shrink-0 border-r border-[var(--theme-color-border)] bg-[var(--theme-color-background-subtle)] overflow-y-auto">
            <div className="p-2 space-y-2">
              {deck.slides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-full aspect-video rounded border-2 transition-all overflow-hidden ${
                    index === currentIndex
                      ? "border-[var(--theme-color-primary)] ring-2 ring-[var(--theme-color-primary)] ring-opacity-30"
                      : "border-[var(--theme-color-border-subtle)] hover:border-[var(--theme-color-border)]"
                  }`}
                >
                  {/* Mini slide preview */}
                  <div className="w-full h-full scale-[0.15] origin-top-left pointer-events-none">
                    <div
                      style={{ width: "1280px", height: "720px" }}
                      className="bg-[var(--theme-color-background)]"
                    >
                      <SlideRenderer slide={slide} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Slide canvas */}
          <div className="flex-1 p-4 min-h-0">
            <SlideCanvas className="shadow-lg rounded-lg overflow-hidden">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.25,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="w-full h-full"
                >
                  {currentSlide && <SlideRenderer slide={currentSlide} />}
                </motion.div>
              </AnimatePresence>
            </SlideCanvas>
          </div>

          {/* Navigation bar */}
          {showNavigation && (
            <div className="flex-shrink-0 px-4 py-3 border-t border-[var(--theme-color-border)] bg-[var(--theme-color-background-subtle)]">
              <div className="flex items-center justify-between max-w-xl mx-auto">
                {/* Previous button */}
                <button
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--theme-color-secondary)] text-[var(--theme-color-secondary-foreground)] hover:opacity-80"
                >
                  Previous
                </button>

                {/* Slide counter */}
                <span className="text-[var(--theme-color-foreground-muted)] text-sm font-medium">
                  {currentIndex + 1} / {totalSlides}
                </span>

                {/* Next button */}
                <button
                  onClick={goToNext}
                  disabled={currentIndex === totalSlides - 1}
                  className="px-4 py-2 rounded font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--theme-color-primary)] text-[var(--theme-color-primary-foreground)] hover:opacity-80"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
