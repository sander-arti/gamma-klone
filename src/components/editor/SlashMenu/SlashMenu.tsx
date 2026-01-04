"use client";

/**
 * SlashMenu Component
 *
 * A dropdown menu triggered by typing "/" in text blocks.
 * Provides quick access to commands for transforming content.
 *
 * Features:
 * - Positioned near caret
 * - Keyboard navigation
 * - Fuzzy search filtering
 * - Icon display
 */

import { useState, useEffect, useRef, useCallback, useMemo, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import {
  List,
  Image,
  MessageSquare,
  Minimize2,
  Maximize2,
  BarChart3,
  Quote,
  Table,
  Sparkles,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface SlashMenuItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  keywords?: string[];
}

export interface SlashMenuProps {
  /** Position to render the menu */
  position: { x: number; y: number };
  /** Current filter query (text typed after "/") */
  query: string;
  /** Callback when an item is selected */
  onSelect: (item: SlashMenuItem) => void;
  /** Callback when menu should close */
  onClose: () => void;
}

// ============================================================================
// Default Menu Items
// ============================================================================

export const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  {
    id: "slash.bullet",
    label: "Punktliste",
    description: "Konverter til bullet points",
    icon: <List className="w-4 h-4" />,
    keywords: ["bullet", "list", "punkter", "liste"],
  },
  {
    id: "slash.callout",
    label: "Fremheving",
    description: "Legg til en fremhevet boks",
    icon: <Quote className="w-4 h-4" />,
    keywords: ["callout", "quote", "highlight", "boks"],
  },
  {
    id: "slash.stat",
    label: "Statistikk",
    description: "Konverter til statistikk-blokk",
    icon: <BarChart3 className="w-4 h-4" />,
    keywords: ["stat", "number", "tall", "statistikk"],
  },
  {
    id: "slash.table",
    label: "Tabell",
    description: "Sett inn en tabell",
    icon: <Table className="w-4 h-4" />,
    keywords: ["table", "tabell", "grid"],
  },
  {
    id: "slash.image",
    label: "Bilde",
    description: "Generer et AI-bilde",
    icon: <Image className="w-4 h-4" />,
    keywords: ["image", "bilde", "foto", "ai"],
  },
  {
    id: "slash.simplify",
    label: "Forenkle",
    description: "Gjør teksten kortere og enklere",
    icon: <Minimize2 className="w-4 h-4" />,
    keywords: ["simplify", "forenkle", "kort", "enkel"],
  },
  {
    id: "slash.expand",
    label: "Utvid",
    description: "Legg til mer detaljer",
    icon: <Maximize2 className="w-4 h-4" />,
    keywords: ["expand", "utvid", "mer", "detaljer"],
  },
  {
    id: "slash.rewrite",
    label: "Skriv om",
    description: "Skriv om med AI",
    icon: <Sparkles className="w-4 h-4" />,
    keywords: ["rewrite", "skriv", "omskriv", "ai"],
  },
  {
    id: "slash.professional",
    label: "Profesjonell",
    description: "Gjør språket mer formelt",
    icon: <MessageSquare className="w-4 h-4" />,
    keywords: ["professional", "formal", "formelt", "profesjonell"],
  },
];

// ============================================================================
// Fuzzy Search
// ============================================================================

function matchesQuery(item: SlashMenuItem, query: string): boolean {
  if (!query) return true;

  const queryLower = query.toLowerCase();
  const labelLower = item.label.toLowerCase();
  const descLower = item.description?.toLowerCase() ?? "";

  // Check label
  if (labelLower.includes(queryLower)) return true;

  // Check description
  if (descLower.includes(queryLower)) return true;

  // Check keywords
  if (item.keywords?.some((k) => k.toLowerCase().includes(queryLower))) {
    return true;
  }

  // Fuzzy match on label
  let queryIndex = 0;
  for (const char of labelLower) {
    if (char === queryLower[queryIndex]) {
      queryIndex++;
      if (queryIndex === queryLower.length) return true;
    }
  }

  return false;
}

// ============================================================================
// Component
// ============================================================================

export function SlashMenu({ position, query, onSelect, onClose }: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState(position);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    return SLASH_MENU_ITEMS.filter((item) => matchesQuery(item, query));
  }, [query]);

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Adjust position to stay in viewport
  useEffect(() => {
    if (!menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Keep within horizontal bounds
    if (x + rect.width > viewportWidth - 16) {
      x = viewportWidth - rect.width - 16;
    }
    if (x < 16) {
      x = 16;
    }

    // Keep within vertical bounds (flip above if needed)
    if (y + rect.height > viewportHeight - 16) {
      y = position.y - rect.height - 24; // Position above caret
    }

    setMenuPosition({ x, y });
  }, [position]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: globalThis.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
          break;

        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
          break;

        case "Enter":
          e.preventDefault();
          e.stopPropagation();
          if (filteredItems[selectedIndex]) {
            onSelect(filteredItems[selectedIndex]);
          }
          break;

        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          onClose();
          break;

        case "Tab":
          e.preventDefault();
          e.stopPropagation();
          if (e.shiftKey) {
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
          } else {
            setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
          }
          break;
      }
    },
    [filteredItems, selectedIndex, onSelect, onClose]
  );

  // Attach keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [handleKeyDown]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Don't render if no items match
  if (filteredItems.length === 0) {
    return null;
  }

  const content = (
    <div
      ref={menuRef}
      className="fixed z-50 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: menuPosition.x,
        top: menuPosition.y,
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
        Kommandoer
      </div>

      {/* Items */}
      <div className="max-h-64 overflow-y-auto py-1">
        {filteredItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`
              w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
              ${
                index === selectedIndex
                  ? "bg-blue-50 text-blue-900"
                  : "hover:bg-gray-50 text-gray-900"
              }
            `}
            onClick={() => onSelect(item)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span
              className={`flex-shrink-0 ${
                index === selectedIndex ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {item.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{item.label}</div>
              {item.description && (
                <div className="text-xs text-gray-500 truncate">{item.description}</div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 text-xs text-gray-400 border-t border-gray-100">
        ↑↓ navigér • Enter velg • Esc lukk
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
