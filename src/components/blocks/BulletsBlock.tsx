"use client";

/**
 * BulletsBlock Component
 *
 * Renders a bulleted or numbered list with theme-aware styling.
 * Supports item-level inline editing when isEditing is true.
 * Supports slash commands (/) for quick actions.
 */

import { useRef, useEffect, useCallback, useState } from "react";
import {
  BLOCK_CONSTRAINTS,
  isApproachingLimit,
  exceedsLimit,
} from "@/lib/editor/constraints";
import { SlashMenu, useSlashMenu, type SlashMenuItem } from "@/components/editor/SlashMenu";

interface BulletsBlockProps {
  items: string[];
  variant?: "default" | "numbered";
  className?: string;
  /** Enable inline editing mode */
  isEditing?: boolean;
  /** Index of item currently being edited (-1 if none) */
  editingItemIndex?: number;
  /** Callback when items array changes */
  onItemsChange?: (items: string[]) => void;
  /** Callback when editing ends (blur) */
  onBlur?: () => void;
  /** Callback when block is clicked (to start editing) */
  onClick?: () => void;
  /** Callback when specific item is clicked */
  onItemClick?: (index: number) => void;
  /** Callback when a slash command is selected */
  onSlashCommand?: (commandId: string, item: SlashMenuItem) => void;
}

