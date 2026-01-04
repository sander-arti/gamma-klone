/**
 * Command System
 *
 * Barrel export for the command registry and built-in commands.
 */

// Types
export type {
  CommandDefinition,
  CommandCategory,
  CategoryMeta,
  EditorContext,
  EditorActions,
  IconComponent,
  ParsedShortcut,
  ShortcutModifiers,
  CommandSearchResult,
  CommandRegistrationOptions,
} from "./types";

export { CATEGORY_META, parseShortcut, matchesShortcut } from "./types";

// Registry
export { commandRegistry, CommandRegistry } from "./registry";

// Keyboard hooks
export {
  useCommandKeyboard,
  useCommandPaletteTrigger,
  type UseCommandKeyboardOptions,
  type UseCommandPaletteOptions,
} from "./keyboard";

// Built-in commands
export { editCommands } from "./handlers/edit-commands";
export { aiCommands } from "./handlers/ai-commands";
export { slideCommands } from "./handlers/slide-commands";
export { viewCommands } from "./handlers/view-commands";

// ============================================================================
// Command Registration Helper
// ============================================================================

import { commandRegistry } from "./registry";
import { editCommands } from "./handlers/edit-commands";
import { aiCommands } from "./handlers/ai-commands";
import { slideCommands } from "./handlers/slide-commands";
import { viewCommands } from "./handlers/view-commands";

/**
 * Register all built-in commands.
 * Call this once at app initialization.
 */
export function registerBuiltInCommands(): void {
  commandRegistry.registerAll(editCommands);
  commandRegistry.registerAll(aiCommands);
  commandRegistry.registerAll(slideCommands);
  commandRegistry.registerAll(viewCommands);
}
