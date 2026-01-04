"use client";

/**
 * CalloutBlock Component
 *
 * Renders a highlighted callout with different style variants.
 * Supports inline editing via contentEditable when isEditing is true.
 * Features icons, shadows, and entrance animations.
 */

import { useRef, useEffect, useCallback } from "react";
import { Info, AlertTriangle, CheckCircle, Quote } from "lucide-react";
import {
  BLOCK_CONSTRAINTS,
  isApproachingLimit,
  exceedsLimit,
} from "@/lib/editor/constraints";

interface CalloutBlockProps {
  text: string;
  style?: "info" | "warning" | "success" | "quote";
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

export function CalloutBlock({
  text,
  style = "info",
  className = "",
  isEditing = false,
  onTextChange,
  onBlur,
  onClick,
}: CalloutBlockProps) {
  const editableRef = useRef<HTMLParagraphElement>(null);
  const maxLength = BLOCK_CONSTRAINTS.callout.maxChars;

  // Focus when entering edit mode
  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      // Place cursor at end
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
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

  // Handle key events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Prevent typing beyond max length
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

  // Style configuration for each callout type
  const styleConfig: Record<string, {
    borderColor: string;
    bgColor: string;
    iconColor: string;
    Icon: typeof Info;
  }> = {
    info: {
      borderColor: "var(--theme-color-info, #3b82f6)",
      bgColor: "rgba(59, 130, 246, 0.08)",
      iconColor: "var(--theme-color-info, #3b82f6)",
      Icon: Info,
    },
    warning: {
      borderColor: "var(--theme-color-warning, #f59e0b)",
      bgColor: "rgba(245, 158, 11, 0.08)",
      iconColor: "var(--theme-color-warning, #f59e0b)",
      Icon: AlertTriangle,
    },
    success: {
      borderColor: "var(--theme-color-success, #10b981)",
      bgColor: "rgba(16, 185, 129, 0.08)",
      iconColor: "var(--theme-color-success, #10b981)",
      Icon: CheckCircle,
    },
    quote: {
      borderColor: "var(--theme-color-primary, #6366f1)",
      bgColor: "var(--theme-color-background-muted, #f1f5f9)",
      iconColor: "var(--theme-color-primary, #6366f1)",
      Icon: Quote,
    },
  };

  const config = styleConfig[style];
  const IconComponent = config.Icon;

  // Get container style with shadow and animation
  const getContainerStyle = (): React.CSSProperties => ({
    padding: 'var(--theme-spacing-content-padding, 1.25rem)',
    paddingLeft: 'calc(var(--theme-spacing-content-padding, 1.25rem) + 2rem)',
    borderRadius: 'var(--theme-effects-border-radius, 0.75rem)',
    backgroundColor: config.bgColor,
    borderLeft: `var(--theme-effects-callout-border-width, 4px) solid ${config.borderColor}`,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
    position: 'relative',
  });

  // Get text style using proper typography tokens
  const getTextStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      color: 'var(--theme-color-foreground, #0f172a)',
    };
    if (style === "quote") {
      return {
        ...baseStyle,
        fontSize: 'var(--theme-typography-quote-size, 1.25rem)',
        fontWeight: 'var(--theme-typography-quote-weight, 400)' as React.CSSProperties['fontWeight'],
        fontStyle: 'var(--theme-typography-quote-style, italic)' as React.CSSProperties['fontStyle'],
        lineHeight: 'var(--theme-typography-quote-line-height, 1.5)',
      };
    }
    return {
      ...baseStyle,
      fontSize: 'var(--theme-typography-body-size, 0.9375rem)',
      lineHeight: 'var(--theme-typography-body-line-height, 1.65)',
    };
  };

  const editingStyles = isEditing
    ? "ring-2 ring-emerald-600 ring-offset-2 ring-offset-transparent"
    : onClick
      ? "cursor-text hover:ring-2 hover:ring-emerald-600/30 hover:ring-offset-2 hover:ring-offset-transparent transition-all"
      : "";

  const charCount = text.length;
  const isApproaching = isApproachingLimit(charCount, maxLength);
  const isOver = exceedsLimit(charCount, maxLength);

  return (
    <div className="relative animate-fade-in">
      <div
        className={`${editingStyles} ${className}`}
        style={getContainerStyle()}
        onClick={handleClick}
      >
        {/* Icon positioned absolutely on the left */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: 'var(--theme-spacing-content-padding, 1.25rem)',
            top: 'var(--theme-spacing-content-padding, 1.25rem)',
            color: config.iconColor,
          }}
          contentEditable={false}
        >
          <IconComponent
            size={style === "quote" ? 20 : 18}
            strokeWidth={style === "quote" ? 2.5 : 2}
          />
        </div>

        <p
          ref={editableRef}
          className="outline-none whitespace-pre-wrap"
          style={getTextStyle()}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleBlur}
          onKeyDown={isEditing ? handleKeyDown : undefined}
          onPaste={isEditing ? handlePaste : undefined}
        >
          {text}
        </p>
      </div>

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
