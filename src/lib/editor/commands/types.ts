/**
 * Command System Types
 *
 * Type definitions for the command registry system.
 * All editor actions can be registered as commands, enabling:
 * - Command Palette (⌘K)
 * - Slash Commands (/)
 * - Keyboard shortcuts
 * - Programmatic execution
 */

import type { ComponentType } from "react";
import type { EditorState, ConstraintViolation } from "@/lib/editor/types";
import type { Slide } from "@/lib/schemas/slide";
import type { Deck } from "@/lib/schemas/deck";

// ============================================================================
// Command Categories
// ============================================================================

/**
 * Command categories for grouping and styling
 */
export type CommandCategory = "edit" | "ai" | "slide" | "view" | "export";

/**
 * Category metadata for UI display
 */
export interface CategoryMeta {
  id: CommandCategory;
  label: string;
  color: string;
}

/**
 * Category display metadata
 */
export const CATEGORY_META: Record<CommandCategory, CategoryMeta> = {
  edit: { id: "edit", label: "Rediger", color: "gray" },
  ai: { id: "ai", label: "AI-assistent", color: "purple" },
  slide: { id: "slide", label: "Slide", color: "blue" },
  view: { id: "view", label: "Visning", color: "green" },
  export: { id: "export", label: "Eksporter", color: "orange" },
};

// ============================================================================
// Editor Context (for command execution)
// ============================================================================

/**
 * Actions available to commands
 */
export interface EditorActions {
  selectSlide: (index: number) => void;
  startEditing: (blockId: string) => void;
  stopEditing: () => void;
  updateDeckMeta: (meta: { title?: string; language?: string; themeId?: string }) => void;
  updateSlide: (index: number, slide: Partial<Slide>) => void;
  updateBlock: (slideIndex: number, blockIndex: number, block: Record<string, unknown>) => void;
  addSlide: (slide: Slide, index?: number) => void;
  deleteSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  undo: () => void;
  redo: () => void;
  markSaving: () => void;
  markSaved: () => void;
  setError: (error: string | null) => void;
  setViolations: (violations: Map<string, ConstraintViolation[]>) => void;
  replaceDeck: (deck: Deck) => void;
  aiReplaceSlide: (slideIndex: number, newSlide: Slide) => void;
  aiSplitSlide: (slideIndex: number, slides: Slide[]) => void;
}

/**
 * Context available to commands during execution
 */
export interface EditorContext {
  /** Current editor state */
  state: EditorState;
  /** Editor actions */
  actions: EditorActions;
  /** Currently selected slide (convenience) */
  currentSlide: Slide | null;
  /** Currently selected slide index */
  selectedSlideIndex: number;
  /** Currently editing block ID */
  selectedBlockId: string | null;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
}

// ============================================================================
// Command Definition
// ============================================================================

/**
 * Icon component type (Lucide-style)
 */
export type IconComponent = ComponentType<{ className?: string }>;

/**
 * Definition of a command that can be executed
 */
export interface CommandDefinition {
  /** Unique command ID (e.g., "editor.undo", "ai.simplify") */
  id: string;
  /** Display label (Norwegian) */
  label: string;
  /** Optional description for Command Palette */
  description?: string;
  /** Icon component (Lucide) */
  icon?: IconComponent;
  /** Keyboard shortcut display (e.g., "⌘Z", "⌘⇧Z") */
  shortcut?: string;
  /** Command category for grouping */
  category: CommandCategory;
  /**
   * Condition for command visibility/availability.
   * Return false to hide/disable the command.
   */
  when?: (context: EditorContext) => boolean;
  /**
   * Execute the command.
   * Can be async for AI operations.
   */
  execute: (context: EditorContext) => void | Promise<void>;
}

// ============================================================================
// Keyboard Shortcut Types
// ============================================================================

/**
 * Modifier keys
 */
export interface ShortcutModifiers {
  meta?: boolean;    // ⌘ on Mac, Ctrl on Windows
  ctrl?: boolean;    // Ctrl key specifically
  shift?: boolean;   // Shift key
  alt?: boolean;     // Alt/Option key
}

/**
 * Parsed keyboard shortcut
 */
export interface ParsedShortcut {
  key: string;
  modifiers: ShortcutModifiers;
}

/**
 * Parse a shortcut string like "⌘Z" or "⌘⇧Z" into components
 */
export function parseShortcut(shortcut: string): ParsedShortcut {
  const modifiers: ShortcutModifiers = {};
  let key = shortcut;

  // Parse modifiers
  if (key.includes("⌘") || key.includes("Cmd")) {
    modifiers.meta = true;
    key = key.replace(/⌘|Cmd/g, "");
  }
  if (key.includes("⌃") || key.includes("Ctrl")) {
    modifiers.ctrl = true;
    key = key.replace(/⌃|Ctrl/g, "");
  }
  if (key.includes("⇧") || key.includes("Shift")) {
    modifiers.shift = true;
    key = key.replace(/⇧|Shift/g, "");
  }
  if (key.includes("⌥") || key.includes("Alt") || key.includes("Option")) {
    modifiers.alt = true;
    key = key.replace(/⌥|Alt|Option/g, "");
  }

  // Clean up and normalize key
  key = key.trim().toLowerCase();

  // Handle special keys
  if (key === "⌫" || key === "backspace") key = "backspace";
  if (key === "⏎" || key === "enter" || key === "return") key = "enter";
  if (key === "⎋" || key === "esc") key = "escape";
  if (key === "⇥" || key === "tab") key = "tab";
  // Arrow keys
  if (key === "↑" || key === "arrowup" || key === "up") key = "arrowup";
  if (key === "↓" || key === "arrowdown" || key === "down") key = "arrowdown";
  if (key === "←" || key === "arrowleft" || key === "left") key = "arrowleft";
  if (key === "→" || key === "arrowright" || key === "right") key = "arrowright";

  return { key, modifiers };
}

/**
 * Check if a keyboard event matches a parsed shortcut
 */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: ParsedShortcut
): boolean {
  // Check modifiers
  const metaMatch = shortcut.modifiers.meta
    ? event.metaKey || event.ctrlKey
    : !event.metaKey && !event.ctrlKey;
  const shiftMatch = shortcut.modifiers.shift ? event.shiftKey : !event.shiftKey;
  const altMatch = shortcut.modifiers.alt ? event.altKey : !event.altKey;

  // Check key (case insensitive)
  const keyMatch = event.key.toLowerCase() === shortcut.key;

  return metaMatch && shiftMatch && altMatch && keyMatch;
}

// ============================================================================
// Command Registration Options
// ============================================================================

/**
 * Options for registering multiple commands at once
 */
export interface CommandRegistrationOptions {
  /** Override category for all commands */
  category?: CommandCategory;
  /** Prefix for command IDs */
  idPrefix?: string;
}

// ============================================================================
// Search Result Type
// ============================================================================

/**
 * Command search result with match highlighting
 */
export interface CommandSearchResult {
  /** The matched command */
  command: CommandDefinition;
  /** Search score (higher = better match) */
  score: number;
  /** Match ranges in label for highlighting */
  labelMatches: Array<{ start: number; end: number }>;
  /** Match ranges in description for highlighting */
  descriptionMatches?: Array<{ start: number; end: number }>;
}
