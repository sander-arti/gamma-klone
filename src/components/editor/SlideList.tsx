"use client";

/**
 * SlideList
 *
 * Left panel showing slide thumbnails with drag-and-drop reordering.
 * Shows actual scaled-down slide previews instead of just labels.
 * Includes AI action buttons for slides with constraint violations.
 */

import { useState, useCallback, useMemo } from "react";
import { useEditor } from "./EditorProvider";
import { Button } from "@/components/ui";
import { AIActionsMenu } from "./AIActionsMenu";
import { ThemeProvider } from "@/components/viewer";
import { SlideRenderer } from "@/components/slides";
import type { Slide } from "@/lib/schemas/slide";
import type { ThemeId } from "@/lib/schemas/deck";
import { validateBlock } from "@/lib/editor/constraints";

interface SlideListProps {
  className?: string;
  deckId?: string;
}

export function SlideList({ className = "", deckId }: SlideListProps) {
  const { state, actions } = useEditor();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Calculate which slides have violations
  const slideViolations = useMemo(() => {
    return state.deck.slides.map((slide, slideIndex) => {
      let hasViolations = false;
      for (let blockIndex = 0; blockIndex < slide.blocks.length; blockIndex++) {
        const violations = validateBlock(slide.blocks[blockIndex], slideIndex, blockIndex);
        if (violations.length > 0) {
          hasViolations = true;
          break;
        }
      }
      return hasViolations;
    });
  }, [state.deck.slides]);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggedIndex !== null && draggedIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [draggedIndex]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== dropIndex) {
        actions.reorderSlides(draggedIndex, dropIndex);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, actions]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleAddSlide = useCallback(() => {
    const newSlide: Slide = {
      type: "bullets",
      layoutVariant: "default",
      blocks: [
        { kind: "title", text: "Ny slide" },
        { kind: "bullets", items: ["Punkt 1", "Punkt 2", "Punkt 3"] },
      ],
    };
    actions.addSlide(newSlide);
  }, [actions]);

  const handleDuplicateSlide = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      actions.duplicateSlide(index);
    },
    [actions]
  );

  const handleDeleteSlide = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (state.deck.slides.length > 1) {
        actions.deleteSlide(index);
      }
    },
    [actions, state.deck.slides.length]
  );

  // Thumbnail dimensions: We render a full slide (960x540) and scale it down
  // to fit inside the thumbnail container (approx 180px wide in the w-56 panel)
  const SLIDE_WIDTH = 960;
  const SLIDE_HEIGHT = 540;
  const THUMBNAIL_WIDTH = 176; // Slightly less than w-56 (224px) to account for padding
  const SCALE_FACTOR = THUMBNAIL_WIDTH / SLIDE_WIDTH;

  // Get theme info from deck
  const themeId = state.deck.deck.themeId as ThemeId;
  const brandKit = state.deck.deck.brandKit;

  return (
    <aside className={`bg-[#faf8f5] border-r border-[#e5e2dd] flex flex-col ${className}`}>
      {/* Header - ARTI Premium */}
      <div className="px-4 py-3 border-b border-[#e5e2dd]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">
            Slides <span className="text-gray-400">({state.deck.slides.length})</span>
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddSlide}
            className="!text-gray-400 hover:!text-gray-600 hover:!bg-[#f0ede8] !p-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Slide thumbnails - ARTI Premium */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {state.deck.slides.map((slide, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => actions.selectSlide(index)}
            className={`
              group relative rounded-xl cursor-pointer transition-all duration-200
              ${
                index === state.selectedSlideIndex
                  ? "ring-2 ring-emerald-500/70 ring-offset-2 ring-offset-[#faf8f5]"
                  : dragOverIndex === index
                    ? "ring-2 ring-emerald-400/50 bg-emerald-500/10"
                    : "hover:ring-1 hover:ring-gray-300"
              }
              ${draggedIndex === index ? "opacity-50 scale-95" : ""}
            `}
          >
            {/* Thumbnail preview - actual slide scaled down */}
            <div
              className="aspect-video bg-white rounded-xl overflow-hidden relative shadow-md shadow-gray-200/50"
              style={{
                width: THUMBNAIL_WIDTH,
                height: THUMBNAIL_WIDTH * (9 / 16),
              }}
            >
              {/* Scaled slide container */}
              <div
                style={{
                  width: SLIDE_WIDTH,
                  height: SLIDE_HEIGHT,
                  transform: `scale(${SCALE_FACTOR})`,
                  transformOrigin: "top left",
                  pointerEvents: "none", // Disable interactions in thumbnail
                }}
              >
                <ThemeProvider themeId={themeId} brandKit={brandKit}>
                  <SlideRenderer slide={slide} editable={false} slideIndex={index} />
                </ThemeProvider>
              </div>

              {/* Slide number badge - ARTI Premium */}
              <div className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur-sm text-gray-600 text-[10px] px-1.5 py-0.5 rounded-md font-medium shadow-sm">
                {index + 1}
              </div>

              {/* Selected glow overlay */}
              {index === state.selectedSlideIndex && (
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
              )}
            </div>

            {/* Violation indicator - ARTI Premium */}
            {slideViolations[index] && (
              <div
                className="absolute top-1.5 left-1.5 p-1 bg-red-50 backdrop-blur-sm rounded-lg border border-red-200"
                title="Denne sliden har feil"
              >
                <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            {/* Actions (visible on hover) - ARTI Premium */}
            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
              {/* AI Actions (only shown when deckId is available and slide has violations) */}
              {deckId && slideViolations[index] && (
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-100">
                  <AIActionsMenu deckId={deckId} slideIndex={index} />
                </div>
              )}
              <button
                onClick={(e) => handleDuplicateSlide(index, e)}
                className="p-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                title="Dupliser"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              {state.deck.slides.length > 1 && (
                <button
                  onClick={(e) => handleDeleteSlide(index, e)}
                  className="p-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Slett"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Drag handle indicator - ARTI Premium */}
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 text-gray-400 transition-opacity">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Add slide button at bottom - ARTI Premium */}
      <div className="p-3 border-t border-[#e5e2dd]">
        <Button
          variant="secondary"
          size="sm"
          className="w-full !bg-white !border-[#e5e2dd] !text-gray-600 hover:!bg-[#f5f3f0] hover:!text-gray-800 hover:!border-[#d5d2cd]"
          onClick={handleAddSlide}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Ny slide
        </Button>
      </div>
    </aside>
  );
}
