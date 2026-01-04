"use client";

/**
 * AIActionsMenu Component
 *
 * Dropdown menu for AI-driven slide editing actions.
 * Shows "Kort ned" (shorten) and "Del i to" (split) options.
 */

import { useState, useRef, useEffect } from "react";
import { useSlideAIActions } from "@/lib/hooks/useSlideAIActions";
import { Button, LoadingSpinner, useToast } from "@/components/ui";

interface AIActionsMenuProps {
  /** Deck ID for API calls */
  deckId: string;
  /** Slide index to perform actions on */
  slideIndex: number;
  /** Whether to show the menu (e.g., only when slide has violations) */
  show?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function AIActionsMenu({
  deckId,
  slideIndex,
  show = true,
  className = "",
}: AIActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { shorten, split, isLoading, currentAction, error, clearError } = useSlideAIActions(
    deckId,
    slideIndex
  );
  const { addToast } = useToast();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close menu and clear error on successful action
  const handleShorten = async () => {
    clearError();
    const success = await shorten();
    if (success) {
      setIsOpen(false);
      addToast({ type: "success", message: "Slide kortet ned", duration: 2000 });
    } else {
      addToast({ type: "error", message: "Kunne ikke korte ned slide" });
    }
  };

  const handleSplit = async () => {
    clearError();
    const success = await split();
    if (success) {
      setIsOpen(false);
      addToast({ type: "success", message: "Slide delt i to", duration: 2000 });
    } else {
      addToast({ type: "error", message: "Kunne ikke dele slide" });
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`
          p-1.5 rounded transition-colors
          ${isLoading ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-500"}
        `}
        title="AI-handlinger"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" label="AI-handlinger" />
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isLoading && (
        <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]">
          {/* Shorten option */}
          <button
            onClick={handleShorten}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <span>Kort ned</span>
          </button>

          {/* Split option */}
          <button
            onClick={handleSplit}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <span>Del i to</span>
          </button>
        </div>
      )}

      {/* Error display (inline) */}
      {error && (
        <div className="absolute left-0 top-full mt-1 bg-red-50 border border-red-200 rounded-lg p-2 shadow-lg z-50 min-w-[200px]">
          <p className="text-xs text-red-700">{error}</p>
          <button onClick={clearError} className="text-xs text-red-600 hover:text-red-800 mt-1">
            Lukk
          </button>
        </div>
      )}
    </div>
  );
}
