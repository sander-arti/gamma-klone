"use client";

/**
 * EditorLayout
 *
 * Main 3-panel layout for the editor.
 * - Left: SlideList with thumbnails
 * - Center: Canvas for viewing/editing
 * - Right: Inspector for properties
 * - AI Chat panel (toggle)
 *
 * This is the single source of truth for editor layout.
 * page.tsx should use this component and pass data via props.
 */

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { Sparkles, HelpCircle } from "lucide-react";
import { useEditor, useCurrentSlide } from "./EditorProvider";
import { SlideList } from "./SlideList";
import { Inspector } from "./Inspector";
import { CommandPalette } from "./CommandPalette";
import { AIChat } from "./AIChat";
import { HelpModal } from "./HelpModal";
import { ShareModal } from "./ShareModal";
import { ExportModal } from "./ExportModal";
import { SaveStatus } from "./SaveStatus";
import { Button, LoadingSpinner, Tooltip } from "@/components/ui";
import { GenerationHeader } from "@/components/generation";
import { onAIChatEvent, type AIChatEvent } from "@/lib/editor/commands/ai-chat-events";
import type { SlideTransformResult } from "@/lib/ai/slide-agent";
import type { ConstraintViolation } from "@/lib/editor/types";
import type { TransformationType } from "@/lib/ai/prompts/slide-transform";

/**
 * Live generation mode state
 */
interface LiveModeState {
  isActive: boolean;
  isGenerating: boolean;
  progress: number;
  currentStage: string;
  slidesGenerated: number;
  totalSlides: number;
  isGeneratingImages?: boolean;
  currentImageIndex?: number;
  totalImages?: number;
  /** Actual number of images that have completed successfully */
  imagesCompleted?: number;
}

interface EditorLayoutProps {
  /** The deck ID for API calls */
  deckId: string;
  /** Canvas content (SlideRenderer or StreamingSlidePreview) */
  children: ReactNode;

  // Save functionality (data-logic stays in page.tsx)
  /** All constraint violations in the deck */
  violations?: ConstraintViolation[];
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Last saved timestamp */
  lastSavedAt?: Date | null;
  /** Save error message */
  saveError?: string | null;
  /** Trigger save function */
  onSaveNow?: () => void;

  // Modal controls (state stays in page.tsx)
  /** Share modal state */
  shareModal?: { isOpen: boolean; onOpen: () => void; onClose: () => void };
  /** Export modal state */
  exportModal?: { isOpen: boolean; onOpen: () => void; onClose: () => void };

  // Live generation mode
  /** Live generation mode state */
  liveMode?: LiveModeState;
  /** Map of slideIndex to generated image URLs (for real-time updates) */
  liveGeneratedImages?: Record<number, string>;
}

