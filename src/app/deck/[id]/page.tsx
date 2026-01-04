"use client";

/**
 * Editor Page
 *
 * Main page for editing å presentation.
 * Provides EditorProvider context and loads deck data.
 * Uses EditorLayout for the 3-panel layout with all features.
 * Supports inline editing of slide content with validation.
 * Supports live generation mode via ?generating=<generationId> query param.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { EditorProvider, useEditor, EditorLayout, SlideTransition } from "@/components/editor";
import { useAutoSave } from "@/lib/hooks";
import { ThemeProvider, SlideCanvas } from "@/components/viewer";
import { SlideRenderer } from "@/components/slides";
import { Button, LoadingSpinner, useToast } from "@/components/ui";
import { StreamingSlidePreview } from "@/components/generation/StreamingSlidePreview";
import { useGenerationStream, type StreamingSlideState } from "@/hooks/useGenerationStream";
import type { Deck, ThemeId } from "@/lib/schemas/deck";
import { validateBlock } from "@/lib/editor/constraints";
import type { ConstraintViolation } from "@/lib/editor/types";

// ============================================================================
// Editor Content (inside provider) - uses EditorLayout
// ============================================================================

function EditorContent({
  deckId,
  streamingSlide,
  isLiveMode = false,
  liveProgress = 0,
  liveStage = "",
  liveTotalSlides = 0,
  liveIsGeneratingImages = false,
  liveCurrentImageIndex = 0,
  liveTotalImages = 0,
  liveImagesCompleted = 0,
  liveGeneratedImages = {},
}: {
  deckId: string;
  streamingSlide?: StreamingSlideState | null;
  isLiveMode?: boolean;
  liveProgress?: number;
  liveStage?: string;
  liveTotalSlides?: number;
  liveIsGeneratingImages?: boolean;
  liveCurrentImageIndex?: number;
  liveTotalImages?: number;
  liveImagesCompleted?: number;
  liveGeneratedImages?: Record<number, string>;
}) {
  const { state, canUndo, canRedo, actions } = useEditor();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { addToast } = useToast();

  const currentSlide = state.deck.slides[state.selectedSlideIndex];

  // Check if the current slide's image is being generated
  const isCurrentSlideImageGenerating = useMemo(() => {
    if (!liveIsGeneratingImages || !currentSlide) return false;

    // Check if slide has an image block
    const imageBlock = currentSlide.blocks.find((b) => b.kind === "image");
    if (!imageBlock) return false;

    // Check if image already has URL (either in block or in generatedImages)
    const hasUrl = Boolean(imageBlock.url) || Boolean(liveGeneratedImages[state.selectedSlideIndex]);

    // If no URL yet and we're generating images, this slide's image is being generated
    return !hasUrl;
  }, [liveIsGeneratingImages, currentSlide, liveGeneratedImages, state.selectedSlideIndex]);

  // Validate all blocks in the deck
  const allViolations = useMemo(() => {
    const violations: ConstraintViolation[] = [];
    state.deck.slides.forEach((slide, slideIndex) => {
      slide.blocks.forEach((block, blockIndex) => {
        const blockViolations = validateBlock(block, slideIndex, blockIndex);
        violations.push(...blockViolations);
      });
    });
    return violations;
  }, [state.deck.slides]);

  const hasViolations = allViolations.length > 0;

  // Save function for auto-save and manual save
  const performSave = useCallback(async () => {
    actions.stopEditing();
    actions.markSaving();

    const res = await fetch(`/api/decks/${deckId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deck: state.deck }),
    });

    if (!res.ok) {
      throw new Error("Lagring feilet");
    }

    actions.markSaved();
  }, [deckId, state.deck, actions]);

  // Auto-save hook (3 second debounce)
  const { lastSavedAt, isSaving, error: saveError, saveNow } = useAutoSave({
    onSave: performSave,
    isDirty: state.isDirty,
    delay: 3000,
    enabled: true,
    blocked: hasViolations,
    onSuccess: () => {
      addToast({ type: "success", message: "Lagret", duration: 2000 });
    },
    onError: (error) => {
      addToast({ type: "error", message: error.message || "Lagring feilet" });
    },
  });

  // Keyboard shortcuts for undo/redo/save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+S: Manual save (works in all modes)
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (!hasViolations && state.isDirty) {
          saveNow();
        }
        return;
      }

      // Skip undo/redo if editing text in contentEditable
      if ((e.target as Element)?.getAttribute?.("contenteditable") === "true") {
        return;
      }

      // Undo: Cmd+Z
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) actions.undo();
      }
      // Redo: Cmd+Shift+Z
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        if (canRedo) actions.redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, actions, saveNow, hasViolations, state.isDirty]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = "Du har ulagrede endringer. Er du sikker på at du vil forlate siden?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.isDirty]);

  return (
    <EditorLayout
      deckId={deckId}
      // Save props
      violations={allViolations}
      isSaving={isSaving}
      lastSavedAt={lastSavedAt}
      saveError={saveError}
      onSaveNow={saveNow}
      // Modal props
      shareModal={{
        isOpen: isShareModalOpen,
        onOpen: () => setIsShareModalOpen(true),
        onClose: () => setIsShareModalOpen(false),
      }}
      exportModal={{
        isOpen: isExportModalOpen,
        onOpen: () => setIsExportModalOpen(true),
        onClose: () => setIsExportModalOpen(false),
      }}
      // Live mode props
      liveMode={
        isLiveMode
          ? {
              isActive: true,
              isGenerating: true,
              progress: liveProgress,
              currentStage: liveStage,
              slidesGenerated: state.deck.slides.length,
              totalSlides: liveTotalSlides,
              isGeneratingImages: liveIsGeneratingImages,
              currentImageIndex: liveCurrentImageIndex,
              totalImages: liveTotalImages,
              imagesCompleted: liveImagesCompleted,
            }
          : undefined
      }
      liveGeneratedImages={liveGeneratedImages}
    >
      {/* Canvas content - the only thing we render here */}
      <ThemeProvider
        themeId={state.deck.deck.themeId as ThemeId}
        brandKit={state.deck.deck.brandKit}
      >
        <div className="relative w-full max-w-4xl">
          {/* Aspect ratio container using padding-bottom technique */}
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <div className="absolute inset-0">
              <SlideCanvas className="shadow-lg rounded-lg overflow-hidden w-full h-full">
                <SlideTransition
                  slideIndex={state.selectedSlideIndex}
                  transition="fade"
                >
                  {/* Show streaming preview when generating this slide */}
                  {isLiveMode &&
                  streamingSlide?.isStreaming &&
                  streamingSlide.slideIndex === state.selectedSlideIndex ? (
                    <StreamingSlidePreview
                      blocks={streamingSlide.blocks}
                      slideIndex={streamingSlide.slideIndex}
                      className="h-full"
                    />
                  ) : currentSlide ? (
                    <SlideRenderer
                      slide={currentSlide}
                      editable={!isLiveMode}
                      slideIndex={state.selectedSlideIndex}
                      isImageGenerating={isCurrentSlideImageGenerating}
                    />
                  ) : null}
                </SlideTransition>
              </SlideCanvas>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </EditorLayout>
  );
}

