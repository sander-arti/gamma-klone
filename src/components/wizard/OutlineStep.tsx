"use client";

/**
 * OutlineStep
 *
 * Second step - review and edit the generated outline.
 * Supports reordering via drag and drop.
 */

import { useState, useCallback, useEffect } from "react";
import { Button, LoadingSpinner } from "@/components/ui";
import type { Outline, OutlineSlide } from "@/lib/schemas/slide";

interface OutlineStepProps {
  outline: Outline | null;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onNext: (outline: Outline) => void;
  onRegenerate: () => void;
}

export function OutlineStep({
  outline,
  isLoading,
  error,
  onBack,
  onNext,
  onRegenerate,
}: OutlineStepProps) {
  const [editedOutline, setEditedOutline] = useState<Outline | null>(outline);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Update editedOutline when outline prop changes
  useEffect(() => {
    if (outline) {
      setEditedOutline(outline);
    }
  }, [outline]);

  const handleTitleChange = useCallback(
    (index: number, title: string) => {
      if (!editedOutline) return;
      const newSlides = [...editedOutline.slides];
      newSlides[index] = { ...newSlides[index], title };
      setEditedOutline({ ...editedOutline, slides: newSlides });
    },
    [editedOutline]
  );

  const handleDelete = useCallback(
    (index: number) => {
      if (!editedOutline || editedOutline.slides.length <= 1) return;
      const newSlides = editedOutline.slides.filter((_, i) => i !== index);
      setEditedOutline({ ...editedOutline, slides: newSlides });
    },
    [editedOutline]
  );

  const handleAdd = useCallback(() => {
    if (!editedOutline) return;
    const newSlide: OutlineSlide = { title: "Ny slide" };
    setEditedOutline({
      ...editedOutline,
      slides: [...editedOutline.slides, newSlide],
    });
  }, [editedOutline]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index || !editedOutline) return;

    const newSlides = [...editedOutline.slides];
    const [removed] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(index, 0, removed);
    setEditedOutline({ ...editedOutline, slides: newSlides });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = () => {
    if (editedOutline) {
      onNext(editedOutline);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner size="lg" label="Genererer outline" />
        <p className="mt-4 text-gray-600">Genererer outline...</p>
        <p className="text-sm text-gray-400 mt-2">Dette tar vanligvis 5-10 sekunder</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Kunne ikke generere outline</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onBack}>
            Tilbake
          </Button>
          <Button onClick={onRegenerate}>Prøv igjen</Button>
        </div>
      </div>
    );
  }

  if (!editedOutline) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tittel på presentasjonen
        </label>
        <input
          type="text"
          value={editedOutline.title}
          onChange={(e) => setEditedOutline({ ...editedOutline, title: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Slides list */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Slides ({editedOutline.slides.length})
          </label>
          <Button variant="ghost" size="sm" onClick={handleAdd}>
            + Legg til slide
          </Button>
        </div>

        <div className="space-y-2">
          {editedOutline.slides.map((slide, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                flex items-center gap-3 p-3 bg-white rounded-lg border
                ${draggedIndex === index ? "border-blue-500 shadow-lg" : "border-gray-200"}
                cursor-move transition-shadow hover:shadow-md
              `}
            >
              {/* Drag handle */}
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                </svg>
              </div>

              {/* Slide number */}
              <span className="text-sm text-gray-400 w-6">{index + 1}.</span>

              {/* Title input */}
              <input
                type="text"
                value={slide.title}
                onChange={(e) => handleTitleChange(index, e.target.value)}
                className="flex-1 px-2 py-1 border-0 focus:ring-0 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Suggested type badge */}
              {slide.suggestedType && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {slide.suggestedType}
                </span>
              )}

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                disabled={editedOutline.slides.length <= 1}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onBack}>
          Tilbake
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onRegenerate}>
            Regenerer outline
          </Button>
          <Button onClick={handleSubmit}>
            Generer presentasjon
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
