"use client";

/**
 * ThemeCard Component
 *
 * Visual theme selector card with mini slide preview.
 * Shows a realistic preview of how slides will look in each theme.
 */

import { motion } from "framer-motion";
import type { ThemeId } from "@/lib/themes";

interface ThemeCardProps {
  themeId: ThemeId;
  name: string;
  selected: boolean;
  onClick: () => void;
}

/**
 * Theme preview colors - matches actual theme tokens
 */
const THEME_PREVIEWS: Record<
  ThemeId,
  {
    background: string;
    cardBg: string;
    primary: string;
    accent: string;
    text: string;
    textMuted: string;
    border: string;
  }
> = {
  nordic_light: {
    background: "#f8fafc",
    cardBg: "#ffffff",
    primary: "#2563eb",
    accent: "#0891b2",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
  },
  nordic_dark: {
    background: "#0f172a",
    cardBg: "#1e293b",
    primary: "#3b82f6",
    accent: "#06b6d4",
    text: "#f1f5f9",
    textMuted: "#94a3b8",
    border: "#334155",
  },
  nordic_minimalism: {
    background: "#0f0f10",
    cardBg: "#18181b",
    primary: "#6366f1",
    accent: "#8b5cf6",
    text: "#fafafa",
    textMuted: "#a1a1aa",
    border: "#27272a",
  },
  corporate_blue: {
    background: "#1e40af",
    cardBg: "#1e3a8a",
    primary: "#60a5fa",
    accent: "#fbbf24",
    text: "#ffffff",
    textMuted: "#bfdbfe",
    border: "#3b82f6",
  },
  minimal_warm: {
    background: "#fffbeb",
    cardBg: "#ffffff",
    primary: "#d97706",
    accent: "#059669",
    text: "#292524",
    textMuted: "#78716c",
    border: "#fcd34d",
  },
  modern_contrast: {
    background: "#ffffff",
    cardBg: "#fafafa",
    primary: "#7c3aed",
    accent: "#ec4899",
    text: "#09090b",
    textMuted: "#71717a",
    border: "#e4e4e7",
  },
};

export function ThemeCard({ themeId, name, selected, onClick }: ThemeCardProps) {
  const colors = THEME_PREVIEWS[themeId];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative flex flex-col items-center gap-2 p-2
        rounded-xl transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2
        ${selected ? "ring-2 ring-purple-500 ring-offset-2 bg-purple-50" : "hover:bg-gray-50"}
      `}
    >
      {/* Mini slide preview */}
      <div
        className="relative w-full aspect-[16/10] rounded-lg overflow-hidden shadow-md"
        style={{ backgroundColor: colors.background }}
      >
        {/* Slide content preview */}
        <div className="absolute inset-2 flex flex-col">
          {/* Title bar */}
          <div className="h-2 w-3/4 rounded-sm mb-1.5" style={{ backgroundColor: colors.text }} />

          {/* Subtitle */}
          <div
            className="h-1 w-1/2 rounded-sm mb-3"
            style={{ backgroundColor: colors.textMuted }}
          />

          {/* Content area - 3 feature cards */}
          <div className="flex-1 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-1 rounded-sm p-1 flex flex-col"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {/* Icon circle */}
                <div
                  className="w-2 h-2 rounded-full mb-1"
                  style={{
                    backgroundColor:
                      i === 0 ? colors.primary : i === 1 ? colors.accent : colors.primary,
                    opacity: i === 2 ? 0.7 : 1,
                  }}
                />
                {/* Card title */}
                <div
                  className="h-0.5 w-3/4 rounded-sm mb-0.5"
                  style={{ backgroundColor: colors.text }}
                />
                {/* Card text lines */}
                <div
                  className="h-0.5 w-full rounded-sm opacity-50"
                  style={{ backgroundColor: colors.textMuted }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Selected overlay glow */}
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-purple-500/10 rounded-lg"
          />
        )}
      </div>

      {/* Theme name */}
      <span
        className={`
          text-xs font-medium transition-colors
          ${selected ? "text-purple-700" : "text-gray-600"}
        `}
      >
        {name}
      </span>

      {/* Selected indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-sm"
        >
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
