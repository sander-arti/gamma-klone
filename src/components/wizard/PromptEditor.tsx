"use client";

/**
 * PromptEditor Component
 *
 * Full Prompt Editor with 3-column layout similar to Gamma.
 * Left: Settings Panel
 * Middle: Content Preview
 * Right: Additional Instructions
 *
 * When slide count changes, shows confirmation dialog before regenerating outline.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Sparkles,
  AlertCircle,
  List,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui";
import { SettingsPanel } from "./SettingsPanel";
import { ContentPreview } from "./ContentPreview";
import { AdditionalInstructions } from "./AdditionalInstructions";
import { SlideCountSelector } from "./SlideCountSelector";
import type { ThemeId } from "@/lib/themes";
import type { Outline, OutlineSlide } from "@/lib/schemas/slide";
import type { GoldenTemplateId } from "@/lib/templates";

type TextMode = "generate" | "condense" | "preserve";
type Amount = "brief" | "medium" | "detailed";
type Language = "no" | "en" | "sv" | "da" | "de" | "fr";
type ImageMode = "none" | "ai";
type ImageStyle = "photorealistic" | "illustration" | "minimalist" | "isometric" | "editorial";

export interface PromptEditorState {
  // Text settings
  textMode: TextMode;
  amount: Amount;
  language: Language;

  // Theme
  themeId: ThemeId;

  // Image settings
  imageMode: ImageMode;
  imageStyle: ImageStyle;

  // Slide count
  targetSlideCount: number;

  // Additional instructions
  additionalInstructions: string;

  // Golden Template (Phase 8)
  templateId: GoldenTemplateId | null;
}

interface PromptEditorProps {
  /** Initial input text */
  inputText: string;
  /** Current outline (if generated) */
  outline: Outline | null;
  /** Current settings state */
  settings: PromptEditorState;
  /** Called when settings change */
  onSettingsChange: (settings: PromptEditorState) => void;
  /** Called when outline slides are reordered */
  onReorderSlides?: (slides: OutlineSlide[]) => void;
  /** Called when a slide title is edited */
  onEditSlide?: (index: number, newTitle: string) => void;
  /** Called when a slide is deleted */
  onDeleteSlide?: (index: number) => void;
  /** Called when adding a new slide */
  onAddSlide?: () => void;
  /** Called when going back */
  onBack: () => void;
  /** Called when regenerating outline (when outline exists) */
  onRegenerateOutline: () => void;
  /** Called when generating outline for the first time (optional feature) */
  onGenerateOutline?: () => void;
  /** Called when proceeding to generation */
  onGenerate: () => void;
  /** Whether actions are disabled (loading) */
  isLoading?: boolean;
  /** Whether outline is being generated */
  isGeneratingOutline?: boolean;
}

