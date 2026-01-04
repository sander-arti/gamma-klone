"use client";

/**
 * TextBlock Component
 *
 * Renders paragraph text with theme-aware styling.
 * Supports variants: body (default), subtitle, muted.
 * Supports inline editing via contentEditable when isEditing is true.
 * Supports slash commands (/) for quick actions.
 */

import { useRef, useEffect, useCallback } from "react";
import {
  BLOCK_CONSTRAINTS,
  isApproachingLimit,
  exceedsLimit,
} from "@/lib/editor/constraints";
import { SlashMenu, useSlashMenu, type SlashMenuItem } from "@/components/editor/SlashMenu";

interface TextBlockProps {
  text: string;
  variant?: "body" | "subtitle" | "muted";
  className?: string;
  /** Enable inline editing mode */
  isEditing?: boolean;
  /** Callback when text changes */
  onTextChange?: (text: string) => void;
  /** Callback when editing ends (blur) */
  onBlur?: () => void;
  /** Callback when block is clicked (to start editing) */
  onClick?: () => void;
  /** Callback when a slash command is selected */
  onSlashCommand?: (commandId: string, item: SlashMenuItem) => void;
}

export function TextBlock({
  text,
  variant = "body",
  className = "",
  isEditing = false,
  onTextChange,
  onBlur,
  onClick,
  onSlashCommand,
}: TextBlockProps) {
  const editableRef = useRef<HTMLParagraphElement>(null);
  const maxLength = BLOCK_CONSTRAINTS.text.maxChars;

  // Slash menu hook
  const slashMenu = useSlashMenu({
    onCommand: onSlashCommand,
    enabled: isEditing,
  });

  // Focus when entering edit mode
  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      // Place cursor at end
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      range.collapse(false); // Collapse to end
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  // Handle input changes
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      if (editableRef.current && onTextChange) {
        const newText = editableRef.current.textContent ?? "";
        onTextChange(newText);
      }
      // Also check for slash menu trigger
      slashMenu.handleInput(e);
    },
    [onTextChange, slashMenu]
  );

  // Handle blur
  const handleBlur = useCallback(() => {
    slashMenu.handleClose();
    onBlur?.();
  }, [onBlur, slashMenu]);

  // Handle click (start editing)
  const handleClick = useCallback(() => {
    if (!isEditing && onClick) {
      onClick();
    }
  }, [isEditing, onClick]);

  // Handle key events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      // Let slash menu handle its keys first
      slashMenu.handleKeyDown(e);

      // Allow Enter for line breaks in text blocks (unlike title)
      // But prevent typing beyond max length
      if (
        editableRef.current &&
        editableRef.current.textContent &&
        editableRef.current.textContent.length >= maxLength &&
        !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
      }
    },
    [maxLength, slashMenu]
  );

  // Prevent paste from exceeding max length
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text/plain");
      const currentText = editableRef.current?.textContent ?? "";
      const selection = window.getSelection();
      const selectedLength = selection?.toString().length ?? 0;
      const availableSpace = maxLength - currentText.length + selectedLength;
      const textToInsert = pastedText.slice(0, availableSpace);

      document.execCommand("insertText", false, textToInsert);
    },
    [maxLength]
  );

  const editingStyles = isEditing
    ? "outline-none ring-2 ring-emerald-600 ring-offset-2 ring-offset-transparent rounded px-2 -mx-2 py-1 -my-1"
    : onClick
      ? "cursor-text hover:ring-2 hover:ring-emerald-600/30 hover:ring-offset-2 hover:ring-offset-transparent rounded px-2 -mx-2 py-1 -my-1 transition-all"
      : "";

  const charCount = text.length;
  const isApproaching = isApproachingLimit(charCount, maxLength);
  const isOver = exceedsLimit(charCount, maxLength);

  // Use inline styles for theme variables with proper hierarchy levels
  const getTextStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'subtitle':
        // Use body-large for subtitles - slightly larger, more prominent
        return {
          fontSize: 'var(--theme-typography-body-large-size, 1.0625rem)',
          lineHeight: 'var(--theme-typography-body-large-line-height, 1.6)',
          fontWeight: 'var(--theme-typography-body-large-weight, 400)' as React.CSSProperties['fontWeight'],
          color: 'var(--theme-color-foreground-muted, #475569)',
        };
      case 'muted':
        // Use body-small for muted text - smaller, secondary
        return {
          fontSize: 'var(--theme-typography-body-small-size, 0.8125rem)',
          lineHeight: 'var(--theme-typography-body-small-line-height, 1.6)',
          fontWeight: 'var(--theme-typography-body-small-weight, 400)' as React.CSSProperties['fontWeight'],
          color: 'var(--theme-color-foreground-muted, #475569)',
        };
      default:
        // Default body text
        return {
          fontSize: 'var(--theme-typography-body-size, 0.9375rem)',
          lineHeight: 'var(--theme-typography-body-line-height, 1.65)',
          fontWeight: 'var(--theme-typography-body-weight, 400)' as React.CSSProperties['fontWeight'],
          color: 'var(--theme-color-foreground, #0f172a)',
        };
    }
  };

  return (
    <div className="relative">
      <p
        ref={editableRef}
        className={`${editingStyles} ${className} whitespace-pre-wrap`}
        style={getTextStyle()}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleBlur}
        onClick={handleClick}
        onKeyDown={isEditing ? handleKeyDown : undefined}
        onPaste={isEditing ? handlePaste : undefined}
      >
        {text}
      </p>

      {/* Character counter when editing */}
      {isEditing && (
        <div
          className={`absolute -bottom-5 right-0 text-xs ${
            isOver
              ? "text-red-400 font-medium"
              : isApproaching
                ? "text-amber-400"
                : "text-zinc-500"
          }`}
        >
          {charCount}/{maxLength}
        </div>
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
