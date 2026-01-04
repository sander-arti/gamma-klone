"use client";

/**
 * Spotlight Component
 *
 * A generic searchable modal for quick actions.
 * Used by Command Palette and potentially other features.
 *
 * Features:
 * - Portal-based rendering
 * - Fuzzy search with highlighting
 * - Keyboard navigation (↑↓, Enter, Escape)
 * - Category grouping (optional)
 * - Smooth animations
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface SpotlightItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  category?: string;
  /** Match ranges for highlighting (set by search) */
  labelMatches?: Array<{ start: number; end: number }>;
  descriptionMatches?: Array<{ start: number; end: number }>;
}

export interface SpotlightProps {
  /** Whether the spotlight is open */
  isOpen: boolean;
  /** Callback when spotlight should close */
  onClose: () => void;
  /** Placeholder text for search input */
  placeholder?: string;
  /** Items to display */
  items: SpotlightItem[];
  /** Callback when an item is selected */
  onSelect: (item: SpotlightItem) => void;
  /** Custom empty state content */
  emptyState?: ReactNode;
  /** Footer content (e.g., keyboard hints) */
  footer?: ReactNode;
  /** Whether to group items by category */
  groupByCategory?: boolean;
  /** Custom category labels */
  categoryLabels?: Record<string, string>;
  /** Custom search function */
  onSearch?: (query: string, items: SpotlightItem[]) => SpotlightItem[];
}

// ============================================================================
// Default Fuzzy Search
// ============================================================================

