"use client";

/**
 * New Presentation Wizard Page
 *
 * Multi-step wizard for creating AI-generated presentations.
 * Supports multiple creation modes:
 * - generate: Create from topic/prompt
 * - paste: Create from pasted text/notes
 * - import: Create from uploaded file (PDF, DOCX, TXT)
 */

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  WizardStepper,
  GenerateInput,
  PasteInput,
  ImportInput,
  PromptEditor,
  getDefaultPromptEditorState,
  GenerateStep,
  type InputData,
  type PromptEditorState,
} from "@/components/wizard";
import { LoadingSpinner, Button } from "@/components/ui";
import type { Outline, OutlineSlide } from "@/lib/schemas/slide";
import type { ThemeId } from "@/lib/themes";

type CreationMode = "generate" | "paste" | "import";

const MODE_TITLES: Record<CreationMode, string> = {
  generate: "Generer fra emne",
  paste: "Lag fra tekst",
  import: "Importer fil",
};

const STEPS = [
  { id: "input", title: "Innhold" },
  { id: "outline", title: "Outline" },
  { id: "generate", title: "Generer" },
];

function NewPresentationContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as CreationMode) || "generate";

  const [currentStep, setCurrentStep] = useState(0);

  // Step 1 data
  const [inputData, setInputData] = useState<InputData | null>(null);

  // Step 2 data - Prompt Editor state
  const [outline, setOutline] = useState<Outline | null>(null);
  const [isLoadingOutline, setIsLoadingOutline] = useState(false);
  const [outlineError, setOutlineError] = useState<string | null>(null);
  const [promptEditorState, setPromptEditorState] = useState<PromptEditorState>(
    getDefaultPromptEditorState()
  );

  // Step 3 data - generationId for streaming
  const [generationId, setGenerationId] = useState<string | null>(null);

  // Generate outline when moving to step 2
  const generateOutline = useCallback(async (data: InputData) => {
    setIsLoadingOutline(true);
    setOutlineError(null);

    try {
      const res = await fetch("/api/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText: data.inputText,
          textMode: data.textMode,
          language: data.language,
          amount: data.amount,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Kunne ikke generere outline");
      }

      const { outline } = await res.json();
      setOutline(outline);
    } catch (err) {
      setOutlineError(err instanceof Error ? err.message : "Kunne ikke generere outline");
    } finally {
      setIsLoadingOutline(false);
    }
  }, []);

  // Start full generation when moving to step 3
  // Freeform-first: outline is optional - if not provided, API will generate it inline
  const startGeneration = useCallback(
    async (finalOutline?: Outline | null) => {
      if (!inputData) return;

      setGenerationId(null);

      try {
        const res = await fetch("/api/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inputText: inputData.inputText,
            textMode: promptEditorState.textMode,
            language: promptEditorState.language,
            themeId: promptEditorState.themeId,
            amount: promptEditorState.amount,
            // Freeform-first: outline is optional - pass undefined if null
            outline: finalOutline || undefined,
            // Include additional settings from PromptEditor
            additionalInstructions: promptEditorState.additionalInstructions || undefined,
            imageMode: promptEditorState.imageMode,
            imageStyle:
              promptEditorState.imageMode === "ai" ? promptEditorState.imageStyle : undefined,
            numSlides: promptEditorState.targetSlideCount,
            // Golden Template (Phase 8) - when set, AI fills content into fixed structure
            templateId: promptEditorState.templateId || undefined,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error?.message || "Generering feilet");
        }

        const data = await res.json();
        setGenerationId(data.generationId);
      } catch (err) {
        console.error("Failed to start generation:", err);
        setGenerationId(null);
      }
    },
    [inputData, promptEditorState]
  );

  // Handle generating outline on-demand (freeform-first: optional feature)
  const handleGenerateOutline = useCallback(async () => {
    if (!inputData) return;
    setIsLoadingOutline(true);
    setOutlineError(null);

    try {
      const res = await fetch("/api/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText: inputData.inputText,
          textMode: promptEditorState.textMode,
          language: promptEditorState.language,
          amount: promptEditorState.amount,
          numSlides: promptEditorState.targetSlideCount,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Kunne ikke generere outline");
      }

      const data = await res.json();
      setOutline(data.outline);
    } catch (err) {
      setOutlineError(err instanceof Error ? err.message : "Kunne ikke generere outline");
    } finally {
      setIsLoadingOutline(false);
    }
  }, [inputData, promptEditorState]);

  // Step handlers
  const handleInputNext = (data: InputData) => {
    setInputData(data);
    // Initialize PromptEditorState from input data
    setPromptEditorState((prev) => ({
      ...prev,
      textMode: data.textMode ?? prev.textMode,
      language: (data.language as PromptEditorState["language"]) ?? prev.language,
      themeId: (data.themeId as ThemeId) ?? prev.themeId,
      amount: (data.amount as PromptEditorState["amount"]) ?? prev.amount,
    }));
    setCurrentStep(1);
    // Freeform-first: Ingen auto-outline - bruker går rett til Prompt Editor
    // Outline genereres kun hvis bruker eksplisitt ber om det
  };

  const handleOutlineBack = () => {
    setCurrentStep(0);
  };

  // Freeform-first: proceed to generation with or without outline
  const handleOutlineNext = () => {
    setCurrentStep(2);
    // Pass outline if available, otherwise API will generate it inline
    startGeneration(outline);
  };

  const handleOutlineRegenerate = () => {
    if (inputData) {
      // Update inputData with current promptEditorState settings
      const updatedInputData: InputData = {
        ...inputData,
        textMode: promptEditorState.textMode,
        language: promptEditorState.language,
        themeId: promptEditorState.themeId,
        amount: promptEditorState.amount,
      };
      generateOutline(updatedInputData);
    }
  };

  // Outline editing handlers
  const handleReorderSlides = (slides: OutlineSlide[]) => {
    if (!outline) return;
    setOutline({ ...outline, slides });
  };

  const handleEditSlide = (index: number, newTitle: string) => {
    if (!outline) return;
    const newSlides = [...outline.slides];
    newSlides[index] = { ...newSlides[index], title: newTitle };
    setOutline({ ...outline, slides: newSlides });
  };

  const handleDeleteSlide = (index: number) => {
    if (!outline || outline.slides.length <= 1) return;
    const newSlides = outline.slides.filter((_, i) => i !== index);
    setOutline({ ...outline, slides: newSlides });
  };

  const handleAddSlide = () => {
    if (!outline) return;
    const newSlide: OutlineSlide = { title: "Ny slide" };
    setOutline({
      ...outline,
      slides: [...outline.slides, newSlide],
    });
  };

  const handleGenerateBack = () => {
    setGenerationId(null);
    setCurrentStep(1);
  };

  // Freeform-first: retry works with or without outline
  const handleGenerateRetry = () => {
    startGeneration(outline);
  };

  // Get themeId for streaming preview (from promptEditorState)
  const themeId: ThemeId = promptEditorState.themeId;

  // Render mode-specific input
  const renderModeInput = () => {
    switch (mode) {
      case "paste":
        return <PasteInput onNext={handleInputNext} initialData={inputData ?? undefined} />;
      case "import":
        return <ImportInput onNext={handleInputNext} initialData={inputData ?? undefined} />;
      case "generate":
      default:
        return <GenerateInput onNext={handleInputNext} initialData={inputData ?? undefined} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-[#e5e2dd]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Avbryt
            </Link>
            <div className="text-center">
              <h1 className="text-lg font-medium text-gray-900">Ny presentasjon</h1>
              <p className="text-sm text-gray-500">{MODE_TITLES[mode]}</p>
            </div>
            <div className="w-20" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#e5e2dd] py-6">
        <WizardStepper steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {currentStep === 0 && renderModeInput()}

        {currentStep === 1 && (
          <>
            {isLoadingOutline ? (
              <div className="flex flex-col items-center justify-center py-16">
                <LoadingSpinner size="lg" label="Genererer outline" />
                <p className="mt-4 text-gray-600">Genererer outline...</p>
                <p className="text-sm text-gray-400 mt-2">Dette tar vanligvis 5-10 sekunder</p>
              </div>
            ) : outlineError ? (
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Kunne ikke generere outline
                </h3>
                <p className="text-gray-500 mb-6">{outlineError}</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="secondary" onClick={handleOutlineBack}>
                    Tilbake
                  </Button>
                  <Button onClick={handleOutlineRegenerate}>Prøv igjen</Button>
                </div>
              </div>
            ) : (
              <PromptEditor
                inputText={inputData?.inputText ?? ""}
                outline={outline}
                settings={promptEditorState}
                onSettingsChange={setPromptEditorState}
                onReorderSlides={handleReorderSlides}
                onEditSlide={handleEditSlide}
                onDeleteSlide={handleDeleteSlide}
                onAddSlide={handleAddSlide}
                onBack={handleOutlineBack}
                onRegenerateOutline={handleOutlineRegenerate}
                onGenerateOutline={handleGenerateOutline}
                onGenerate={handleOutlineNext}
                isLoading={isLoadingOutline}
                isGeneratingOutline={isLoadingOutline}
              />
            )}
          </>
        )}

        {currentStep === 2 && (
          <GenerateStep
            generationId={generationId}
            outline={outline}
            themeId={themeId}
            onBack={handleGenerateBack}
            onRetry={handleGenerateRetry}
          />
        )}
      </main>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function NewPresentationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      }
    >
      <NewPresentationContent />
    </Suspense>
  );
}
