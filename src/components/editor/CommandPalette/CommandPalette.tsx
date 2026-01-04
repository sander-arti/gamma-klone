"use client";

/**
 * Command Palette Component
 *
 * A ⌘K-triggered interface for executing editor commands.
 * Uses Spotlight as the base UI component.
 */

import { useState, useCallback, useMemo } from "react";
import { Spotlight, type SpotlightItem } from "@/components/ui";
import { useEditor } from "@/components/editor/EditorProvider";
import {
  commandRegistry,
  useCommandPaletteTrigger,
  type EditorContext,
  CATEGORY_META,
} from "@/lib/editor";

// ============================================================================
// Category Display Order
// ============================================================================

const CATEGORY_ORDER = ["edit", "slide", "ai", "view", "export"] as const;

// ============================================================================
// Component
// ============================================================================

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, actions, canUndo, canRedo, currentSlide } = useEditor();

  // Build command context
  const getContext = useCallback((): EditorContext => ({
    state,
    actions: {
      selectSlide: actions.selectSlide,
      startEditing: actions.startEditing,
      stopEditing: actions.stopEditing,
      updateDeckMeta: actions.updateDeckMeta,
      updateSlide: actions.updateSlide,
      updateBlock: actions.updateBlock,
      addSlide: actions.addSlide,
      deleteSlide: actions.deleteSlide,
      duplicateSlide: actions.duplicateSlide,
      reorderSlides: actions.reorderSlides,
      undo: actions.undo,
      redo: actions.redo,
      markSaving: actions.markSaving,
      markSaved: actions.markSaved,
      setError: actions.setError,
      setViolations: actions.setViolations,
      replaceDeck: actions.replaceDeck,
      aiReplaceSlide: actions.aiReplaceSlide,
      aiSplitSlide: actions.aiSplitSlide,
    },
    currentSlide: currentSlide ?? null,
    selectedSlideIndex: state.selectedSlideIndex,
    selectedBlockId: state.editingBlockId,
    canUndo,
    canRedo,
  }), [state, actions, currentSlide, canUndo, canRedo]);

  // Handle ⌘K trigger
  useCommandPaletteTrigger({
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    isOpen,
  });

  // Convert commands to Spotlight items
  const items = useMemo((): SpotlightItem[] => {
    const context = getContext();
    const available = commandRegistry.getAvailable(context);

    return available.map((cmd) => ({
      id: cmd.id,
      label: cmd.label,
      description: cmd.description,
      icon: cmd.icon ? <cmd.icon className="w-4 h-4" /> : undefined,
      shortcut: cmd.shortcut,
      category: cmd.category,
    }));
  }, [getContext]);

  // Handle command selection
  const handleSelect = useCallback(
    async (item: SpotlightItem) => {
      setIsOpen(false);

      try {
        const context = getContext();
        await commandRegistry.execute(item.id, context);
      } catch (error) {
        console.error(`Failed to execute command "${item.id}":`, error);
      }
    },
    [getContext]
  );

  // Handle close
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Category labels
  const categoryLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const [key, meta] of Object.entries(CATEGORY_META)) {
      labels[key] = meta.label;
    }
    return labels;
  }, []);

  // Custom search using command registry
  const handleSearch = useCallback(
    (query: string, _items: SpotlightItem[]): SpotlightItem[] => {
      if (!query.trim()) {
        // Return items sorted by category order when no query
        return [..._items].sort((a, b) => {
          const aOrder = CATEGORY_ORDER.indexOf(a.category as typeof CATEGORY_ORDER[number]);
          const bOrder = CATEGORY_ORDER.indexOf(b.category as typeof CATEGORY_ORDER[number]);
          return aOrder - bOrder;
        });
      }

      const context = getContext();
      const results = commandRegistry.search(query, context);

      return results.map((result) => ({
        id: result.command.id,
        label: result.command.label,
        description: result.command.description,
        icon: result.command.icon ? (
          <result.command.icon className="w-4 h-4" />
        ) : undefined,
        shortcut: result.command.shortcut,
        category: result.command.category,
        labelMatches: result.labelMatches,
        descriptionMatches: result.descriptionMatches,
      }));
    },
    [getContext]
  );

  return (
    <Spotlight
      isOpen={isOpen}
      onClose={handleClose}
      placeholder="Søk etter kommandoer..."
      items={items}
      onSelect={handleSelect}
      onSearch={handleSearch}
      groupByCategory={true}
      categoryLabels={categoryLabels}
      footer={
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>↑↓ navigér • Enter velg • Esc lukk</span>
          <span className="text-zinc-600">⌘K for å åpne</span>
        </div>
      }
    />
  );
}
