"use client";

/**
 * SlideCountSelector Component
 *
 * Visual selector for target number of slides.
 * Uses +/- buttons with animated number display.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Layers } from "lucide-react";

const MIN_SLIDES = 3;
const MAX_SLIDES = 30;

interface SlideCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function SlideCountSelector({ value, onChange, disabled = false }: SlideCountSelectorProps) {
  const handleDecrement = () => {
    if (!disabled && value > MIN_SLIDES) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (!disabled && value < MAX_SLIDES) {
      onChange(value + 1);
    }
  };

  const canDecrement = value > MIN_SLIDES;
  const canIncrement = value < MAX_SLIDES;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3">
        {/* Decrement button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || !canDecrement}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-all
            ${
              disabled || !canDecrement
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95"
            }
          `}
          aria-label="Reduser antall slides"
        >
          <Minus className="w-5 h-5" />
        </button>

        {/* Number display */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Background circle */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 border-2 border-emerald-200" />

          {/* Animated number */}
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -10 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              className="relative text-3xl font-bold text-emerald-700 tabular-nums"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Increment button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || !canIncrement}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-all
            ${
              disabled || !canIncrement
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 active:scale-95"
            }
          `}
          aria-label="Øk antall slides"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Label */}
      <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
        <Layers className="w-4 h-4" />
        <span>slides</span>
      </div>

      {/* Range indicator */}
      <p className="mt-1 text-xs text-gray-400">
        {MIN_SLIDES}–{MAX_SLIDES} slides
      </p>
    </div>
  );
}

/**
 * Compact inline version for smaller spaces
 */
interface CompactSlideCountProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function CompactSlideCount({ value, onChange, disabled = false }: CompactSlideCountProps) {
  const handleDecrement = () => {
    if (!disabled && value > MIN_SLIDES) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (!disabled && value < MAX_SLIDES) {
      onChange(value + 1);
    }
  };

  return (
    <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= MIN_SLIDES}
        className={`
          w-7 h-7 rounded-md flex items-center justify-center transition-all
          ${
            disabled || value <= MIN_SLIDES
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-white hover:shadow-sm active:scale-95"
          }
        `}
      >
        <Minus className="w-4 h-4" />
      </button>

      <span className="w-8 text-center text-sm font-medium text-gray-700 tabular-nums">
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= MAX_SLIDES}
        className={`
          w-7 h-7 rounded-md flex items-center justify-center transition-all
          ${
            disabled || value >= MAX_SLIDES
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-white hover:shadow-sm active:scale-95"
          }
        `}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
