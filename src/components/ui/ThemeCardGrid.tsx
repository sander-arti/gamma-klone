"use client";

/**
 * ThemeCardGrid Component
 *
 * Vertical list layout for theme selection with color swatches.
 * Optimized for narrow sidebar panels.
 */

import { useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { themes, type ThemeId } from "@/lib/themes";

interface ThemeCardGridProps {
  selectedTheme: ThemeId;
  onSelect: (themeId: ThemeId) => void;
}

const THEME_ORDER: ThemeId[] = [
  "nordic_minimalism",
  "nordic_light",
  "nordic_dark",
  "corporate_blue",
  "minimal_warm",
  "modern_contrast",
];

/**
 * Color swatches for each theme - shows key colors
 */
const THEME_COLORS: Record<ThemeId, { bg: string; primary: string; accent: string }> = {
  nordic_minimalism: {
    bg: "#0f0f10",
    primary: "#6366f1",
    accent: "#8b5cf6",
  },
  nordic_light: {
    bg: "#f8fafc",
    primary: "#2563eb",
    accent: "#0891b2",
  },
  nordic_dark: {
    bg: "#0f172a",
    primary: "#3b82f6",
    accent: "#06b6d4",
  },
  corporate_blue: {
    bg: "#1e40af",
    primary: "#60a5fa",
    accent: "#fbbf24",
  },
  minimal_warm: {
    bg: "#faf8f5",
    primary: "#c2410c",
    accent: "#b45309",
  },
  modern_contrast: {
    bg: "#ffffff",
    primary: "#7c3aed",
    accent: "#ec4899",
  },
};

export function ThemeCardGrid({ selectedTheme, onSelect }: ThemeCardGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = THEME_ORDER.indexOf(selectedTheme);
      let newIndex = currentIndex;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          newIndex = (currentIndex + 1) % THEME_ORDER.length;
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          newIndex = (currentIndex - 1 + THEME_ORDER.length) % THEME_ORDER.length;
          break;
        case "Home":
          e.preventDefault();
          newIndex = 0;
          break;
        case "End":
          e.preventDefault();
          newIndex = THEME_ORDER.length - 1;
          break;
        default:
          return;
      }

      if (newIndex !== currentIndex) {
        onSelect(THEME_ORDER[newIndex]);
      }
    },
    [selectedTheme, onSelect]
  );

  // Focus management
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const selectedButton = container.querySelector(
      `[data-theme-id="${selectedTheme}"]`
    ) as HTMLButtonElement | null;

    if (selectedButton && document.activeElement?.closest('[role="radiogroup"]') === container) {
      selectedButton.focus();
    }
  }, [selectedTheme]);

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="Velg tema"
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-2"
    >
      {THEME_ORDER.map((themeId) => {
        const theme = themes[themeId];
        const colors = THEME_COLORS[themeId];
        const isSelected = selectedTheme === themeId;

        return (
          <button
            key={themeId}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-theme-id={themeId}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(themeId)}
            className={`
              relative flex items-center gap-3 py-2.5 px-3 rounded-xl border-2 transition-all text-left
              focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1
              ${
                isSelected
                  ? "border-transparent bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }
            `}
          >
            {/* Color swatches */}
            <div className="flex items-center gap-1 shrink-0">
              <div
                className="w-5 h-5 rounded-md border border-gray-200 shadow-sm"
                style={{ backgroundColor: colors.bg }}
                title="Bakgrunn"
              />
              <div
                className="w-5 h-5 rounded-md shadow-sm"
                style={{ backgroundColor: colors.primary }}
                title="Primærfarge"
              />
              <div
                className="w-5 h-5 rounded-md shadow-sm"
                style={{ backgroundColor: colors.accent }}
                title="Aksentfarge"
              />
            </div>

            {/* Theme name */}
            <span
              className={`text-sm font-medium truncate ${isSelected ? "text-emerald-700" : "text-gray-700"}`}
            >
              {theme.name}
            </span>

            {/* Selected indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </motion.div>
            )}

            {/* Animated border */}
            {isSelected && (
              <motion.div
                layoutId="themeIndicator"
                className="absolute inset-0 border-2 border-emerald-500 rounded-xl pointer-events-none"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
