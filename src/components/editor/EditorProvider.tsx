"use client";

/**
 * EditorProvider
 *
 * React Context provider for editor state management.
 * Handles state, dispatch, and keyboard shortcuts (undo/redo).
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { Deck } from "@/lib/schemas/deck";
import {
  type EditorState,
  type EditorAction,
  type ConstraintViolation,
  createInitialState,
  editorReducer,
  editorActions,
  useCommandKeyboard,
  registerBuiltInCommands,
  type EditorContext as CommandEditorContext,
} from "@/lib/editor";

// ============================================================================
// Context Types
// ============================================================================

interface EditorContextValue {
  /** Current editor state */
  state: EditorState;
  /** Dispatch action to update state */
  dispatch: (action: EditorAction) => void;
  /** Convenience actions */
  actions: {
    selectSlide: (index: number) => void;
    startEditing: (blockId: string) => void;
    stopEditing: () => void;
    updateDeckMeta: (meta: { title?: string; language?: string; themeId?: string }) => void;
    updateSlide: (index: number, slide: Parameters<typeof editorActions.updateSlide>[1]) => void;
    updateBlock: (
      slideIndex: number,
      blockIndex: number,
      block: Parameters<typeof editorActions.updateBlock>[2]
    ) => void;
    addSlide: (slide: Parameters<typeof editorActions.addSlide>[0], index?: number) => void;
    deleteSlide: (index: number) => void;
    duplicateSlide: (index: number) => void;
    reorderSlides: (fromIndex: number, toIndex: number) => void;
    undo: () => void;
    redo: () => void;
    markSaving: () => void;
    markSaved: () => void;
    setError: (error: string | null) => void;
    setViolations: (violations: Map<string, ConstraintViolation[]>) => void;
    replaceDeck: (deck: Deck) => void;
    aiReplaceSlide: (
      slideIndex: number,
      newSlide: Parameters<typeof editorActions.aiReplaceSlide>[1]
    ) => void;
    aiSplitSlide: (
      slideIndex: number,
      slides: Parameters<typeof editorActions.aiSplitSlide>[1]
    ) => void;
  };
  /** Check if undo is available */
  canUndo: boolean;
  /** Check if redo is available */
  canRedo: boolean;
  /** Currently selected slide */
  currentSlide: Deck["slides"][number] | null;
}

// ============================================================================
// Context
// ============================================================================

const EditorContext = createContext<EditorContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface EditorProviderProps {
  children: ReactNode;
  /** Initial deck to edit (optional) */
  initialDeck?: Deck;
  /** Callback when save is triggered */
  onSave?: (deck: Deck) => Promise<void>;
  /** Live generation mode - syncs deck changes from props */
  isLiveMode?: boolean;
  /** Map of slideIndex to generated image URLs (for live image updates) */
  liveGeneratedImages?: Record<number, string>;
}

// Register built-in commands on first load
let commandsRegistered = false;
function ensureCommandsRegistered() {
  if (!commandsRegistered) {
    registerBuiltInCommands();
    commandsRegistered = true;
  }
}

