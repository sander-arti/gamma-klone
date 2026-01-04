"use client";

/**
 * HelpModal
 *
 * Modal showing all available keyboard shortcuts.
 * Dynamically generates shortcuts from command registry.
 * Triggered via Command Palette or ⌘? shortcut.
 */

import { useMemo, useEffect } from "react";
import { Modal } from "@/components/ui";
import { commandRegistry, type CommandCategory } from "@/lib/editor/commands";
import { formatShortcutKeys } from "@/lib/utils/platform";
import { editor } from "@/lib/analytics/events";

export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

/**
 * Map category IDs to Norwegian titles
 */
const CATEGORY_TITLES: Record<CommandCategory, string> = {
  edit: "Redigering",
  slide: "Slides",
  ai: "AI-assistent",
  view: "Visning",
  export: "Eksport",
};

/**
 * Preferred category display order
 */
const CATEGORY_ORDER: CommandCategory[] = ["edit", "slide", "ai", "view", "export"];

function ShortcutKey({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((part, i) => (
        <span key={i} className="inline-flex items-center">
          <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-700 shadow-sm">
            {part}
          </kbd>
          {i < keys.length - 1 && <span className="mx-0.5 text-gray-400">+</span>}
        </span>
      ))}
    </span>
  );
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  // Generate shortcut groups from command registry
  const shortcutGroups = useMemo((): ShortcutGroup[] => {
    const allCommands = commandRegistry.getAll();

    // Filter commands with shortcuts
    const commandsWithShortcuts = allCommands.filter((cmd) => cmd.shortcut);

    // Group by category
    const grouped: Record<CommandCategory, typeof commandsWithShortcuts> = {
      edit: [],
      slide: [],
      ai: [],
      view: [],
      export: [],
    };

    for (const command of commandsWithShortcuts) {
      grouped[command.category].push(command);
    }

    // Build groups in preferred order
    const groups: ShortcutGroup[] = [];

    for (const category of CATEGORY_ORDER) {
      const commands = grouped[category];
      if (commands.length === 0) continue;

      groups.push({
        title: CATEGORY_TITLES[category],
        shortcuts: commands.map((cmd) => ({
          keys: formatShortcutKeys(cmd.shortcut!),
          description: cmd.description || cmd.label,
        })),
      });
    }

    return groups;
  }, []);

  // Track help modal opened
  useEffect(() => {
    if (isOpen) {
      editor.helpModalOpened();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hurtigtaster"
      description="Alle tilgjengelige hurtigtaster i editoren"
      size="lg"
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        {shortcutGroups.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">Ingen hurtigtaster registrert</p>
        ) : (
          shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={`${group.title}-${index}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-900">{shortcut.description}</span>
                    <ShortcutKey keys={shortcut.keys} />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Trykk <ShortcutKey keys={formatShortcutKeys("⌘K")} /> for å søke etter kommandoer
        </p>
      </div>
    </Modal>
  );
}
