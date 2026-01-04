/**
 * Editor Reducer
 *
 * Pure reducer function for editor state management.
 * Handles all state transitions including undo/redo.
 */

import type { Deck } from "@/lib/schemas/deck";
import type { Slide } from "@/lib/schemas/slide";
import type { Block } from "@/lib/schemas/block";
import type { EditorState, EditorAction, EditorHistory, ConstraintViolation } from "./types";

// ============================================================================
// History Helpers
// ============================================================================

const MAX_HISTORY_SIZE = 50;

/**
 * Push current deck to history before making changes.
 * Clears future on new changes (can't redo after new edit).
 */
function pushToHistory(history: EditorHistory, deck: Deck): EditorHistory {
  const past = [...history.past, deck];
  // Trim history if too large
  if (past.length > MAX_HISTORY_SIZE) {
    past.shift();
  }
  return {
    past,
    future: [], // Clear redo stack on new action
  };
}

// ============================================================================
// Reducer
// ============================================================================

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "INITIALIZE": {
      return {
        ...state,
        deck: action.payload.deck,
        selectedSlideIndex: 0,
        editingBlockId: null,
        isDirty: false,
        error: null,
        history: { past: [], future: [] },
        violations: new Map(),
      };
    }

    case "SELECT_SLIDE": {
      const { index } = action.payload;
      const maxIndex = Math.max(0, state.deck.slides.length - 1);
      return {
        ...state,
        selectedSlideIndex: Math.max(0, Math.min(index, maxIndex)),
        editingBlockId: null, // Stop editing when changing slides
      };
    }

    case "START_EDITING": {
      return {
        ...state,
        editingBlockId: action.payload.blockId,
      };
    }

    case "STOP_EDITING": {
      return {
        ...state,
        editingBlockId: null,
      };
    }

    case "UPDATE_DECK_META": {
      const { title, language, themeId } = action.payload;
      return {
        ...state,
        deck: {
          ...state.deck,
          deck: {
            ...state.deck.deck,
            ...(title !== undefined && { title }),
            ...(language !== undefined && { language }),
            ...(themeId !== undefined && { themeId: themeId as Deck["deck"]["themeId"] }),
          },
        },
        isDirty: true,
        history: pushToHistory(state.history, state.deck),
      };
    }

    case "UPDATE_SLIDE": {
      const { index, slide } = action.payload;
      if (index < 0 || index >= state.deck.slides.length) {
        return state;
      }

      const newSlides = [...state.deck.slides];
      newSlides[index] = {
        ...newSlides[index],
        ...slide,
      };

      return {
        ...state,
        deck: {
          ...state.deck,
          slides: newSlides,
        },
        isDirty: true,
        history: pushToHistory(state.history, state.deck),
      };
    }

    case "UPDATE_BLOCK": {
      const { slideIndex, blockIndex, block } = action.payload;
      if (
        slideIndex < 0 ||
        slideIndex >= state.deck.slides.length ||
        blockIndex < 0 ||
        blockIndex >= state.deck.slides[slideIndex].blocks.length
      ) {
        return state;
      }

      const newSlides = [...state.deck.slides];
      const newBlocks = [...newSlides[slideIndex].blocks];
      newBlocks[blockIndex] = {
        ...newBlocks[blockIndex],
        ...block,
      };
      newSlides[slideIndex] = {
        ...newSlides[slideIndex],
        blocks: newBlocks,
      };

      return {
        ...state,
        deck: {
          ...state.deck,
          slides: newSlides,
        },
        isDirty: true,
        history: pushToHistory(state.history, state.deck),
      };
    }

    case "ADD_SLIDE": {
      const { slide, index } = action.payload;
      const insertIndex = index ?? state.deck.slides.length;
      const newSlides = [...state.deck.slides];
      newSlides.splice(insertIndex, 0, slide);

      return {
        ...state,
        deck: {
          ...state.deck,
          slides: newSlides,
        },
        selectedSlideIndex: insertIndex,
        isDirty: true,
        history: pushToHistory(state.history, state.deck),
      };
    }

    case "DELETE_SLIDE": {
      const { index } = action.payload;
      if (index < 0 || index >= state.deck.slides.length) {
        return state;
      }

      // Don't allow deleting the last slide
      if (state.deck.slides.length === 1) {
        return state;
      }

      const newSlides = state.deck.slides.filter((_, i) => i !== index);
      const newSelectedIndex = Math.min(state.selectedSlideIndex, newSlides.length - 1);

      return {
        ...state,
        deck: {
          ...state.deck,
          slides: newSlides,
        },
        selectedSlideIndex: newSelectedIndex,
        editingBlockId: null,
        isDirty: true,
        history: pushToHistory(state.history, state.deck),
      };
    }

    case "DUPLICATE_SLIDE": {
      const { index } = action.payload;
      if (index < 0 || index >= state.deck.slides.length) {
        return state;
      }

      const slideToDuplicate = state.deck.slides[index];
      // Deep clone the slide
      const duplicatedSlide = JSON.parse(JSON.stringify(slideToDuplicate));
      const newSlides = [...state.deck.slides];
      newSlides.splice(index + 1, 0, duplicatedSlide);

      return {
        ...state,
        deck: {
          ...state.deck,
          slides: newSlides,
        },
        selectedSlideIndex: index + 1,
        isDirty: true,
        history: pushToHistory(state.history, state.deck),
      };
    }

    case "REORDER_SLIDES": {
      const { fromIndex, toIndex } = action.payload;
      if (
        fromIndex < 0 ||
        fromIndex >= state.deck.slides.length ||
        toIndex < 0 ||
        toIndex >= state.deck.slides.length ||
        fromIndex === toIndex
      ) {
        return state;
      }

      const newSlides = [...state.deck.slides];
      const [movedSlide] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, movedSlide);

      return {
        ...state,
        deck: {
          ...state.deck,
          slides: newSlides,
        },
        selectedSlideIndex: toIndex,
        isDirty: true,
        history: pushToHistory(state.history, state.deck),
      };
    }

    case "UNDO": {
      if (state.history.past.length === 0) {
        return state;
      }

      const newPast = [...state.history.past];
      const previousDeck = newPast.pop()!;

      return {
        ...state,
        deck: previousDeck,
        isDirty: true,
        history: {
          past: newPast,
          future: [state.deck, ...state.history.future],
        },
      };
    }

    case "REDO": {
      if (state.history.future.length === 0) {
        return state;
      }

      const newFuture = [...state.history.future];
      const nextDeck = newFuture.shift()!;

      return {
        ...state,
        deck: nextDeck,
        isDirty: true,
        history: {
          past: [...state.history.past, state.deck],
          future: newFuture,
        },
      };
    }

    case "MARK_SAVING": {
      return {
        ...state,
        isSaving: true,
        error: null,
      };
    }

    case "MARK_SAVED": {
      return {
        ...state,
        isDirty: false,
        isSaving: false,
        lastSavedAt: action.payload.savedAt,
        error: null,
      };
    }

    case "SET_ERROR": {
      return {
        ...state,
        error: action.payload.error,
        isSaving: false,
      };
    }

    case "SET_VIOLATIONS": {
      return {
        ...state,
        violations: action.payload.violations,
      };
    }

    case "REPLACE_DECK": {
      // If fromServer is true, this is a sync from server (e.g., during generation)
      // Don't mark as dirty to prevent auto-save from overwriting server data
      const fromServer = action.payload.fromServer ?? false;
      return {
        ...state,
        deck: action.payload.deck,
        isDirty: fromServer ? state.isDirty : true, // Keep current dirty state if server sync
        history: fromServer ? state.history : pushToHistory(state.history, state.deck),
      };
    }

    case "AI_REPLACE_SLIDE": {
      const { slideIndex, newSlide } = action.payload;
      if (slideIndex < 0 || slideIndex >= state.deck.slides.length) {
        return state;
      }

      const newSlides = [...state.deck.slides];
      newSlides[slideIndex] = newSlide;

      return {
        ...state,
        deck: {
          ...state.deck,
          slides: newSlides,
        },
        isDirty: true,
        history: pushToHistory(state.history, state.deck),
      };
    }

    case "AI_SPLIT_SLIDE": {
      const { slideIndex, slides } = action.payload;
      if (slideIndex < 0 || slideIndex >= state.deck.slides.length) {
        return state;
      }

      // Replace the original slide with multiple slides
      const newSlides = [...state.deck.slides];
      newSlides.splice(slideIndex, 1, ...slides);

      return {
        ...state,
        deck: {
          ...state.deck,
          slides: newSlides,
        },
        selectedSlideIndex: slideIndex, // Keep selection at first of the split slides
        isDirty: true,
        history: pushToHistory(state.history, state.deck),
      };
    }

    default: {
      // Exhaustiveness check
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

// ============================================================================
// Action Creators (for convenience)
// ============================================================================

export const editorActions = {
  initialize: (deck: Deck): EditorAction => ({
    type: "INITIALIZE",
    payload: { deck },
  }),

  selectSlide: (index: number): EditorAction => ({
    type: "SELECT_SLIDE",
    payload: { index },
  }),

  startEditing: (blockId: string): EditorAction => ({
    type: "START_EDITING",
    payload: { blockId },
  }),

  stopEditing: (): EditorAction => ({
    type: "STOP_EDITING",
  }),

  updateDeckMeta: (meta: {
    title?: string;
    language?: string;
    themeId?: string;
  }): EditorAction => ({
    type: "UPDATE_DECK_META",
    payload: meta,
  }),

  updateSlide: (index: number, slide: Partial<Slide>): EditorAction => ({
    type: "UPDATE_SLIDE",
    payload: { index, slide },
  }),

  updateBlock: (slideIndex: number, blockIndex: number, block: Partial<Block>): EditorAction => ({
    type: "UPDATE_BLOCK",
    payload: { slideIndex, blockIndex, block },
  }),

  addSlide: (slide: Slide, index?: number): EditorAction => ({
    type: "ADD_SLIDE",
    payload: { slide, index },
  }),

  deleteSlide: (index: number): EditorAction => ({
    type: "DELETE_SLIDE",
    payload: { index },
  }),

  duplicateSlide: (index: number): EditorAction => ({
    type: "DUPLICATE_SLIDE",
    payload: { index },
  }),

  reorderSlides: (fromIndex: number, toIndex: number): EditorAction => ({
    type: "REORDER_SLIDES",
    payload: { fromIndex, toIndex },
  }),

  undo: (): EditorAction => ({ type: "UNDO" }),

  redo: (): EditorAction => ({ type: "REDO" }),

  markSaving: (): EditorAction => ({ type: "MARK_SAVING" }),

  markSaved: (savedAt: Date): EditorAction => ({
    type: "MARK_SAVED",
    payload: { savedAt },
  }),

  setError: (error: string | null): EditorAction => ({
    type: "SET_ERROR",
    payload: { error },
  }),

  setViolations: (violations: Map<string, ConstraintViolation[]>): EditorAction => ({
    type: "SET_VIOLATIONS",
    payload: { violations },
  }),

  replaceDeck: (deck: Deck, fromServer?: boolean): EditorAction => ({
    type: "REPLACE_DECK",
    payload: { deck, fromServer },
  }),

  aiReplaceSlide: (slideIndex: number, newSlide: Slide): EditorAction => ({
    type: "AI_REPLACE_SLIDE",
    payload: { slideIndex, newSlide },
  }),

  aiSplitSlide: (slideIndex: number, slides: Slide[]): EditorAction => ({
    type: "AI_SPLIT_SLIDE",
    payload: { slideIndex, slides },
  }),
} as const;
