"use client";

/**
 * ContentPreview Component
 *
 * Middle panel in Prompt Editor showing the outline/content preview.
 * Supports freeform and card-by-card view modes.
 */

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  LayoutGrid,
  AlignLeft,
  GripVertical,
  Edit2,
  Trash2,
  Plus,
  ChevronRight,
  List,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { Outline, OutlineSlide } from "@/lib/schemas/slide";

type ViewMode = "freeform" | "cards";

interface ContentPreviewProps {
  /** The outline to display */
  outline: Outline | null;
  /** Original input text (for freeform view) */
  inputText?: string;
  /** Called when slides are reordered */
  onReorder?: (slides: OutlineSlide[]) => void;
  /** Called when a slide title is edited */
  onEditSlide?: (index: number, newTitle: string) => void;
  /** Called when a slide is deleted */
  onDeleteSlide?: (index: number) => void;
  /** Called when adding a new slide */
  onAddSlide?: () => void;
  /** Called when user wants to generate outline (optional feature) */
  onGenerateOutline?: () => void;
  /** Whether outline is being generated */
  isGeneratingOutline?: boolean;
  /** Whether editing is disabled */
  disabled?: boolean;
}

export function ContentPreview({
  outline,
  inputText,
  onReorder,
  onEditSlide,
  onDeleteSlide,
  onAddSlide,
  onGenerateOutline,
  isGeneratingOutline = false,
  disabled = false,
}: ContentPreviewProps) {
  // Freeform-first: Default to freeform when no outline exists
  const [viewMode, setViewMode] = useState<ViewMode>(outline ? "cards" : "freeform");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleStartEdit = (index: number, currentTitle: string) => {
    if (disabled) return;
    setEditingIndex(index);
    setEditValue(currentTitle);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && onEditSlide) {
      onEditSlide(editingIndex, editValue);
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            {outline ? outline.title : "Innholdsforhåndsvisning"}
          </h3>
          {outline && (
            <p className="text-xs text-gray-500 mt-0.5">{outline.slides.length} slides</p>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`
              p-1.5 rounded-md transition-all
              ${
                viewMode === "cards"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
            title="Kortvisning"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("freeform")}
            className={`
              p-1.5 rounded-md transition-all
              ${
                viewMode === "freeform"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
            title="Fritekstvisning"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto py-4">
        <AnimatePresence mode="wait">
          {viewMode === "cards" ? (
            <motion.div
              key="cards"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {outline ? (
                <Reorder.Group
                  axis="y"
                  values={outline.slides}
                  onReorder={(newOrder) => !disabled && onReorder?.(newOrder)}
                  className="space-y-2"
                >
                  {outline.slides.map((slide, index) => (
                    <Reorder.Item
                      key={`${slide.title}-${index}`}
                      value={slide}
                      dragListener={!disabled}
                      className="group"
                    >
                      <div
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border transition-all
                          ${
                            disabled
                              ? "bg-gray-50 border-gray-200"
                              : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-grab active:cursor-grabbing"
                          }
                        `}
                      >
                        {/* Drag handle */}
                        <div className={`text-gray-400 ${disabled ? "" : "cursor-grab"}`}>
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Slide number */}
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium flex items-center justify-center">
                          {index + 1}
                        </div>

                        {/* Slide content */}
                        <div className="flex-1 min-w-0">
                          {editingIndex === index ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleSaveEdit}
                              autoFocus
                              className="w-full px-2 py-1 text-sm border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          ) : (
                            <>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {slide.title}
                              </p>
                              {slide.suggestedType && (
                                <p className="text-xs text-gray-500 truncate">
                                  {slide.suggestedType.replace(/_/g, " ")}
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        {!disabled && editingIndex !== index && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(index, slide.title)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                              title="Rediger tittel"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteSlide?.(index)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                              title="Slett slide"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Arrow indicator */}
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : (
                <EmptyState />
              )}

              {/* Add slide button */}
              {outline && !disabled && onAddSlide && (
                <motion.button
                  type="button"
                  onClick={onAddSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 w-full mt-3 py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Legg til slide
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="freeform"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="prose prose-sm max-w-none"
            >
              {inputText ? (
                <div className="space-y-4">
                  {/* Freeform text display */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {inputText}
                    </p>
                  </div>

                  {/* Optional outline generation - only show if no outline and handler provided */}
                  {!outline && onGenerateOutline && (
                    <div className="flex flex-col items-center gap-3 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        Vil du ha mer kontroll over strukturen?
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={onGenerateOutline}
                        disabled={isGeneratingOutline || disabled}
                      >
                        {isGeneratingOutline ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Genererer outline...
                          </>
                        ) : (
                          <>
                            <List className="w-4 h-4 mr-2" />
                            Generer outline (valgfritt)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : outline ? (
                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-gray-900">{outline.title}</h4>
                  <ol className="space-y-2 list-decimal list-inside">
                    {outline.slides.map((slide, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        <span className="font-medium">{slide.title}</span>
                        {slide.suggestedType && (
                          <span className="text-gray-500 ml-2">
                            ({slide.suggestedType.replace(/_/g, " ")})
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <FreeformEmptyState
                  onGenerateOutline={onGenerateOutline}
                  isGeneratingOutline={isGeneratingOutline}
                  disabled={disabled}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <LayoutGrid className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">Ingen outline generert</p>
      <p className="text-xs text-gray-400 mt-1">
        Bytt til fritekstvisning eller generer en outline
      </p>
    </div>
  );
}

interface FreeformEmptyStateProps {
  onGenerateOutline?: () => void;
  isGeneratingOutline?: boolean;
  disabled?: boolean;
}

function FreeformEmptyState({
  onGenerateOutline,
  isGeneratingOutline = false,
  disabled = false,
}: FreeformEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
        <AlignLeft className="w-6 h-6 text-emerald-600" />
      </div>
      <p className="text-sm text-gray-700 font-medium mb-1">Klar til å generere!</p>
      <p className="text-xs text-gray-500 mb-4 max-w-xs">
        Trykk &quot;Generer presentasjon&quot; for å la AI strukturere innholdet automatisk, eller
        generer en outline først for mer kontroll.
      </p>
      {onGenerateOutline && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onGenerateOutline}
          disabled={isGeneratingOutline || disabled}
        >
          {isGeneratingOutline ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Genererer...
            </>
          ) : (
            <>
              <List className="w-4 h-4 mr-2" />
              Generer outline (valgfritt)
            </>
          )}
        </Button>
      )}
    </div>
  );
}