export function EditorProvider({
  children,
  initialDeck,
  onSave,
  isLiveMode = false,
  liveGeneratedImages,
}: EditorProviderProps) {
  // Register commands on mount
  useEffect(() => {
    ensureCommandsRegistered();
  }, []);

  const [state, dispatch] = useReducer(editorReducer, initialDeck, (deck) =>
    createInitialState(deck)
  );

  // Track previous deck for sync logic
  const prevDeckRef = useRef(initialDeck);
  // Track if user has made any changes (separate from state.isDirty which resets on save)
  const hasUserInteractedRef = useRef(false);

  // Track user interactions to know when NOT to overwrite their work
  useEffect(() => {
    if (state.isDirty) {
      hasUserInteractedRef.current = true;
    }
  }, [state.isDirty]);

  // Sync initialDeck changes - handles both live mode and final sync after generation
  useEffect(() => {
    // Only sync if initialDeck actually changed
    if (!initialDeck) return;
    if (prevDeckRef.current === initialDeck) return;

    // Check if new slides were added
    const prevSlideCount = prevDeckRef.current?.slides.length ?? 0;
    const newSlideCount = initialDeck.slides.length;

    // Always sync if we have MORE slides - this catches:
    // 1. Live mode incremental updates
    // 2. Final fetch after generation completes (when isLiveMode becomes false)
    // 3. Initial load with populated deck
    if (newSlideCount > prevSlideCount) {
      // Only skip sync if user has actively made changes AND we're not in live mode
      // In live mode, we always sync to show real-time progress
      if (hasUserInteractedRef.current && !isLiveMode) {
        // User has made changes and we're not in live mode - don't overwrite
        prevDeckRef.current = initialDeck;
        return;
      }

      // Sync the new slides from server (don't mark dirty to prevent auto-save race)
      dispatch(editorActions.replaceDeck(initialDeck, true));

      // In live mode, auto-select newest slide for user to follow along
      if (isLiveMode) {
        dispatch(editorActions.selectSlide(newSlideCount - 1));
      }
    }

    prevDeckRef.current = initialDeck;
  }, [initialDeck, isLiveMode]);

  // ============================================================================
  // Live Image URL Updates
  // ============================================================================
  // Track which images we've already applied to prevent re-applying on every render
  const appliedImagesRef = useRef<Record<number, string>>({});

  // When new image URLs come in from the generation stream, update the slides
  useEffect(() => {
    if (!liveGeneratedImages || !isLiveMode) return;

    // Check each generated image
    Object.entries(liveGeneratedImages).forEach(([slideIndexStr, imageUrl]) => {
      const slideIndex = parseInt(slideIndexStr, 10);

      // Skip if we've already applied this exact URL
      if (appliedImagesRef.current[slideIndex] === imageUrl) return;

      // Get the slide
      const slide = state.deck.slides[slideIndex];
      if (!slide) return;

      // Find the image block
      const imageBlockIndex = slide.blocks.findIndex((b) => b.kind === "image");
      if (imageBlockIndex === -1) return;

      const imageBlock = slide.blocks[imageBlockIndex];

      // Only update if the URL is different (avoid unnecessary updates)
      if (imageBlock.url === imageUrl) {
        // URL already matches, just mark as applied
        appliedImagesRef.current[slideIndex] = imageUrl;
        return;
      }

      // Update the image block with the new URL
      dispatch(editorActions.updateBlock(slideIndex, imageBlockIndex, { url: imageUrl }));

      // Mark this URL as applied
      appliedImagesRef.current[slideIndex] = imageUrl;
    });
  }, [liveGeneratedImages, isLiveMode, state.deck.slides]);

  // ============================================================================
  // Command System Keyboard Handling
  // ============================================================================

  // Build command context from current state
  const getCommandContext = useCallback((): CommandEditorContext => {
    const currentSlide = state.deck.slides[state.selectedSlideIndex] ?? null;
    return {
      state,
      actions: {
        selectSlide: (index: number) => dispatch(editorActions.selectSlide(index)),
        startEditing: (blockId: string) => dispatch(editorActions.startEditing(blockId)),
        stopEditing: () => dispatch(editorActions.stopEditing()),
        updateDeckMeta: (meta) => dispatch(editorActions.updateDeckMeta(meta)),
        updateSlide: (index, slide) => dispatch(editorActions.updateSlide(index, slide)),
        updateBlock: (slideIndex, blockIndex, block) =>
          dispatch(editorActions.updateBlock(slideIndex, blockIndex, block)),
        addSlide: (slide, index) => dispatch(editorActions.addSlide(slide, index)),
        deleteSlide: (index) => dispatch(editorActions.deleteSlide(index)),
        duplicateSlide: (index) => dispatch(editorActions.duplicateSlide(index)),
        reorderSlides: (from, to) => dispatch(editorActions.reorderSlides(from, to)),
        undo: () => dispatch(editorActions.undo()),
        redo: () => dispatch(editorActions.redo()),
        markSaving: () => dispatch({ type: "MARK_SAVING" }),
        markSaved: () => dispatch({ type: "MARK_SAVED", payload: { savedAt: new Date() } }),
        setError: (error) => dispatch({ type: "SET_ERROR", payload: { error } }),
        setViolations: (violations) => dispatch(editorActions.setViolations(violations)),
        replaceDeck: (deck) => dispatch(editorActions.replaceDeck(deck)),
        aiReplaceSlide: (slideIndex, newSlide) =>
          dispatch(editorActions.aiReplaceSlide(slideIndex, newSlide)),
        aiSplitSlide: (slideIndex, slides) =>
          dispatch(editorActions.aiSplitSlide(slideIndex, slides)),
      },
      currentSlide,
      selectedSlideIndex: state.selectedSlideIndex,
      selectedBlockId: state.editingBlockId,
      canUndo: state.history.past.length > 0,
      canRedo: state.history.future.length > 0,
    };
  }, [state]);

  // Use command keyboard handler
  useCommandKeyboard(getCommandContext);

  // Handle actual save when markSaving is triggered
  useEffect(() => {
    if (state.isSaving && onSave) {
      onSave(state.deck)
        .then(() => {
          dispatch({ type: "MARK_SAVED", payload: { savedAt: new Date() } });
        })
        .catch((err) => {
          dispatch({
            type: "SET_ERROR",
            payload: { error: err instanceof Error ? err.message : "Lagring feilet" },
          });
        });
    }
  }, [state.isSaving, state.deck, onSave]);

  // ============================================================================
  // Convenience Actions
  // ============================================================================

  const selectSlide = useCallback((index: number) => {
    dispatch(editorActions.selectSlide(index));
  }, []);

  const startEditing = useCallback((blockId: string) => {
    dispatch(editorActions.startEditing(blockId));
  }, []);

  const stopEditing = useCallback(() => {
    dispatch(editorActions.stopEditing());
  }, []);

  const updateDeckMeta = useCallback(
    (meta: { title?: string; language?: string; themeId?: string }) => {
      dispatch(editorActions.updateDeckMeta(meta));
    },
    []
  );

  const updateSlide = useCallback(
    (index: number, slide: Parameters<typeof editorActions.updateSlide>[1]) => {
      dispatch(editorActions.updateSlide(index, slide));
    },
    []
  );

  const updateBlock = useCallback(
    (
      slideIndex: number,
      blockIndex: number,
      block: Parameters<typeof editorActions.updateBlock>[2]
    ) => {
      dispatch(editorActions.updateBlock(slideIndex, blockIndex, block));
    },
    []
  );

  const addSlide = useCallback(
    (slide: Parameters<typeof editorActions.addSlide>[0], index?: number) => {
      dispatch(editorActions.addSlide(slide, index));
    },
    []
  );

  const deleteSlide = useCallback((index: number) => {
    dispatch(editorActions.deleteSlide(index));
  }, []);

  const duplicateSlide = useCallback((index: number) => {
    dispatch(editorActions.duplicateSlide(index));
  }, []);

  const reorderSlides = useCallback((fromIndex: number, toIndex: number) => {
    dispatch(editorActions.reorderSlides(fromIndex, toIndex));
  }, []);

  const undo = useCallback(() => {
    dispatch(editorActions.undo());
  }, []);

  const redo = useCallback(() => {
    dispatch(editorActions.redo());
  }, []);

  const markSaving = useCallback(() => {
    dispatch({ type: "MARK_SAVING" });
  }, []);

  const markSaved = useCallback(() => {
    dispatch({ type: "MARK_SAVED", payload: { savedAt: new Date() } });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: { error } });
  }, []);

  const setViolations = useCallback((violations: Map<string, ConstraintViolation[]>) => {
    dispatch(editorActions.setViolations(violations));
  }, []);

  const replaceDeck = useCallback((deck: Deck) => {
    dispatch(editorActions.replaceDeck(deck));
  }, []);

  const aiReplaceSlide = useCallback(
    (slideIndex: number, newSlide: Parameters<typeof editorActions.aiReplaceSlide>[1]) => {
      dispatch(editorActions.aiReplaceSlide(slideIndex, newSlide));
    },
    []
  );

  const aiSplitSlide = useCallback(
    (slideIndex: number, slides: Parameters<typeof editorActions.aiSplitSlide>[1]) => {
      dispatch(editorActions.aiSplitSlide(slideIndex, slides));
    },
    []
  );

  // ============================================================================
  // Computed Values
  // ============================================================================

  const canUndo = state.history.past.length > 0;
  const canRedo = state.history.future.length > 0;
  const currentSlide = state.deck.slides[state.selectedSlideIndex] ?? null;

  // ============================================================================
  // Memoized Context Value
  // ============================================================================

  const contextValue = useMemo<EditorContextValue>(
    () => ({
      state,
      dispatch,
      actions: {
        selectSlide,
        startEditing,
        stopEditing,
        updateDeckMeta,
        updateSlide,
        updateBlock,
        addSlide,
        deleteSlide,
        duplicateSlide,
        reorderSlides,
        undo,
        redo,
        markSaving,
        markSaved,
        setError,
        setViolations,
        replaceDeck,
        aiReplaceSlide,
        aiSplitSlide,
      },
      canUndo,
      canRedo,
      currentSlide,
    }),
    [
      state,
      selectSlide,
      startEditing,
      stopEditing,
      updateDeckMeta,
      updateSlide,
      updateBlock,
      addSlide,
      deleteSlide,
      duplicateSlide,
      reorderSlides,
      undo,
      redo,
      markSaving,
      markSaved,
      setError,
      setViolations,
      replaceDeck,
      aiReplaceSlide,
      aiSplitSlide,
      canUndo,
      canRedo,
      currentSlide,
    ]
  );

  return <EditorContext.Provider value={contextValue}>{children}</EditorContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Access editor state and actions.
 * Must be used within EditorProvider.
 */
export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return context;
}

/**
 * Access only the current slide (useful for optimization).
 */
export function useCurrentSlide() {
  const { currentSlide, state } = useEditor();
  return { slide: currentSlide, index: state.selectedSlideIndex };
}

/**
 * Access editor dispatch directly (useful for performance-critical updates).
 */
export function useEditorDispatch() {
  const { dispatch } = useEditor();
  return dispatch;
}
