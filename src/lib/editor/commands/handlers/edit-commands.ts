/**
 * Edit Commands
 *
 * Basic editing commands: undo, redo, save, duplicate, delete, block navigation.
 */

import { Undo2, Redo2, Save, Copy, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import type { CommandDefinition } from "../types";
import { createBlockId, parseBlockId } from "@/lib/editor/constraints";

/**
 * Undo command
 */
export const undoCommand: CommandDefinition = {
  id: "edit.undo",
  label: "Angre",
  description: "Angre siste endring",
  icon: Undo2,
  shortcut: "⌘Z",
  category: "edit",
  when: (ctx) => ctx.canUndo,
  execute: (ctx) => {
    ctx.actions.undo();
  },
};

/**
 * Redo command
 */
export const redoCommand: CommandDefinition = {
  id: "edit.redo",
  label: "Gjør om",
  description: "Gjør om angret endring",
  icon: Redo2,
  shortcut: "⌘⇧Z",
  category: "edit",
  when: (ctx) => ctx.canRedo,
  execute: (ctx) => {
    ctx.actions.redo();
  },
};

/**
 * Save command
 */
export const saveCommand: CommandDefinition = {
  id: "edit.save",
  label: "Lagre",
  description: "Lagre presentasjonen",
  icon: Save,
  shortcut: "⌘S",
  category: "edit",
  when: (ctx) => ctx.state.isDirty && !ctx.state.isSaving,
  execute: (ctx) => {
    // Trigger save via marking as saving
    // The actual save logic is handled by EditorProvider's onSave callback
    ctx.actions.markSaving();
  },
};

/**
 * Duplicate slide command
 */
export const duplicateSlideCommand: CommandDefinition = {
  id: "edit.duplicate-slide",
  label: "Dupliser slide",
  description: "Lag en kopi av valgt slide",
  icon: Copy,
  shortcut: "⌘D",
  category: "edit",
  when: (ctx) => ctx.currentSlide !== null,
  execute: (ctx) => {
    ctx.actions.duplicateSlide(ctx.selectedSlideIndex);
  },
};

/**
 * Delete slide command
 */
export const deleteSlideCommand: CommandDefinition = {
  id: "edit.delete-slide",
  label: "Slett slide",
  description: "Fjern valgt slide",
  icon: Trash2,
  shortcut: "⌘⌫",
  category: "edit",
  when: (ctx) => ctx.currentSlide !== null && ctx.state.deck.slides.length > 1,
  execute: (ctx) => {
    ctx.actions.deleteSlide(ctx.selectedSlideIndex);
  },
};

/**
 * Focus next block command (Tab)
 */
export const focusNextBlockCommand: CommandDefinition = {
  id: "edit.focus-next-block",
  label: "Neste blokk",
  description: "Flytt fokus til neste blokk",
  icon: ArrowRight,
  shortcut: "⇥", // Tab
  category: "edit",
  when: (ctx) => ctx.currentSlide !== null,
  execute: (ctx) => {
    const slide = ctx.currentSlide;
    if (!slide) return;

    const blocks = slide.blocks;
    if (blocks.length === 0) return;

    // Get current block index
    let currentBlockIndex = -1;
    if (ctx.selectedBlockId) {
      const parsed = parseBlockId(ctx.selectedBlockId);
      if (parsed && parsed.slideIndex === ctx.selectedSlideIndex) {
        currentBlockIndex = parsed.blockIndex;
      }
    }

    // Calculate next block index (wrap around)
    const nextBlockIndex = (currentBlockIndex + 1) % blocks.length;
    const newBlockId = createBlockId(ctx.selectedSlideIndex, nextBlockIndex);
    ctx.actions.startEditing(newBlockId);
  },
};

/**
 * Focus previous block command (Shift+Tab)
 */
export const focusPrevBlockCommand: CommandDefinition = {
  id: "edit.focus-prev-block",
  label: "Forrige blokk",
  description: "Flytt fokus til forrige blokk",
  icon: ArrowLeft,
  shortcut: "⇧⇥", // Shift+Tab
  category: "edit",
  when: (ctx) => ctx.currentSlide !== null,
  execute: (ctx) => {
    const slide = ctx.currentSlide;
    if (!slide) return;

    const blocks = slide.blocks;
    if (blocks.length === 0) return;

    // Get current block index
    let currentBlockIndex = 0;
    if (ctx.selectedBlockId) {
      const parsed = parseBlockId(ctx.selectedBlockId);
      if (parsed && parsed.slideIndex === ctx.selectedSlideIndex) {
        currentBlockIndex = parsed.blockIndex;
      }
    }

    // Calculate previous block index (wrap around)
    const prevBlockIndex = currentBlockIndex <= 0 ? blocks.length - 1 : currentBlockIndex - 1;
    const newBlockId = createBlockId(ctx.selectedSlideIndex, prevBlockIndex);
    ctx.actions.startEditing(newBlockId);
  },
};

/**
 * Stop editing command (Escape)
 */
export const stopEditingCommand: CommandDefinition = {
  id: "edit.stop-editing",
  label: "Avslutt redigering",
  description: "Avslutt redigering av blokk",
  shortcut: "⎋", // Escape
  category: "edit",
  when: (ctx) => ctx.selectedBlockId !== null,
  execute: (ctx) => {
    ctx.actions.stopEditing();
  },
};

/**
 * All edit commands
 */
export const editCommands: CommandDefinition[] = [
  undoCommand,
  redoCommand,
  saveCommand,
  duplicateSlideCommand,
  deleteSlideCommand,
  focusNextBlockCommand,
  focusPrevBlockCommand,
  stopEditingCommand,
];