// ============================================================================
// Page Wrapper (loads deck and provides context)
// ============================================================================

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = params?.id as string;

  // Check for live generation mode
  const generationId = searchParams?.get("generating") ?? null;
  const isLiveMode = Boolean(generationId);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live generation stream (only active in live mode)
  const {
    progress,
    currentStage,
    slides: streamedSlides,
    outline,
    isGenerating,
    isComplete,
    isFailed,
    error: generationError,
    streamingSlide,
    totalSlides: streamTotalSlides,
    // Image generation state
    isGeneratingImages,
    totalImages,
    currentImageIndex,
    generatedImages,
    imagesCompleted,
  } = useGenerationStream(generationId);

  const fetchDeck = useCallback(async () => {
    if (!deckId) return;

    // Don't show loading spinner during live mode refreshes
    if (!deck) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const res = await fetch(`/api/decks/${deckId}`);
      if (!res.ok) {
        if (res.status === 404) {
          // In live mode, deck might not have slides yet - that's OK
          if (isLiveMode) {
            setDeck({
              deck: { title: "Genererer...", language: "nb", themeId: "nordic_light" },
              slides: [],
            });
            setIsLoading(false);
            return;
          }
          throw new Error("Presentasjon ikke funnet");
        }
        throw new Error("Kunne ikke hente presentasjon");
      }

      const data = await res.json();
      setDeck({
        deck: {
          title: data.deck.title,
          language: data.deck.language,
          themeId: data.deck.themeId,
          brandKit: data.deck.brandKit,
        },
        slides: data.slides,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "En feil oppstod");
    } finally {
      setIsLoading(false);
    }
  }, [deckId, deck, isLiveMode]);

  useEffect(() => {
    fetchDeck();
  }, []);

  // Track if we've done the final fetch after completion
  const hasDoneFinalFetch = useRef(false);

  // In live mode, poll database periodically to get updated slides
  // SSE events are unreliable for slide_content, so we use polling as backup
  useEffect(() => {
    if (!isLiveMode || !isGenerating) return;

    // Reset final fetch flag when generation starts
    hasDoneFinalFetch.current = false;

    // Poll every 2 seconds during generation
    const pollInterval = setInterval(() => {
      fetchDeck();
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isLiveMode, isGenerating, fetchDeck]);

  // Handle generation completion - fetch final deck and remove URL param
  useEffect(() => {
    // Only run once when generation completes
    if (!isComplete || !generationId || hasDoneFinalFetch.current) return;

    // Mark that we're doing the final fetch to prevent re-runs
    hasDoneFinalFetch.current = true;

    // Fetch the final deck BEFORE changing the URL
    // This ensures we get all slides while still "in live mode"
    const doFinalFetch = async () => {
      try {
        // Small delay to ensure database transaction has fully committed
        await new Promise(resolve => setTimeout(resolve, 500));

        // Fetch the complete deck
        const res = await fetch(`/api/decks/${deckId}`);
        if (res.ok) {
          const data = await res.json();
          setDeck({
            deck: {
              title: data.deck.title,
              language: data.deck.language,
              themeId: data.deck.themeId,
              brandKit: data.deck.brandKit,
            },
            slides: data.slides,
          });
        }
      } catch (err) {
        console.error("Final fetch failed:", err);
      } finally {
        // Now remove the ?generating param (this changes isLiveMode to false)
        router.replace(`/deck/${deckId}`);
      }
    };

    doFinalFetch();
  }, [isComplete, generationId, deckId, router]);

  const handleSave = async (deckToSave: Deck) => {
    const res = await fetch(`/api/decks/${deckId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deck: deckToSave }),
    });

    if (!res.ok) {
      throw new Error("Lagring feilet");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" label="Laster presentasjon" />
          <p className="mt-4 text-gray-500">Laster presentasjon...</p>
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Noe gikk galt"}
          </h1>
          <p className="text-gray-500 mb-4">
            Prøv å laste siden på nytt, eller gå tilbake til dashbordet.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="secondary" onClick={fetchDeck}>
              Prøv igjen
            </Button>
            <Link href="/">
              <Button>Til dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EditorProvider
      initialDeck={deck}
      onSave={handleSave}
      isLiveMode={isLiveMode && isGenerating}
      liveGeneratedImages={generatedImages}
    >
      <EditorContent
        deckId={deckId}
        streamingSlide={streamingSlide}
        isLiveMode={isLiveMode && isGenerating}
        // Pass live generation state to EditorContent -> EditorLayout
        liveProgress={progress}
        liveStage={currentStage}
        liveTotalSlides={streamTotalSlides || deck?.slides.length || 0}
        liveIsGeneratingImages={isGeneratingImages}
        liveCurrentImageIndex={currentImageIndex}
        liveTotalImages={totalImages}
        liveImagesCompleted={imagesCompleted}
        liveGeneratedImages={generatedImages}
      />
    </EditorProvider>
  );
}
