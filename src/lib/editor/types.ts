/**
 * Editor State Types
 *
 * Type definitions for the editor state management system.
 * Uses React Context + useReducer pattern (no external state library for MVP).
 */

import type { Deck } from "@/lib/schemas/deck";
import type { Slide } from "@/lib/schemas/slide";
import type { Block } from "@/lib/schemas/block";

// ============================================================================
// Constraint Violations
// ============================================================================

export interface ConstraintViolation {
  /** Block ID where violation occurred */
  blockId: string;
  /** Type of violation */
  type: "max_chars" | "max_items" | "max_rows" | "overflow";
  /** Current value */
  current: number;
  /** Maximum allowed value */
  max: number;
  /** Human-readable message */
  message: string;
}

// ============================================================================
// History (Undo/Redo)
// ============================================================================

export interface EditorHistory {
  /** Previous states for undo */
  past: Deck[];
  /** Future states for redo */
  future: Deck[];
}

// ============================================================================
// Editor State
// ============================================================================

export interface EditorState {
  /** The deck being edited */
  deck: Deck;
  /** Currently selected slide index */
  selectedSlideIndex: number;
  /** Block currently being edited (null if none) */
  editingBlockId: string | null;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Whether save is in progress */
  isSaving: boolean;
  /** Last save timestamp */
  lastSavedAt: Date | null;
  /** Error message (if any) */
  error: string | null;
  /** Undo/redo history */
  history: EditorHistory;
  /** Constraint violations per block */
  violations: Map<string, ConstraintViolation[]>;
}

// ============================================================================
// Action Types
// ============================================================================

/** Initialize editor with a deck */
export interface InitializeAction {
  type: "INITIALIZE";
  payload: {
    deck: Deck;
  };
}

/** Select a slide */
export interface SelectSlideAction {
  type: "SELECT_SLIDE";
  payload: {
    index: number;
  };
}

/** Start editing a block */
export interface StartEditingAction {
  type: "START_EDITING";
  payload: {
    blockId: string;
  };
}

/** Stop editing */
export interface StopEditingAction {
  type: "STOP_EDITING";
}

/** Update deck metadata */
export interface UpdateDeckMetaAction {
  type: "UPDATE_DECK_META";
  payload: {
    title?: string;
    language?: string;
    themeId?: string;
  };
}

/** Update a slide */
export interface UpdateSlideAction {
  type: "UPDATE_SLIDE";
  payload: {
    index: number;
    slide: Partial<Slide>;
  };
}

/** Update a block */
export interface UpdateBlockAction {
  type: "UPDATE_BLOCK";
  payload: {
    slideIndex: number;
    blockIndex: number;
    block: Partial<Block>;
  };
}

/** Add a new slide */
export interface AddSlideAction {
  type: "ADD_SLIDE";
  payload: {
    slide: Slide;
    index?: number;
  };
}

/** Delete a slide */
export interface DeleteSlideAction {
  type: "DELETE_SLIDE";
  payload: {
    index: number;
  };
}

/** Duplicate a slide */
export interface DuplicateSlideAction {
  type: "DUPLICATE_SLIDE";
  payload: {
    index: number;
  };
}

/** Reorder slides */
export interface ReorderSlidesAction {
  type: "REORDER_SLIDES";
  payload: {
    fromIndex: number;
    toIndex: number;
  };
}

/** Undo last action */
export interface UndoAction {
  type: "UNDO";
}

/** Redo last undone action */
export interface RedoAction {
  type: "REDO";
}

/** Mark as saved */
export interface MarkSavedAction {
  type: "MARK_SAVED";
  payload: {
    savedAt: Date;
  };
}

/** Mark save started */
export interface MarkSavingAction {
  type: "MARK_SAVING";
}

/** Set error */
export interface SetErrorAction {
  type: "SET_ERROR";
  payload: {
    error: string | null;
  };
}

/** Set violations */
export interface SetViolationsAction {
  type: "SET_VIOLATIONS";
  payload: {
    violations: Map<string, ConstraintViolation[]>;
  };
}

/** Replace entire deck (e.g., after AI action or server sync) */
export interface ReplaceDeckAction {
  type: "REPLACE_DECK";
  payload: {
    deck: Deck;
    /** If true, this is a sync from server - don't mark as dirty (prevents auto-save race) */
    fromServer?: boolean;
  };
}

/** AI: Replace a single slide with AI-repaired version */
export interface AIReplaceSlideAction {
  type: "AI_REPLACE_SLIDE";
  payload: {
    slideIndex: number;
    newSlide: Slide;
  };
}

/** AI: Split a slide into multiple slides */
export interface AISplitSlideAction {
  type: "AI_SPLIT_SLIDE";
  payload: {
    slideIndex: number;
    slides: Slide[];
  };
}

// ============================================================================
// Union Type
// ============================================================================

export type EditorAction =
  | InitializeAction
  | SelectSlideAction
  | StartEditingAction
  | StopEditingAction
  | UpdateDeckMetaAction
  | UpdateSlideAction
  | UpdateBlockAction
  | AddSlideAction
  | DeleteSlideAction
  | DuplicateSlideAction
  | ReorderSlidesAction
  | UndoAction
  | RedoAction
  | MarkSavedAction
  | MarkSavingAction
  | SetErrorAction
  | SetViolationsAction
  | ReplaceDeckAction
  | AIReplaceSlideAction
  | AISplitSlideAction;

// ============================================================================
// Initial State Factory
// ============================================================================

export function createInitialState(deck?: Deck): EditorState {
  const emptyDeck: Deck = {
    deck: {
      title: "Ny presentasjon",
      language: "no",
      themeId: "nordic_light",
    },
    slides: [],
  };

  return {
    deck: deck ?? emptyDeck,
    selectedSlideIndex: 0,
    editingBlockId: null,
    isDirty: false,
    isSaving: false,
    lastSavedAt: null,
    error: null,
    history: {
      past: [],
      future: [],
    },
    violations: new Map(),
  };
}
