"use client";

/**
 * SlideInteractionBar Component
 *
 * Floating toolbar that appears between slides with quick actions.
 * Disabled during generation, enables after completion.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, Copy, MoreHorizontal } from "lucide-react";

interface SlideInteractionBarProps {
  slideIndex: number;
  disabled?: boolean;
  onAddSlide?: (afterIndex: number) => void;
  onAIAssist?: (slideIndex: number) => void;
  onDuplicate?: (slideIndex: number) => void;
  onMore?: (slideIndex: number) => void;
}

export function SlideInteractionBar({
  slideIndex,
  disabled = false,
  onAddSlide,
  onAIAssist,
  onDuplicate,
  onMore,
}: SlideInteractionBarProps) {
  const buttonClasses = `
    p-2 rounded-lg transition-all duration-200
    ${
      disabled
        ? "text-gray-300 cursor-not-allowed"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:scale-95"
    }
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-center gap-1 py-2"
    >
      <div className="flex items-center gap-1 bg-white rounded-xl shadow-lg border border-gray-200 p-1">
        {/* Add slide */}
        <button
          type="button"
          onClick={() => !disabled && onAddSlide?.(slideIndex)}
          disabled={disabled}
          className={buttonClasses}
          title="Legg til slide"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* AI assist */}
        <button
          type="button"
          onClick={() => !disabled && onAIAssist?.(slideIndex)}
          disabled={disabled}
          className={`${buttonClasses} ${!disabled ? "hover:text-emerald-600 hover:bg-emerald-50" : ""}`}
          title="AI-assistanse"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Duplicate */}
        <button
          type="button"
          onClick={() => !disabled && onDuplicate?.(slideIndex)}
          disabled={disabled}
          className={buttonClasses}
          title="Dupliser slide"
        >
          <Copy className="w-4 h-4" />
        </button>

        {/* More options */}
        <button
          type="button"
          onClick={() => !disabled && onMore?.(slideIndex)}
          disabled={disabled}
          className={buttonClasses}
          title="Flere alternativer"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Compact version for sidebar thumbnails
 */
interface CompactInteractionBarProps {
  disabled?: boolean;
  onAdd?: () => void;
}

export function CompactInteractionBar({ disabled = false, onAdd }: CompactInteractionBarProps) {
  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onAdd?.()}
      disabled={disabled}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!disabled ? { scale: 1.1 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      className={`
        flex items-center justify-center
        w-6 h-6 rounded-full
        ${
          disabled
            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
            : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
        }
        transition-colors duration-200
      `}
      title="Legg til slide"
    >
      <Plus className="w-3 h-3" />
    </motion.button>
  );
}
