"use client";

/**
 * useSlashMenu Hook
 *
 * Provides slash menu functionality for contentEditable elements.
 * Handles trigger detection, menu positioning, and item selection.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  getCaretPosition,
  getSlashTriggerText,
  deleteSlashTrigger,
} from "@/lib/editor/caret-utils";
import type { SlashMenuItem } from "./SlashMenu";

// ============================================================================
// Types
// ============================================================================

export interface UseSlashMenuOptions {
  /** Callback when a slash command is selected */
  onCommand?: (commandId: string, item: SlashMenuItem) => void;
  /** Whether slash menu is enabled */
  enabled?: boolean;
}

export interface UseSlashMenuResult {
  /** Whether the slash menu is currently open */
  isOpen: boolean;
  /** Position for rendering the menu */
  position: { x: number; y: number };
  /** Current search query (text after "/") */
  query: string;
  /** Handler for input events */
  handleInput: (e: React.FormEvent<HTMLElement>) => void;
  /** Handler for keydown events (to prevent default on arrow keys) */
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  /** Handler when an item is selected */
  handleSelect: (item: SlashMenuItem) => void;
  /** Handler to close the menu */
  handleClose: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useSlashMenu(options: UseSlashMenuOptions = {}): UseSlashMenuResult {
  const { onCommand, enabled = true } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [query, setQuery] = useState("");

  // Track if we're currently showing the menu
  const isShowingRef = useRef(false);

  // Handle input in contentEditable
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      if (!enabled) return;

      const text = e.currentTarget.textContent || "";

      // Check for slash trigger
      const triggerText = getSlashTriggerText();

      if (triggerText !== null) {
        // We have a slash trigger - show or update menu
        const caretPos = getCaretPosition();
        if (caretPos) {
          setPosition({ x: caretPos.x, y: caretPos.y });
        }
        setQuery(triggerText);

        if (!isShowingRef.current) {
          setIsOpen(true);
          isShowingRef.current = true;
        }
      } else {
        // No slash trigger - close menu if open
        if (isShowingRef.current) {
          setIsOpen(false);
          isShowingRef.current = false;
          setQuery("");
        }
      }
    },
    [enabled]
  );

  // Handle keydown to prevent default on navigation keys when menu is open
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (!isOpen) return;

      // Let SlashMenu handle these keys
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "Enter" ||
        e.key === "Escape" ||
        e.key === "Tab"
      ) {
        // Don't prevent default here - SlashMenu's capture handler will do it
        // We just need to not interfere
      }
    },
    [isOpen]
  );

  // Handle item selection
  const handleSelect = useCallback(
    (item: SlashMenuItem) => {
      // Delete the slash trigger text
      deleteSlashTrigger();

      // Close menu
      setIsOpen(false);
      isShowingRef.current = false;
      setQuery("");

      // Notify parent
      onCommand?.(item.id, item);
    },
    [onCommand]
  );

  // Handle close
  const handleClose = useCallback(() => {
    setIsOpen(false);
    isShowingRef.current = false;
    setQuery("");
  }, []);

  // Close on outside interaction
  useEffect(() => {
    if (!isOpen) return;

    const handleBlur = () => {
      // Small delay to allow click on menu item
      setTimeout(() => {
        if (isShowingRef.current) {
          setIsOpen(false);
          isShowingRef.current = false;
          setQuery("");
        }
      }, 150);
    };

    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [isOpen]);

  return {
    isOpen,
    position,
    query,
    handleInput,
    handleKeyDown,
    handleSelect,
    handleClose,
  };
}