export function PromptEditor({
  inputText,
  outline,
  settings,
  onSettingsChange,
  onReorderSlides,
  onEditSlide,
  onDeleteSlide,
  onAddSlide,
  onBack,
  onRegenerateOutline,
  onGenerateOutline,
  onGenerate,
  isLoading = false,
  isGeneratingOutline = false,
}: PromptEditorProps) {
  // Track the original slide count from the outline
  const originalSlideCount = useRef<number>(settings.targetSlideCount);

  // State for slide count change confirmation dialog
  const [pendingSlideCount, setPendingSlideCount] = useState<number | null>(null);

  // Reset original slide count when outline changes
  useEffect(() => {
    if (outline) {
      originalSlideCount.current = outline.slides.length;
    }
  }, [outline]);

  // Update individual settings
  const updateSetting = useCallback(
    <K extends keyof PromptEditorState>(key: K, value: PromptEditorState[K]) => {
      onSettingsChange({ ...settings, [key]: value });
    },
    [settings, onSettingsChange]
  );

  // Handle slide count change with confirmation
  const handleSlideCountChange = useCallback(
    (newCount: number) => {
      // If changing from current outline's slide count, ask for confirmation
      if (outline && newCount !== outline.slides.length) {
        setPendingSlideCount(newCount);
      } else {
        // Same as current, just update
        updateSetting("targetSlideCount", newCount);
      }
    },
    [outline, updateSetting]
  );

  // Confirm slide count change and regenerate
  const confirmSlideCountChange = useCallback(() => {
    if (pendingSlideCount !== null) {
      updateSetting("targetSlideCount", pendingSlideCount);
      setPendingSlideCount(null);
      // Trigger regeneration after state update
      setTimeout(() => onRegenerateOutline(), 50);
    }
  }, [pendingSlideCount, updateSetting, onRegenerateOutline]);

  // Cancel slide count change
  const cancelSlideCountChange = useCallback(() => {
    setPendingSlideCount(null);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e5e2dd]">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Prompt Editor</h2>
          <p className="text-sm text-gray-500">Tilpass genereringen før du fortsetter</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Antall slides</p>
          <SlideCountSelector
            value={pendingSlideCount ?? settings.targetSlideCount}
            onChange={handleSlideCountChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Settings (25%) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-3 pr-6 border-r border-gray-100"
        >
          <SettingsPanel
            amount={settings.amount}
            onAmountChange={(v) => updateSetting("amount", v)}
            language={settings.language}
            onLanguageChange={(v) => updateSetting("language", v)}
            themeId={settings.themeId}
            onThemeChange={(v) => updateSetting("themeId", v)}
            imageMode={settings.imageMode}
            onImageModeChange={(v) => updateSetting("imageMode", v)}
            imageStyle={settings.imageStyle}
            onImageStyleChange={(v) => updateSetting("imageStyle", v)}
            templateId={settings.templateId}
            onTemplateChange={(v) => updateSetting("templateId", v)}
            disabled={isLoading}
          />
        </motion.div>

        {/* Middle column: Content Preview (50%) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-6 px-6"
        >
          <ContentPreview
            outline={outline}
            inputText={inputText}
            onReorder={onReorderSlides}
            onEditSlide={onEditSlide}
            onDeleteSlide={onDeleteSlide}
            onAddSlide={onAddSlide}
            onGenerateOutline={onGenerateOutline}
            isGeneratingOutline={isGeneratingOutline}
            disabled={isLoading || isGeneratingOutline}
          />
        </motion.div>

        {/* Right column: Additional Instructions (25%) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-3 pl-6 border-l border-gray-100"
        >
          <AdditionalInstructions
            value={settings.additionalInstructions}
            onChange={(v) => updateSetting("additionalInstructions", v)}
            disabled={isLoading}
          />
        </motion.div>
      </div>

      {/* Spacer for sticky footer */}
      <div className="h-24" />

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[#e5e2dd] shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={onBack} disabled={isLoading || isGeneratingOutline}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake
          </Button>

          {/* Outline button - changes based on whether outline exists */}
          {outline ? (
            <Button
              variant="secondary"
              onClick={onRegenerateOutline}
              disabled={isLoading || isGeneratingOutline}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Regenerer outline
            </Button>
          ) : onGenerateOutline ? (
            <Button
              variant="secondary"
              onClick={onGenerateOutline}
              disabled={isLoading || isGeneratingOutline}
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
          ) : null}

          {/* Generate button - always enabled (outline is optional) */}
          <Button onClick={onGenerate} disabled={isLoading || isGeneratingOutline}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generer presentasjon
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Slide Count Change Confirmation Dialog */}
      <AnimatePresence>
        {pendingSlideCount !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
            onClick={cancelSlideCountChange}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Regenerer outline?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Du har endret antall slides fra{" "}
                    <span className="font-medium">
                      {outline?.slides.length ?? settings.targetSlideCount}
                    </span>{" "}
                    til <span className="font-medium">{pendingSlideCount}</span>. Dette vil
                    regenerere hele outlinen.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="secondary" size="sm" onClick={cancelSlideCountChange}>
                      Avbryt
                    </Button>
                    <Button size="sm" onClick={confirmSlideCountChange}>
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                      Regenerer
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Default state for PromptEditor
 */
export function getDefaultPromptEditorState(): PromptEditorState {
  return {
    textMode: "generate",
    amount: "medium",
    language: "no",
    themeId: "nordic_light",
    imageMode: "ai", // Default to AI images for Gamma-level quality
    imageStyle: "photorealistic",
    targetSlideCount: 8,
    additionalInstructions: "",
    templateId: null, // null = dynamic mode (no Golden Template)
  };
}
