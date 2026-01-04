"use client";

/**
 * ImageSettingsPanel Component
 *
 * Comprehensive image settings panel with art style picker,
 * keywords input, and image source selection.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Sparkles, ImageOff } from "lucide-react";
import { ArtStylePicker, getArtStyleKeywords } from "./ArtStylePicker";
import { StyleKeywordsInput } from "./StyleKeywordsInput";
import type { ImageArtStyle } from "@/lib/schemas/deck";

type ImageMode = "none" | "ai";

interface ImageSettingsPanelProps {
  imageMode: ImageMode;
  onImageModeChange: (mode: ImageMode) => void;
  artStyle: ImageArtStyle;
  onArtStyleChange: (style: ImageArtStyle) => void;
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  disabled?: boolean;
}

export function ImageSettingsPanel({
  imageMode,
  onImageModeChange,
  artStyle,
  onArtStyleChange,
  keywords,
  onKeywordsChange,
  disabled = false,
}: ImageSettingsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(imageMode === "ai");

  // Auto-add suggested keywords when art style changes
  useEffect(() => {
    if (artStyle !== "custom" && keywords.length === 0) {
      const suggested = getArtStyleKeywords(artStyle);
      if (suggested.length > 0) {
        onKeywordsChange(suggested.slice(0, 3));
      }
    }
  }, [artStyle, keywords.length, onKeywordsChange]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Bilder</h3>
            <p className="text-xs text-gray-500">Velg hvordan bilder skal genereres</p>
          </div>
        </div>
      </div>

      {/* Image Mode Toggle */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            onImageModeChange("none");
            setIsExpanded(false);
          }}
          disabled={disabled}
          className={`
            flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all
            ${
              imageMode === "none"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <ImageOff className="w-5 h-5" />
          <span className="font-medium">Ingen bilder</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onImageModeChange("ai");
            setIsExpanded(true);
          }}
          disabled={disabled}
          className={`
            flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all
            ${
              imageMode === "ai"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI-bilder</span>
        </button>
      </div>

      {/* Expanded AI settings */}
      <AnimatePresence>
        {imageMode === "ai" && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-6 pt-4 border-t border-gray-100">
              {/* Art Style Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Bildestil</label>
                <ArtStylePicker value={artStyle} onChange={onArtStyleChange} disabled={disabled} />
              </div>

              {/* Keywords Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Stil-nøkkelord
                </label>
                <StyleKeywordsInput
                  value={keywords}
                  onChange={onKeywordsChange}
                  disabled={disabled}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Nøkkelord påvirker hvordan AI genererer bildene
                </p>
              </div>

              {/* Preview hint */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">
                      AI vil generere unike bilder
                    </p>
                    <p className="text-xs text-emerald-700 mt-1">
                      Basert på presentasjonsinnholdet og valgt stil vil AI lage relevante bilder
                      for hver slide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
