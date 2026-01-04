/**
 * Command Keyboard Handler
 *
 * React hook for handling keyboard shortcuts tied to commands.
 * Respects contentEditable elements and other focus states.
 */

import { useEffect, useCallback, useRef } from "react";
import { commandRegistry } from "./registry";
import type { EditorContext } from "./types";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Tags that should block command shortcuts when focused
 */
const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * Commands that should work even in editable elements
 */
const PASSTHROUGH_COMMANDS = new Set([
  "edit.save", // ⌘S should always work
]);

// ============================================================================
// Helpers
// ============================================================================

/**
 * Check if the currently focused element is editable.
 */
function isEditableElementFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  // Check for input-like elements
  if (EDITABLE_TAGS.has(activeElement.tagName)) {
    return true;
  }

  // Check for contentEditable
  if (
    activeElement instanceof HTMLElement &&
    (activeElement.isContentEditable || activeElement.contentEditable === "true")
  ) {
    return true;
  }

  // Check for elements with role="textbox"
  if (activeElement.getAttribute("role") === "textbox") {
    return true;
  }

  return false;
}

/**
 * Check if a command should be blocked in current context.
 */
function shouldBlockCommand(commandId: string): boolean {
  // Always allow passthrough commands
  if (PASSTHROUGH_COMMANDS.has(commandId)) {
    return false;
  }

  // Block if in editable element
  return isEditableElementFocused();
}

// ============================================================================
// Hook
// ============================================================================

export interface UseCommandKeyboardOptions {
  /** Whether keyboard handling is enabled */
  enabled?: boolean;
  /** Callback when a command is executed */
  onCommandExecuted?: (commandId: string) => void;
  /** Custom command filter */
  commandFilter?: (commandId: string) => boolean;
}

/**
 * Hook for handling keyboard shortcuts tied to commands.
 *
 * @param getContext - Function to get the current EditorContext
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * useCommandKeyboard(() => ({
 *   state,
 *   actions,
 *   currentSlide,
 *   selectedSlideIndex: state.selectedSlideIndex,
 *   selectedBlockId: state.editingBlockId,
 *   canUndo: state.history.past.length > 0,
 *   canRedo: state.history.future.length > 0,
 * }));
 * ```
 */
export function useCommandKeyboard(
  getContext: () => EditorContext,
  options: UseCommandKeyboardOptions = {}
): void {
  const { enabled = true, onCommandExecuted, commandFilter } = options;

  // Store getContext in ref to avoid dependency issues
  const getContextRef = useRef(getContext);
  getContextRef.current = getContext;

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      // Skip if disabled
      if (!enabled) return;

      // Find matching command
      const command = commandRegistry.findByShortcut(event);
      if (!command) return;

      // Check custom filter
      if (commandFilter && !commandFilter(command.id)) return;

      // Check if we should block this command (e.g., in contentEditable)
      if (shouldBlockCommand(command.id)) {
        // For undo/redo in contentEditable, let the browser handle it
        if (command.id === "edit.undo" || command.id === "edit.redo") {
          return;
        }
      }

      // Get current context
      const context = getContextRef.current();

      // Check if command is available
      if (command.when && !command.when(context)) return;

      // Prevent default browser behavior
      event.preventDefault();
      event.stopPropagation();

      // Execute command
      try {
        await commandRegistry.execute(command.id, context);
        onCommandExecuted?.(command.id);
      } catch (error) {
        console.error(`Failed to execute command "${command.id}":`, error);
      }
    },
    [enabled, onCommandExecuted, commandFilter]
  );

  useEffect(() => {
    if (!enabled) return;

    // Use capture phase to handle shortcuts before other handlers
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [enabled, handleKeyDown]);
}

// ============================================================================
// Utility Hook: Command Palette Trigger
// ============================================================================

export interface UseCommandPaletteOptions {
  /** Callback when palette should open */
  onOpen: () => void;
  /** Callback when palette should close (optional) */
  onClose?: () => void;
  /** Whether the palette is currently open */
  isOpen?: boolean;
}

/**
 * Hook for handling ⌘K to open the Command Palette.
 * Separated from main keyboard handler for cleaner composition.
 */
export function useCommandPaletteTrigger(options: UseCommandPaletteOptions): void {
  const { onOpen, onClose, isOpen = false } = options;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMeta = event.metaKey || event.ctrlKey;

      // ⌘K to toggle palette
      if (isMeta && event.key === "k") {
        event.preventDefault();
        event.stopPropagation();

        if (isOpen) {
          onClose?.();
        } else {
          onOpen();
        }
        return;
      }

      // Escape to close palette
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        onClose?.();
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [onOpen, onClose, isOpen]);
}
