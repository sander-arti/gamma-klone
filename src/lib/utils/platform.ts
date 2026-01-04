/**
 * Platform Detection Utilities
 *
 * Detects user platform and provides platform-specific formatting.
 */

/**
 * Detect if user is on macOS
 */
export function isMac(): boolean {
  if (typeof window === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

/**
 * Detect if user is on Windows
 */
export function isWindows(): boolean {
  if (typeof window === "undefined") return false;
  return /Win/.test(navigator.platform);
}

/**
 * Format keyboard shortcut for current platform
 *
 * Converts symbols to platform-specific equivalents:
 * - ⌘ → Ctrl on Windows, stays ⌘ on Mac
 * - ⌥ → Alt on both
 * - ⇧ → Shift on both
 * - ⌫ → Backspace/Delete on both
 *
 * @example
 * formatShortcut("⌘Z") → "Ctrl+Z" on Windows, "⌘Z" on Mac
 */
export function formatShortcut(shortcut: string): string {
  if (!shortcut) return "";

  const mac = isMac();

  // Replace command symbol with Ctrl on Windows
  let formatted = shortcut;
  if (!mac) {
    formatted = formatted.replace(/⌘/g, "Ctrl");
  }

  // Replace option symbol with Alt (both platforms)
  formatted = formatted.replace(/⌥/g, "Alt");

  // Backspace symbol
  formatted = formatted.replace(/⌫/g, "Backspace");

  return formatted;
}

/**
 * Parse shortcut string into individual key parts
 *
 * Handles both "⌘Z" and "Cmd+Z" formats.
 * Splits on common separators: + or space
 *
 * @example
 * parseShortcutKeys("⌘⇧Z") → ["⌘", "⇧", "Z"]
 * parseShortcutKeys("Ctrl+Shift+Z") → ["Ctrl", "Shift", "Z"]
 */
export function parseShortcutKeys(shortcut: string): string[] {
  if (!shortcut) return [];

  // If shortcut contains "+", split by it
  if (shortcut.includes("+")) {
    return shortcut.split("+").map((k) => k.trim());
  }

  // Otherwise, split individual characters (for symbols like ⌘⇧Z)
  const keys: string[] = [];
  const symbols = ["⌘", "⌥", "⇧", "⌃", "⌫"];

  let buffer = "";
  for (let i = 0; i < shortcut.length; i++) {
    const char = shortcut[i];

    if (symbols.includes(char)) {
      // Symbol - add to keys
      if (buffer) {
        keys.push(buffer);
        buffer = "";
      }
      keys.push(char);
    } else {
      // Regular character - add to buffer
      buffer += char;
    }
  }

  // Add remaining buffer
  if (buffer) {
    keys.push(buffer);
  }

  return keys;
}

/**
 * Format shortcut keys array for display
 *
 * Combines parseShortcutKeys and formatShortcut to get
 * platform-specific key parts.
 *
 * @example
 * formatShortcutKeys("⌘⇧Z") → ["⌘", "⇧", "Z"] on Mac
 * formatShortcutKeys("⌘⇧Z") → ["Ctrl", "Shift", "Z"] on Windows
 */
export function formatShortcutKeys(shortcut: string): string[] {
  const formatted = formatShortcut(shortcut);
  return parseShortcutKeys(formatted);
}
