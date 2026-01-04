"use client";

/**
 * ArtStylePicker Component
 *
 * Visual picker for AI image generation art styles.
 * Shows example thumbnails for each style.
 */

import { motion } from "framer-motion";
import {
  Camera,
  Palette,
  Shapes,
  Box,
  PenTool,
  Sparkles,
} from "lucide-react";
import type { ImageArtStyle } from "@/lib/schemas/deck";

interface ArtStyleOption {
  value: ImageArtStyle;
  label: string;
  description: string;
  icon: typeof Camera;
  gradient: string;
  keywords: string[];
}

const ART_STYLES: ArtStyleOption[] = [
  {
    value: "photo",
    label: "Foto",
    description: "Realistiske, fotografiske bilder",
    icon: Camera,
    gradient: "from-gray-700 to-gray-900",
    keywords: ["realistisk", "fotografisk", "naturlig lys"],
  },
  {
    value: "illustration",
    label: "Illustrasjon",
    description: "Håndtegnede, kunstneriske bilder",
    icon: Palette,
    gradient: "from-orange-400 to-pink-500",
    keywords: ["håndtegnet", "kunstnerisk", "fargerikt"],
  },
  {
    value: "abstract",
    label: "Abstrakt",
    description: "Moderne, abstrakte former",
    icon: Shapes,
    gradient: "from-emerald-500 to-teal-600",
    keywords: ["abstrakt", "moderne", "geometrisk"],
  },
  {
    value: "3d",
    label: "3D",
    description: "Tredimensjonale rendringer",
    icon: Box,
    gradient: "from-cyan-400 to-blue-500",
    keywords: ["3d render", "volumetrisk", "dybde"],
  },
  {
    value: "line_art",
    label: "Linjetegning",
    description: "Enkle strektegninger",
    icon: PenTool,
    gradient: "from-gray-300 to-gray-500",
    keywords: ["linjetegning", "minimalistisk", "skisse"],
  },
  {
    value: "custom",
    label: "Egendefinert",
    description: "Beskriv din egen stil",
    icon: Sparkles,
    gradient: "from-emerald-400 to-emerald-600",
    keywords: [],
  },
];

interface ArtStylePickerProps {
  value: ImageArtStyle;
  onChange: (style: ImageArtStyle) => void;
  disabled?: boolean;
}

export function ArtStylePicker({
  value,
  onChange,
  disabled = false,
}: ArtStylePickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {ART_STYLES.map((style) => {
        const Icon = style.icon;
        const isSelected = value === style.value;

        return (
          <motion.button
            key={style.value}
            type="button"
            onClick={() => !disabled && onChange(style.value)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            className={`
              relative flex flex-col items-center p-4 rounded-xl border-2 transition-all
              ${isSelected
                ? "border-emerald-500 bg-emerald-50 shadow-lg"
                : "border-gray-200 hover:border-gray-300 bg-white"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {/* Icon with gradient background */}
            <div
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-3
                bg-gradient-to-br ${style.gradient}
              `}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Label */}
            <span className={`
              text-sm font-medium
              ${isSelected ? "text-emerald-700" : "text-gray-900"}
            `}>
              {style.label}
            </span>

            {/* Description */}
            <span className="text-xs text-gray-500 text-center mt-1 line-clamp-2">
              {style.description}
            </span>

            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * Get suggested keywords for an art style
 */
export function getArtStyleKeywords(style: ImageArtStyle): string[] {
  const found = ART_STYLES.find((s) => s.value === style);
  return found?.keywords ?? [];
}

/**
 * Get art style display info
 */
export function getArtStyleInfo(style: ImageArtStyle): ArtStyleOption | undefined {
  return ART_STYLES.find((s) => s.value === style);
}
