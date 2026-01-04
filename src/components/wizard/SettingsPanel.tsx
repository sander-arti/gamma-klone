"use client";

/**
 * SettingsPanel Component
 *
 * Left panel in the Prompt Editor with generation settings.
 * Includes amount (text density), language, theme, and image settings.
 *
 * Note: textMode is set in step 1 (input step) based on the creation mode:
 * - GenerateInput → "generate"
 * - PasteInput → user chooses "condense" or "preserve"
 * - ImportInput → "condense"
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  ImageIcon,
} from "lucide-react";
import { ThemeCardGrid } from "@/components/ui/ThemeCardGrid";
import { TemplateSelector } from "./TemplateSelector";
import type { ThemeId } from "@/lib/themes";
import type { GoldenTemplateId } from "@/lib/templates";

// Languages with flags
const LANGUAGES = [
  { code: "no", label: "Norsk", flag: "🇳🇴" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "da", label: "Dansk", flag: "🇩🇰" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
] as const;

// Text amount options (controls text density per slide, not slide count)
const AMOUNT_OPTIONS = [
  { value: "brief", label: "Kort", description: "Minimal tekst, bare nøkkelpunkter" },
  { value: "medium", label: "Medium", description: "Balansert mengde innhold" },
  { value: "detailed", label: "Detaljert", description: "Utfyllende forklaringer" },
] as const;

// Image mode options
const IMAGE_MODES = [
  { value: "none", label: "Ingen bilder" },
  { value: "ai", label: "AI-genererte bilder" },
] as const;

// Image style options
const IMAGE_STYLES = [
  { value: "photorealistic", label: "Fotorealistisk" },
  { value: "illustration", label: "Illustrasjon" },
  { value: "minimalist", label: "Minimalistisk" },
  { value: "isometric", label: "Isometrisk" },
  { value: "editorial", label: "Redaksjonell" },
] as const;

type Amount = (typeof AMOUNT_OPTIONS)[number]["value"];
type Language = (typeof LANGUAGES)[number]["code"];
type ImageMode = (typeof IMAGE_MODES)[number]["value"];
type ImageStyle = (typeof IMAGE_STYLES)[number]["value"];

interface SettingsPanelProps {
  // Text settings (textMode removed - set in step 1)
  amount: Amount;
  onAmountChange: (amount: Amount) => void;
  language: Language;
  onLanguageChange: (language: Language) => void;

  // Theme settings
  themeId: ThemeId;
  onThemeChange: (theme: ThemeId) => void;

  // Image settings
  imageMode: ImageMode;
  onImageModeChange: (mode: ImageMode) => void;
  imageStyle?: ImageStyle;
  onImageStyleChange?: (style: ImageStyle) => void;

  // Golden Template (Phase 8)
  templateId: GoldenTemplateId | null;
  onTemplateChange: (templateId: GoldenTemplateId | null) => void;

  // State
  disabled?: boolean;
}

export function SettingsPanel({
  amount,
  onAmountChange,
  language,
  onLanguageChange,
  themeId,
  onThemeChange,
  imageMode,
  onImageModeChange,
  imageStyle,
  onImageStyleChange,
  templateId,
  onTemplateChange,
  disabled = false,
}: SettingsPanelProps) {
  const [imageSettingsOpen, setImageSettingsOpen] = useState(imageMode !== "none");

  return (
    <div className="space-y-8">
      {/* Amount Selector (text density per slide) */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Tekstmengde</h3>
        <div className="flex gap-2">
          {AMOUNT_OPTIONS.map((option) => {
            const isSelected = amount === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => !disabled && onAmountChange(option.value)}
                disabled={disabled}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                  ${isSelected
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
                title={option.description}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Language Dropdown */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Språk</h3>
        <div className="relative">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            disabled={disabled}
            className={`
              w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border border-gray-200
              bg-white text-gray-900 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Theme Picker */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Tema</h3>
        <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
          <ThemeCardGrid
            selectedTheme={themeId}
            onSelect={onThemeChange}
          />
        </div>
      </section>

      {/* Image Settings (Collapsible) */}
      <section>
        <button
          type="button"
          onClick={() => setImageSettingsOpen(!imageSettingsOpen)}
          className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Bildeinnstillinger
          </span>
          {imageSettingsOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <AnimatePresence>
          {imageSettingsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-4">
                {/* Image Mode */}
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Bildekilde</label>
                  <div className="flex gap-2">
                    {IMAGE_MODES.map((mode) => {
                      const isSelected = imageMode === mode.value;
                      return (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => !disabled && onImageModeChange(mode.value)}
                          disabled={disabled}
                          className={`
                            flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all
                            ${isSelected
                              ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                              : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                            }
                            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                          `}
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Image Style (only when AI images are enabled) */}
                <AnimatePresence>
                  {imageMode === "ai" && onImageStyleChange && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <label className="text-xs text-gray-500 mb-2 block">Bildestil</label>
                      <div className="grid grid-cols-2 gap-2">
                        {IMAGE_STYLES.map((style) => {
                          const isSelected = imageStyle === style.value;
                          return (
                            <button
                              key={style.value}
                              type="button"
                              onClick={() => !disabled && onImageStyleChange(style.value)}
                              disabled={disabled}
                              className={`
                                py-2 px-3 rounded-lg text-xs font-medium transition-all
                                ${isSelected
                                  ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                                  : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                                }
                                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                              `}
                            >
                              {style.label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Golden Template Selector (Phase 8) */}
      <TemplateSelector
        selectedTemplate={templateId}
        onChange={onTemplateChange}
        disabled={disabled}
      />
    </div>
  );
}