function defaultFuzzySearch(
  query: string,
  items: SpotlightItem[]
): SpotlightItem[] {
  if (!query.trim()) return items;

  const queryLower = query.toLowerCase();
  const results: Array<{ item: SpotlightItem; score: number }> = [];

  for (const item of items) {
    const labelLower = item.label.toLowerCase();
    const descLower = item.description?.toLowerCase() ?? "";

    // Exact match in label
    const labelIndex = labelLower.indexOf(queryLower);
    if (labelIndex !== -1) {
      results.push({
        item: {
          ...item,
          labelMatches: [{ start: labelIndex, end: labelIndex + query.length }],
        },
        score: 100 + (labelIndex === 0 ? 50 : 0),
      });
      continue;
    }

    // Exact match in description
    const descIndex = descLower.indexOf(queryLower);
    if (descIndex !== -1) {
      results.push({
        item: {
          ...item,
          descriptionMatches: [{ start: descIndex, end: descIndex + query.length }],
        },
        score: 50 + (descIndex === 0 ? 25 : 0),
      });
      continue;
    }

    // Fuzzy match in label
    const labelMatches: Array<{ start: number; end: number }> = [];
    let labelScore = 0;
    let labelIdx = 0;
    for (const char of queryLower) {
      const foundIdx = labelLower.indexOf(char, labelIdx);
      if (foundIdx !== -1) {
        labelMatches.push({ start: foundIdx, end: foundIdx + 1 });
        labelScore += 10;
        if (foundIdx === labelIdx) labelScore += 5; // Consecutive bonus
        labelIdx = foundIdx + 1;
      }
    }

    if (labelMatches.length === queryLower.length) {
      results.push({
        item: { ...item, labelMatches },
        score: labelScore,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results.map((r) => r.item);
}

// ============================================================================
// Highlight Component
// ============================================================================

interface HighlightedTextProps {
  text: string;
  matches?: Array<{ start: number; end: number }>;
  className?: string;
}

function HighlightedText({ text, matches, className = "" }: HighlightedTextProps) {
  if (!matches || matches.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Sort matches by start position and merge overlapping
  const sortedMatches = [...matches].sort((a, b) => a.start - b.start);
  const mergedMatches: Array<{ start: number; end: number }> = [];

  for (const match of sortedMatches) {
    const last = mergedMatches[mergedMatches.length - 1];
    if (last && match.start <= last.end) {
      last.end = Math.max(last.end, match.end);
    } else {
      mergedMatches.push({ ...match });
    }
  }

  const parts: ReactNode[] = [];
  let lastEnd = 0;

  for (let i = 0; i < mergedMatches.length; i++) {
    const match = mergedMatches[i];

    // Text before match
    if (match.start > lastEnd) {
      parts.push(text.slice(lastEnd, match.start));
    }

    // Highlighted match - ARTI Premium: emerald highlight
    parts.push(
      <span key={i} className="bg-emerald-100 text-emerald-800 rounded px-0.5">
        {text.slice(match.start, match.end)}
      </span>
    );

    lastEnd = match.end;
  }

  // Text after last match
  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd));
  }

  return <span className={className}>{parts}</span>;
}

// ============================================================================
// Spotlight Component
// ============================================================================

export function Spotlight({
  isOpen,
  onClose,
  placeholder = "Søk...",
  items,
  onSelect,
  emptyState,
  footer,
  groupByCategory = false,
  categoryLabels = {},
  onSearch,
}: SpotlightProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (onSearch) {
      return onSearch(query, items);
    }
    return defaultFuzzySearch(query, items);
  }, [query, items, onSearch]);

  // Group items by category if enabled
  const groupedItems = useMemo(() => {
    if (!groupByCategory) {
      return { "": filteredItems };
    }

    const groups: Record<string, SpotlightItem[]> = {};
    for (const item of filteredItems) {
      const category = item.category ?? "";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    }
    return groups;
  }, [filteredItems, groupByCategory]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => {
    if (!groupByCategory) return filteredItems;
    return Object.values(groupedItems).flat();
  }, [filteredItems, groupedItems, groupByCategory]);

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;

    const selectedElement = listRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatItems.length - 1 ? prev + 1 : 0
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatItems.length - 1
          );
          break;

        case "Enter":
          e.preventDefault();
          if (flatItems[selectedIndex]) {
            onSelect(flatItems[selectedIndex]);
          }
          break;

        case "Escape":
          e.preventDefault();
          onClose();
          break;

        case "Tab":
          e.preventDefault();
          if (e.shiftKey) {
            setSelectedIndex((prev) =>
              prev > 0 ? prev - 1 : flatItems.length - 1
            );
          } else {
            setSelectedIndex((prev) =>
              prev < flatItems.length - 1 ? prev + 1 : 0
            );
          }
          break;
      }
    },
    [flatItems, selectedIndex, onSelect, onClose]
  );

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Don't render if closed
  if (!isOpen) return null;

  // Render item - ARTI Premium styling
  const renderItem = (item: SpotlightItem, index: number) => {
    const isSelected = index === selectedIndex;

    return (
      <button
        key={item.id}
        type="button"
        data-index={index}
        className={`
          w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200
          ${isSelected
            ? "bg-emerald-50 text-gray-900"
            : "hover:bg-[#f5f3f0] text-gray-700"
          }
        `}
        onClick={() => onSelect(item)}
        onMouseEnter={() => setSelectedIndex(index)}
      >
        {/* Icon */}
        {item.icon && (
          <span className={`flex-shrink-0 ${isSelected ? "text-emerald-600" : "text-gray-400"}`}>
            {item.icon}
          </span>
        )}

        {/* Label and description */}
        <div className="flex-1 min-w-0">
          <HighlightedText
            text={item.label}
            matches={item.labelMatches}
            className="block font-medium truncate"
          />
          {item.description && (
            <HighlightedText
              text={item.description}
              matches={item.descriptionMatches}
              className="block text-sm text-gray-500 truncate"
            />
          )}
        </div>

        {/* Shortcut - ARTI Premium badge */}
        {item.shortcut && (
          <span className="flex-shrink-0 text-xs text-gray-500 bg-[#f0ede8] border border-[#e5e2dd] px-2 py-1 rounded-md font-mono">
            {item.shortcut}
          </span>
        )}
      </button>
    );
  };

  // Render content - ARTI Premium styling
  const content = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-300/50 border border-[#e5e2dd] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input - ARTI Premium */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#e5e2dd]">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 text-lg bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-1.5 hover:bg-[#f0ede8] rounded-lg transition-colors"
            aria-label="Lukk"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Results list - ARTI Premium */}
        <div
          ref={listRef}
          className="max-h-[50vh] overflow-y-auto"
        >
          {flatItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              {emptyState ?? "Ingen resultater funnet"}
            </div>
          ) : groupByCategory ? (
            // Grouped view
            Object.entries(groupedItems).map(([category, categoryItems]) => {
              if (categoryItems.length === 0) return null;

              // Calculate starting index for this category
              let startIndex = 0;
              for (const [cat, catItems] of Object.entries(groupedItems)) {
                if (cat === category) break;
                startIndex += catItems.length;
              }

              return (
                <div key={category || "_uncategorized"}>
                  {category && (
                    <div className="px-4 py-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider bg-[#faf8f5]/95 backdrop-blur-sm sticky top-0 border-b border-[#e5e2dd]">
                      {categoryLabels[category] ?? category}
                    </div>
                  )}
                  {categoryItems.map((item, i) =>
                    renderItem(item, startIndex + i)
                  )}
                </div>
              );
            })
          ) : (
            // Flat list
            flatItems.map((item, index) => renderItem(item, index))
          )}
        </div>

        {/* Footer - ARTI Premium */}
        {footer && (
          <div className="px-4 py-2.5 border-t border-[#e5e2dd] bg-[#faf8f5]/80">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render via portal
  return createPortal(content, document.body);
}