export function EditorLayout({
  deckId,
  children,
  // Save props
  violations = [],
  isSaving: isSavingProp,
  lastSavedAt,
  saveError,
  onSaveNow,
  // Modal props
  shareModal,
  exportModal,
  // Live mode props
  liveMode,
  liveGeneratedImages,
}: EditorLayoutProps) {
  const { state, canUndo, canRedo, actions } = useEditor();
  const currentSlide = useCurrentSlide();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  // Pending AI action to execute when chat opens
  const [pendingAction, setPendingAction] = useState<{
    type: "quick-action" | "custom" | "generate-image";
    quickAction?: TransformationType;
    instruction?: string;
  } | null>(null);

  // Use prop value if provided, otherwise fall back to state
  const isSaving = isSavingProp ?? state.isSaving;
  const hasViolations = violations.length > 0;
  const isLiveMode = liveMode?.isActive && liveMode.isGenerating;

  // Listen for help modal event from command
  useEffect(() => {
    const handleShowHelp = () => setIsHelpOpen(true);
    window.addEventListener("editor:show-help", handleShowHelp);
    return () => window.removeEventListener("editor:show-help", handleShowHelp);
  }, []);

  // Listen for AI chat events from commands
  useEffect(() => {
    const unsubscribe = onAIChatEvent((event: AIChatEvent) => {
      // Open the chat panel
      setIsAIChatOpen(true);

      // Set the pending action based on event type
      if (event.type === "quick-action" && event.quickAction) {
        setPendingAction({ type: "quick-action", quickAction: event.quickAction });
      } else if (event.type === "custom" && event.instruction) {
        setPendingAction({ type: "custom", instruction: event.instruction });
      } else if (event.type === "generate-image") {
        // Trigger image generation via DALL-E/Gemini
        setPendingAction({ type: "generate-image" });
      } else {
        // Just open, no action
        setPendingAction(null);
      }
    });

    return unsubscribe;
  }, []);

  // Clear pending action when consumed
  const consumePendingAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  // Handle AI transformation completion
  const handleAITransformComplete = useCallback(
    (result: SlideTransformResult) => {
      if (result.slide) {
        actions.aiReplaceSlide(state.selectedSlideIndex, result.slide);
      }
    },
    [actions, state.selectedSlideIndex]
  );

  // Handle repair all violations
  const handleRepairAll = useCallback(async () => {
    if (violations.length === 0) return;

    setIsRepairing(true);
    try {
      const response = await fetch(`/api/decks/${deckId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "repair_all" }),
      });

      const data = await response.json();

      if (data.success && data.slides) {
        // Replace slides one by one to ensure proper undo history
        // We loop through all slides and replace those that were changed
        for (let i = 0; i < data.slides.length; i++) {
          const repairedSlide = data.slides[i];
          const originalSlide = state.deck.slides[i];
          // Only update if the slide was actually changed
          if (JSON.stringify(repairedSlide) !== JSON.stringify(originalSlide)) {
            actions.aiReplaceSlide(i, repairedSlide);
          }
        }
      } else if (data.error) {
        console.error("Repair failed:", data.error);
        actions.setError(data.error.message || "Reparering feilet");
      }
    } catch (error) {
      console.error("Repair error:", error);
      actions.setError("Kunne ikke reparere feil");
    } finally {
      setIsRepairing(false);
    }
  }, [deckId, violations.length, state.deck.slides, actions]);

  return (
    <>
      {/* Live generation header (fixed position, above everything) */}
      {isLiveMode && liveMode && (
        <GenerationHeader
          progress={liveMode.progress}
          currentStage={liveMode.currentStage}
          slidesGenerated={liveMode.slidesGenerated}
          totalSlides={liveMode.totalSlides}
          isGeneratingImages={liveMode.isGeneratingImages}
          currentImageIndex={liveMode.currentImageIndex}
          totalImages={liveMode.totalImages}
          imagesCompleted={liveMode.imagesCompleted}
        />
      )}

      <div className={`h-screen flex flex-col bg-[#faf8f5] ${isLiveMode ? "pt-20" : ""}`}>
        {/* Header - ARTI Premium: Light glass with backdrop blur */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-[#e5e2dd] px-5 py-3 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left side - Minimal: Back + Title */}
            <div className="flex items-center gap-4">
              <Tooltip content="Tilbake til dashboard">
                <Link
                  href="/"
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
              </Tooltip>

              <input
                type="text"
                value={state.deck.deck.title}
                onChange={(e) => actions.updateDeckMeta({ title: e.target.value })}
                className="text-base font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-emerald-600/50 rounded-lg px-3 py-1.5 min-w-[200px] placeholder:text-gray-400 transition-all duration-200"
                placeholder="Presentasjonstittel"
              />
            </div>

            {/* Right side - Grouped actions */}
            <div className="flex items-center gap-1.5">
              {/* Undo/Redo Group */}
              <div className="flex items-center bg-[#f0ede8] rounded-lg p-0.5">
                <Tooltip content="Angre" shortcut={["⌘", "Z"]}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={actions.undo}
                    disabled={!canUndo}
                    className="!text-gray-500 hover:!text-gray-700 hover:!bg-[#e5e2dd] disabled:!text-gray-300 !rounded-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </Button>
                </Tooltip>
                <Tooltip content="Gjenta" shortcut={["⌘", "⇧", "Z"]}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={actions.redo}
                    disabled={!canRedo}
                    className="!text-gray-500 hover:!text-gray-700 hover:!bg-[#e5e2dd] disabled:!text-gray-300 !rounded-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                    </svg>
                  </Button>
                </Tooltip>
              </div>

              <div className="w-px h-5 bg-gray-200 mx-1" />

              {/* AI & Help Group */}
              <div className="flex items-center gap-1">
                <Tooltip content="AI-assistent" shortcut={["⌘", "J"]}>
                  <Button
                    variant={isAIChatOpen ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setIsAIChatOpen(!isAIChatOpen)}
                    className={isAIChatOpen
                      ? "!bg-gradient-to-r !from-emerald-500 !to-emerald-600 !border-0 !text-white !shadow-lg !shadow-emerald-500/20"
                      : "!text-gray-500 hover:!text-gray-700 hover:!bg-[#f0ede8]"
                    }
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <Tooltip content="Hurtigtaster" shortcut={["⌘", "?"]}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsHelpOpen(true)}
                    className="!text-gray-500 hover:!text-gray-700 hover:!bg-[#f0ede8]"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>

              <div className="w-px h-5 bg-gray-200 mx-1" />

              {/* Save status */}
              <SaveStatus
                isDirty={state.isDirty}
                isSaving={isSaving}
                lastSavedAt={lastSavedAt ?? null}
                error={saveError ?? null}
                violations={violations}
                onRepairAll={handleRepairAll}
                isRepairing={isRepairing}
              />

              {/* Action Buttons Group */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onSaveNow}
                  disabled={!state.isDirty || isSaving || hasViolations}
                  title={hasViolations ? `Kan ikke lagre: ${violations.length} feil må rettes` : undefined}
                  className="!bg-white !border-[#e5e2dd] !text-gray-700 hover:!bg-[#f5f3f0] hover:!text-gray-900 disabled:!bg-gray-50 disabled:!text-gray-300 disabled:!border-gray-200"
                >
                  Lagre
                </Button>

                {/* Export button */}
                {exportModal && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={exportModal.onOpen}
                    className="!bg-white !border-[#e5e2dd] !text-gray-700 hover:!bg-[#f5f3f0] hover:!text-gray-900"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Eksporter
                  </Button>
                )}

                {/* Share button - Primary action */}
                {shareModal && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={shareModal.onOpen}
                    className="!bg-gradient-to-r !from-emerald-600 !to-emerald-700 !border-0 hover:!from-emerald-500 hover:!to-emerald-600 !shadow-lg !shadow-emerald-500/20"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Del
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex overflow-hidden min-h-0">
          {/* Left panel - Slide list */}
          <SlideList className="w-56 flex-shrink-0" deckId={deckId} />

          {/* Center - Canvas with warm background */}
          <div className="flex-1 flex items-center justify-center p-8 min-w-0 overflow-auto bg-[#f0ede8]">
            {/* Slide container with subtle glow effect */}
            <div className="relative w-full max-w-4xl">
              {/* Ambient glow behind slide */}
              <div className="absolute inset-0 -m-4 bg-emerald-500/[0.03] blur-3xl rounded-3xl pointer-events-none" />
              {children}
            </div>
          </div>

          {/* Right panel - Inspector */}
          <Inspector className="w-72 flex-shrink-0" />
        </main>

        {/* Command Palette (⌘K) */}
        <CommandPalette />

        {/* AI Chat Panel */}
        <AIChat
          isOpen={isAIChatOpen}
          onClose={() => setIsAIChatOpen(false)}
          slide={currentSlide.slide}
          slideIndex={currentSlide.index}
          deckId={deckId}
          onTransformComplete={handleAITransformComplete}
          deckTitle={state.deck.deck.title}
          pendingAction={pendingAction}
          onPendingActionConsumed={consumePendingAction}
        />

        {/* Help Modal */}
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

        {/* Share Modal (controlled by parent) */}
        {shareModal && (
          <ShareModal
            isOpen={shareModal.isOpen}
            onClose={shareModal.onClose}
            deckId={deckId}
          />
        )}

        {/* Export Modal (controlled by parent) */}
        {exportModal && (
          <ExportModal
            isOpen={exportModal.isOpen}
            onClose={exportModal.onClose}
            deckId={deckId}
          />
        )}
      </div>
    </>
  );
}
