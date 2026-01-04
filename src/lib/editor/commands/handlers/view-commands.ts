/**
 * View Commands
 *
 * Commands for viewing/UI: help, fullscreen, etc.
 */

import { HelpCircle, Maximize } from "lucide-react";
import type { CommandDefinition } from "../types";

/**
 * Show keyboard shortcuts help
 *
 * Note: This command doesn't directly control the modal - it emits an event
 * that the EditorLayout listens to. This keeps commands side-effect free.
 */
export const showHelpCommand: CommandDefinition = {
  id: "view.help",
  label: "Vis hurtigtaster",
  description: "Åpne oversikt over alle hurtigtaster",
  icon: HelpCircle,
  shortcut: "⌘?",
  category: "view",
  execute: (_ctx) => {
    // Emit custom event for EditorLayout to handle
    window.dispatchEvent(new CustomEvent("editor:show-help"));
  },
};

/**
 * Toggle fullscreen mode
 */
export const toggleFullscreenCommand: CommandDefinition = {
  id: "view.fullscreen",
  label: "Fullskjerm",
  description: "Vis presentasjon i fullskjerm",
  icon: Maximize,
  shortcut: "⌘⇧F",
  category: "view",
  execute: async (_ctx) => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  },
};

/**
 * All view commands
 */
export const viewCommands: CommandDefinition[] = [
  showHelpCommand,
  toggleFullscreenCommand,
];
