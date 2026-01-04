/**
 * Command Registry
 *
 * Central registry for all editor commands.
 * Provides registration, lookup, execution, and search functionality.
 */

import type {
  CommandDefinition,
  CommandCategory,
  EditorContext,
  CommandSearchResult,
  ParsedShortcut,
} from "./types";
import { parseShortcut, matchesShortcut } from "./types";

// ============================================================================
// Fuzzy Search Implementation
// ============================================================================

/**
 * Simple fuzzy search scoring algorithm.
 * Returns score and match positions.
 */
function fuzzySearch(
  query: string,
  text: string
): { score: number; matches: Array<{ start: number; end: number }> } | null {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const matches: Array<{ start: number; end: number }> = [];

  // Empty query matches everything
  if (queryLower.length === 0) {
    return { score: 0, matches: [] };
  }

  // Check for exact substring match first (highest score)
  const exactIndex = textLower.indexOf(queryLower);
  if (exactIndex !== -1) {
    return {
      score: 100 + (exactIndex === 0 ? 50 : 0), // Bonus for start-of-string match
      matches: [{ start: exactIndex, end: exactIndex + query.length }],
    };
  }

  // Fuzzy matching: find all query characters in order
  let textIndex = 0;
  let queryIndex = 0;
  let score = 0;
  let consecutiveBonus = 0;
  let lastMatchIndex = -2;

  while (textIndex < textLower.length && queryIndex < queryLower.length) {
    if (textLower[textIndex] === queryLower[queryIndex]) {
      // Character match
      const matchStart = textIndex;

      // Count consecutive matches
      while (
        textIndex < textLower.length &&
        queryIndex < queryLower.length &&
        textLower[textIndex] === queryLower[queryIndex]
      ) {
        textIndex++;
        queryIndex++;
        consecutiveBonus++;
      }

      matches.push({ start: matchStart, end: textIndex });

      // Score: base points + consecutive bonus + adjacency bonus
      score += 10 * (textIndex - matchStart); // Points per match
      score += consecutiveBonus * 5; // Consecutive bonus
      if (matchStart === lastMatchIndex + 1) {
        score += 15; // Adjacency bonus
      }

      // Position bonus (earlier matches are better)
      if (matchStart === 0) {
        score += 25; // Start of string
      } else if (text[matchStart - 1] === " " || text[matchStart - 1] === "-") {
        score += 15; // Word boundary
      }

      lastMatchIndex = textIndex - 1;
      consecutiveBonus = 0;
    } else {
      textIndex++;
    }
  }

  // All query characters must be matched
  if (queryIndex < queryLower.length) {
    return null;
  }

  return { score, matches };
}

// ============================================================================
// Command Registry Class
// ============================================================================

/**
 * Singleton registry for all editor commands.
 */
class CommandRegistry {
  private commands: Map<string, CommandDefinition> = new Map();
  private shortcutMap: Map<string, { command: CommandDefinition; parsed: ParsedShortcut }> =
    new Map();

  /**
   * Register a new command.
   * @throws Error if command ID already exists
   */
  register(command: CommandDefinition): void {
    if (this.commands.has(command.id)) {
      console.warn(`Command "${command.id}" is already registered. Overwriting.`);
    }

    this.commands.set(command.id, command);

    // Register shortcut if present
    if (command.shortcut) {
      const parsed = parseShortcut(command.shortcut);
      const shortcutKey = this.getShortcutKey(parsed);
      this.shortcutMap.set(shortcutKey, { command, parsed });
    }
  }

  /**
   * Register multiple commands at once.
   */
  registerAll(commands: CommandDefinition[]): void {
    for (const command of commands) {
      this.register(command);
    }
  }

  /**
   * Unregister a command by ID.
   */
  unregister(id: string): boolean {
    const command = this.commands.get(id);
    if (!command) return false;

    // Remove from shortcut map if applicable
    if (command.shortcut) {
      const parsed = parseShortcut(command.shortcut);
      const shortcutKey = this.getShortcutKey(parsed);
      this.shortcutMap.delete(shortcutKey);
    }

    return this.commands.delete(id);
  }

  /**
   * Get a command by ID.
   */
  get(id: string): CommandDefinition | undefined {
    return this.commands.get(id);
  }

  /**
   * Get all registered commands.
   */
  getAll(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get commands by category.
   */
  getByCategory(category: CommandCategory): CommandDefinition[] {
    return this.getAll().filter((c) => c.category === category);
  }

  /**
   * Get available commands (filtered by 'when' condition).
   */
  getAvailable(context: EditorContext): CommandDefinition[] {
    return this.getAll().filter((c) => !c.when || c.when(context));
  }

  /**
   * Get available commands grouped by category.
   */
  getAvailableByCategory(
    context: EditorContext
  ): Record<CommandCategory, CommandDefinition[]> {
    const available = this.getAvailable(context);
    const grouped: Record<CommandCategory, CommandDefinition[]> = {
      edit: [],
      ai: [],
      slide: [],
      view: [],
      export: [],
    };

    for (const command of available) {
      grouped[command.category].push(command);
    }

    return grouped;
  }

  /**
   * Execute a command by ID.
   * @throws Error if command not found
   */
  async execute(id: string, context: EditorContext): Promise<void> {
    const command = this.commands.get(id);
    if (!command) {
      throw new Error(`Command "${id}" not found`);
    }

    // Check if command is available
    if (command.when && !command.when(context)) {
      console.warn(`Command "${id}" is not available in current context`);
      return;
    }

    await command.execute(context);
  }

  /**
   * Find command matching a keyboard event.
   */
  findByShortcut(event: KeyboardEvent): CommandDefinition | undefined {
    for (const { command, parsed } of this.shortcutMap.values()) {
      if (matchesShortcut(event, parsed)) {
        return command;
      }
    }
    return undefined;
  }

  /**
   * Search commands by query string.
   * Returns results sorted by relevance.
   */
  search(query: string, context?: EditorContext): CommandSearchResult[] {
    const results: CommandSearchResult[] = [];
    const commands = context ? this.getAvailable(context) : this.getAll();

    for (const command of commands) {
      // Search in label
      const labelMatch = fuzzySearch(query, command.label);

      // Search in description if present
      const descMatch = command.description
        ? fuzzySearch(query, command.description)
        : null;

      // Take best score
      if (labelMatch || descMatch) {
        const labelScore = labelMatch?.score ?? 0;
        const descScore = descMatch ? descMatch.score * 0.7 : 0; // Description matches worth less

        results.push({
          command,
          score: Math.max(labelScore, descScore),
          labelMatches: labelMatch?.matches ?? [],
          descriptionMatches: descMatch?.matches,
        });
      }
    }

    // Sort by score (descending)
    results.sort((a, b) => b.score - a.score);

    return results;
  }

  /**
   * Get total number of registered commands.
   */
  get size(): number {
    return this.commands.size;
  }

  /**
   * Clear all registered commands.
   */
  clear(): void {
    this.commands.clear();
    this.shortcutMap.clear();
  }

  /**
   * Create a unique key for a parsed shortcut.
   */
  private getShortcutKey(parsed: ParsedShortcut): string {
    const parts: string[] = [];
    if (parsed.modifiers.meta) parts.push("meta");
    if (parsed.modifiers.ctrl) parts.push("ctrl");
    if (parsed.modifiers.shift) parts.push("shift");
    if (parsed.modifiers.alt) parts.push("alt");
    parts.push(parsed.key);
    return parts.join("+");
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

/**
 * Global command registry instance.
 */
export const commandRegistry = new CommandRegistry();

/**
 * Export class for testing purposes.
 */
export { CommandRegistry };