export function BulletsBlock({
  items,
  variant = "default",
  className = "",
  isEditing = false,
  editingItemIndex = -1,
  onItemsChange,
  onBlur,
  onClick,
  onItemClick,
  onSlashCommand,
}: BulletsBlockProps) {
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [localEditingIndex, setLocalEditingIndex] = useState(-1);

  const maxItems = BLOCK_CONSTRAINTS.bullets.maxItems;
  const maxItemChars = BLOCK_CONSTRAINTS.bullets.maxItemChars;

  // Slash menu hook
  const slashMenu = useSlashMenu({
    onCommand: onSlashCommand,
    enabled: isEditing,
  });

  // Use external editingItemIndex if provided, otherwise use local
  const activeEditingIndex = editingItemIndex >= 0 ? editingItemIndex : localEditingIndex;

  // Focus the editing item
  useEffect(() => {
    if (isEditing && activeEditingIndex >= 0 && itemRefs.current[activeEditingIndex]) {
      const el = itemRefs.current[activeEditingIndex];
      el?.focus();
      // Place cursor at end
      const selection = window.getSelection();
      const range = document.createRange();
      if (el && el.firstChild) {
        range.selectNodeContents(el);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [isEditing, activeEditingIndex]);

  // Handle input changes for an item
  const handleItemInput = useCallback(
    (e: React.FormEvent<HTMLElement>, index: number) => {
      const el = itemRefs.current[index];
      if (el && onItemsChange) {
        const newText = el.textContent ?? "";
        const newItems = [...items];
        newItems[index] = newText;
        onItemsChange(newItems);
      }
      // Also check for slash menu trigger
      slashMenu.handleInput(e);
    },
    [items, onItemsChange, slashMenu]
  );

  // Handle blur
  const handleItemBlur = useCallback(
    (index: number) => {
      // Small delay to allow for item-to-item focus transitions
      setTimeout(() => {
        const activeElement = document.activeElement;
        const isStillInList = itemRefs.current.some((ref) => ref === activeElement);
        if (!isStillInList) {
          slashMenu.handleClose();
          setLocalEditingIndex(-1);
          onBlur?.();
        }
      }, 50);
    },
    [onBlur, slashMenu]
  );

  // Handle click on item
  const handleItemClick = useCallback(
    (index: number) => {
      if (isEditing) {
        setLocalEditingIndex(index);
        onItemClick?.(index);
      } else if (onClick) {
        onClick();
      }
    },
    [isEditing, onClick, onItemClick]
  );

  // Handle key events for item editing
  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>, index: number) => {
      // Let slash menu handle its keys first
      slashMenu.handleKeyDown(e);

      // If slash menu is open, don't process other keys
      if (slashMenu.isOpen) {
        return;
      }

      const el = itemRefs.current[index];
      const text = el?.textContent ?? "";

      // Enter: Create new item below
      if (e.key === "Enter") {
        e.preventDefault();
        if (items.length < maxItems && onItemsChange) {
          const newItems = [...items];
          newItems.splice(index + 1, 0, "");
          onItemsChange(newItems);
          // Focus the new item on next render
          setTimeout(() => {
            setLocalEditingIndex(index + 1);
            itemRefs.current[index + 1]?.focus();
          }, 0);
        }
      }

      // Backspace at beginning: Delete item or merge with previous
      if (e.key === "Backspace" && onItemsChange) {
        const selection = window.getSelection();
        const isAtStart = selection?.anchorOffset === 0;

        if (isAtStart && index > 0 && items.length > 1) {
          e.preventDefault();
          const newItems = [...items];
          const previousText = newItems[index - 1];
          const currentText = newItems[index];
          // Merge current into previous
          newItems[index - 1] = (previousText + currentText).slice(0, maxItemChars);
          newItems.splice(index, 1);
          onItemsChange(newItems);
          // Focus previous item
          setTimeout(() => {
            setLocalEditingIndex(index - 1);
            const prevEl = itemRefs.current[index - 1];
            if (prevEl) {
              prevEl.focus();
              // Place cursor at merge point
              const range = document.createRange();
              const sel = window.getSelection();
              if (prevEl.firstChild) {
                range.setStart(prevEl.firstChild, previousText.length);
                range.collapse(true);
                sel?.removeAllRanges();
                sel?.addRange(range);
              }
            }
          }, 0);
        } else if (isAtStart && index === 0 && items.length > 1 && text === "") {
          // Delete empty first item
          e.preventDefault();
          const newItems = items.filter((_, i) => i !== 0);
          onItemsChange(newItems);
        }
      }

      // Arrow keys for navigation between items
      if (e.key === "ArrowDown" && index < items.length - 1) {
        e.preventDefault();
        setLocalEditingIndex(index + 1);
        itemRefs.current[index + 1]?.focus();
      }
      if (e.key === "ArrowUp" && index > 0) {
        e.preventDefault();
        setLocalEditingIndex(index - 1);
        itemRefs.current[index - 1]?.focus();
      }

      // Prevent typing beyond max length
      if (
        text.length >= maxItemChars &&
        !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter"].includes(e.key) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
      }
    },
    [items, maxItems, maxItemChars, onItemsChange, slashMenu]
  );

  // Handle paste
  const handleItemPaste = useCallback(
    (e: React.ClipboardEvent, index: number) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text/plain");
      const el = itemRefs.current[index];
      const currentText = el?.textContent ?? "";
      const selection = window.getSelection();
      const selectedLength = selection?.toString().length ?? 0;
      const availableSpace = maxItemChars - currentText.length + selectedLength;
      const textToInsert = pastedText.slice(0, availableSpace);

      document.execCommand("insertText", false, textToInsert);
    },
    [maxItemChars]
  );

  const Tag = variant === "numbered" ? "ol" : "ul";

  // Inline styles using theme spacing and typography tokens
  // Uses CSS custom properties that can be overridden by parent (BulletsSlide)
  const listStyle: React.CSSProperties = {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    // Responsive gap that scales with container
    gap: "var(--theme-spacing-item-gap, clamp(1rem, 1.5cqw, 1.25rem))",
  };

  // Use larger body typography for better readability
  // The --bullet-font-size can be set by parent slide for variant control
  const itemStyle: React.CSSProperties = {
    fontSize: "var(--bullet-font-size, var(--theme-typography-body-size, clamp(1rem, 1.6cqw, 1.125rem)))",
    lineHeight: "var(--bullet-line-height, var(--theme-typography-body-line-height, 1.65))",
    fontWeight: "var(--theme-typography-body-weight, 400)" as React.CSSProperties['fontWeight'],
    color: "var(--theme-color-foreground, #0f172a)",
  };

  return (
    <div className="relative">
      <Tag
        className={className}
        style={listStyle}
      >
        {items.map((item, index) => {
          const isItemEditing = isEditing && activeEditingIndex === index;
          const charCount = item.length;
          const isApproaching = isApproachingLimit(charCount, maxItemChars);
          const isOver = exceedsLimit(charCount, maxItemChars);

          // Stagger animation delay (only when not editing)
          const animationDelay = !isEditing ? `${index * 75}ms` : "0ms";

          return (
            <li
              key={index}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={`flex items-start gap-3 ${
                !isEditing ? "animate-fade-in-up" : ""
              } ${
                isItemEditing
                  ? "outline-none ring-2 ring-blue-500 ring-offset-2 rounded-lg px-2 py-1 -mx-2"
                  : isEditing
                    ? "cursor-text hover:bg-black/5 rounded-lg px-2 py-1 -mx-2 transition-all"
                    : onClick
                      ? "cursor-text hover:bg-black/5 rounded-lg px-2 py-1 -mx-2 transition-all"
                      : ""
              }`}
              style={{
                ...itemStyle,
                animationDelay: !isEditing ? animationDelay : undefined,
              }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onInput={(e) => handleItemInput(e, index)}
              onBlur={() => handleItemBlur(index)}
              onClick={() => handleItemClick(index)}
              onKeyDown={isEditing ? (e) => handleItemKeyDown(e, index) : undefined}
              onPaste={isEditing ? (e) => handleItemPaste(e, index) : undefined}
            >
              {/* Custom bullet/number indicator with container-relative sizing */}
              {variant === "numbered" ? (
                <span
                  className="flex-shrink-0 flex items-center justify-center rounded-full font-semibold"
                  style={{
                    width: "clamp(1.75rem, 2.5cqw, 2rem)",
                    height: "clamp(1.75rem, 2.5cqw, 2rem)",
                    fontSize: "clamp(0.8rem, 1.1cqw, 0.9rem)",
                    background: "var(--theme-effects-gradient-primary, linear-gradient(135deg, var(--theme-color-primary, #3b82f6) 0%, var(--theme-color-accent-purple, #6366f1) 100%))",
                    color: "var(--theme-color-primary-foreground, #ffffff)",
                    marginTop: "0.1em",
                    boxShadow: "var(--theme-effects-shadow-blue, 0 2px 6px rgba(59, 130, 246, 0.25))",
                  }}
                  contentEditable={false}
                >
                  {index + 1}
                </span>
              ) : (
                <span
                  className="flex-shrink-0 rounded-full"
                  style={{
                    width: "clamp(0.5rem, 0.75cqw, 0.625rem)",
                    height: "clamp(0.5rem, 0.75cqw, 0.625rem)",
                    background: "var(--theme-effects-gradient-primary, linear-gradient(135deg, var(--theme-color-primary, #3b82f6) 0%, var(--theme-color-accent-purple, #6366f1) 100%))",
                    marginTop: "0.5em",
                    boxShadow: "var(--theme-effects-shadow-blue, 0 1px 3px rgba(59, 130, 246, 0.2))",
                  }}
                  contentEditable={false}
                  aria-hidden="true"
                />
              )}

              {/* Bullet text content */}
              <span className="flex-1">
                {item}
              </span>

              {/* Inline character counter for item being edited */}
              {isItemEditing && (
                <span
                  className={`ml-2 text-xs flex-shrink-0 ${
                    isOver
                      ? "text-red-500 font-medium"
                      : isApproaching
                        ? "text-amber-500"
                        : "text-gray-400"
                  }`}
                  contentEditable={false}
                >
                  ({charCount}/{maxItemChars})
                </span>
              )}
            </li>
          );
        })}
      </Tag>

      {/* Add item button when editing and not at max */}
      {isEditing && items.length < maxItems && (
        <button
          type="button"
          onClick={() => {
            if (onItemsChange) {
              const newItems = [...items, "Nytt punkt"];
              onItemsChange(newItems);
              setTimeout(() => {
                setLocalEditingIndex(newItems.length - 1);
                itemRefs.current[newItems.length - 1]?.focus();
              }, 0);
            }
          }}
          className="mt-2 text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
          style={{ paddingLeft: 'var(--theme-spacing-bullet-indent, 1.5em)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Legg til punkt
        </button>
      )}

      {/* Slash Menu */}
      {slashMenu.isOpen && (
        <SlashMenu
          position={slashMenu.position}
          query={slashMenu.query}
          onSelect={slashMenu.handleSelect}
          onClose={slashMenu.handleClose}
        />
      )}
    </div>
  );
}
