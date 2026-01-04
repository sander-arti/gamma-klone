"use client";

/**
 * TitleBlock Component
 *
 * Renders a heading block with theme-aware styling.
 * Supports two levels: h1 for slide titles, h2 for section headings.
 * Supports inline editing via contentEditable when isEditing is true.
 */

import { useRef, useEffect, useCallback } from "react";
import {
  BLOCK_CONSTRAINTS,
  isApproachingLimit,
  exceedsLimit,
} from "@/lib/editor/constraints";

interface TitleBlockProps {
  text: string;
  level?: 1 | 2;
  className?: string;
  /** Enable inline editing mode */
  isEditing?: boolean;
  /** Callback when text changes */
  onTextChange?: (text: string) => void;
  /** Callback when editing ends (blur) */
  onBlur?: () => void;
  /** Callback when block is clicked (to start editing) */
  onClick?: () => void;
}

export function TitleBlock({
  text,
  level = 1,
  className = "",
  isEditing = false,
  onTextChange,
  onBlur,
  onClick,
}: TitleBlockProps) {
  const editableRef = useRef<HTMLHeadingElement>(null);
  const maxLength = BLOCK_CONSTRAINTS.title.maxChars;

  // Focus and select all when entering edit mode
  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      // Select all text
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  // Handle input changes
  const handleInput = useCallback(() => {
    if (editableRef.current && onTextChange) {
      const newText = editableRef.current.textContent ?? "";
      onTextChange(newText);
    }
  }, [onTextChange]);

  // Handle blur
  const handleBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  // Handle click (start editing)
  const handleClick = useCallback(() => {
    if (!isEditing && onClick) {
      onClick();
    }
  }, [isEditing, onClick]);

  // Prevent newlines in title
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        editableRef.current?.blur();
      }
      // Prevent typing beyond max length (but allow delete/backspace)
      if (
        editableRef.current &&
        editableRef.current.textContent &&
        editableRef.current.textContent.length >= maxLength &&
        !["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
      }
    },
    [maxLength]
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
    ? "outline-none ring-2 ring-emerald-600 ring-offset-2 ring-offset-transparent rounded px-1 -mx-1"
    : onClick
      ? "cursor-text hover:ring-2 hover:ring-emerald-600/30 hover:ring-offset-2 hover:ring-offset-transparent rounded px-1 -mx-1 transition-all"
      : "";

  const Tag = level === 1 ? "h1" : "h2";
  const charCount = text.length;
  const isApproaching = isApproachingLimit(charCount, maxLength);
  const isOver = exceedsLimit(charCount, maxLength);

  // Use inline styles for theme variables with proper hierarchy
  const titleStyle: React.CSSProperties = level === 1
    ? {
        color: 'var(--theme-color-foreground, #0f172a)',
        fontSize: 'var(--theme-typography-title-size, 2.5rem)',
        fontWeight: 'var(--theme-typography-title-weight, 700)' as React.CSSProperties['fontWeight'],
        lineHeight: 'var(--theme-typography-title-line-height, 1.1)',
        letterSpacing: 'var(--theme-typography-title-letter-spacing, -0.025em)',
        textWrap: 'balance' as React.CSSProperties['textWrap'],
      }
    : {
        color: 'var(--theme-color-foreground, #0f172a)',
        fontSize: 'var(--theme-typography-heading-size, 1.5rem)',
        fontWeight: 'var(--theme-typography-heading-weight, 600)' as React.CSSProperties['fontWeight'],
        lineHeight: 'var(--theme-typography-heading-line-height, 1.2)',
        letterSpacing: 'var(--theme-typography-heading-letter-spacing, -0.02em)',
        textWrap: 'balance' as React.CSSProperties['textWrap'],
      };

  return (
    <div className="relative animate-reveal-up">
      <Tag
        ref={editableRef}
        className={`${editingStyles} ${className}`}
        style={titleStyle}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleBlur}
        onClick={handleClick}
        onKeyDown={isEditing ? handleKeyDown : undefined}
        onPaste={isEditing ? handlePaste : undefined}
      >
        {text}
      </Tag>

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
    </div>
  );
}
