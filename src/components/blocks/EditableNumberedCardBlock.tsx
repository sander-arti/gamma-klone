"use client";

/**
 * EditableNumberedCardBlock Component (Phase 7)
 *
 * Editable version of NumberedCardBlock with inline editing for:
 * - number (1-99) - displayed in badge
 * - text (max 60 chars) - card title
 * - description (max 150 chars, optional) - card body text
 *
 * Click on any field to edit. Tab to move between fields.
 */

import { useRef, useEffect, useCallback, useState } from "react";
import {
  BLOCK_CONSTRAINTS,
  isApproachingLimit,
  exceedsLimit,
} from "@/lib/editor/constraints";

type EditableField = "number" | "text" | "description" | null;

interface EditableNumberedCardBlockProps {
  number: number;
  text: string;
  description?: string;
  className?: string;
  /** Enable inline editing mode */
  isEditing?: boolean;
  /** Callback when any field changes */
  onFieldChange?: (
    field: "number" | "text" | "description",
    value: string | number
  ) => void;
  /** Callback when editing ends (blur outside all fields) */
  onBlur?: () => void;
  /** Callback when block is clicked (to start editing) */
  onClick?: () => void;
}

export function EditableNumberedCardBlock({
  number,
  text,
  description,
  className = "",
  isEditing = false,
  onFieldChange,
  onBlur,
  onClick,
}: EditableNumberedCardBlockProps) {
  const numberRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [focusedField, setFocusedField] = useState<EditableField>(null);
  const [isHovered, setIsHovered] = useState(false);

  const constraints = BLOCK_CONSTRAINTS.numbered_card;

  // Focus the text field when entering edit mode (number is less commonly edited)
  useEffect(() => {
    if (isEditing && !focusedField && textRef.current) {
      textRef.current.focus();
      setFocusedField("text");
      placeCursorAtEnd(textRef.current);
    }
  }, [isEditing, focusedField]);

  const placeCursorAtEnd = (element: HTMLElement) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const getMaxLength = (field: EditableField): number => {
    switch (field) {
      case "number":
        return 2; // Max 99
      case "text":
        return constraints.maxTextChars;
      case "description":
        return constraints.maxDescriptionChars;
      default:
        return 100;
    }
  };

  // Handle input for text fields
  const handleTextInput = useCallback(
    (field: "text" | "description") => {
      const ref = field === "text" ? textRef : descriptionRef;
      if (ref.current && onFieldChange) {
        const newText = ref.current.textContent ?? "";
        onFieldChange(field, newText);
      }
    },
    [onFieldChange]
  );

  // Handle input for number field
  const handleNumberInput = useCallback(() => {
    if (numberRef.current && onFieldChange) {
      const rawText = numberRef.current.textContent ?? "";
      const parsed = parseInt(rawText, 10);
      if (!isNaN(parsed)) {
        const clamped = Math.max(
          constraints.minNumber,
          Math.min(constraints.maxNumber, parsed)
        );
        onFieldChange("number", clamped);
      }
    }
  }, [onFieldChange, constraints]);

  const handleFieldFocus = useCallback((field: EditableField) => {
    setFocusedField(field);
  }, []);

  const handleFieldBlur = useCallback(
    (e: React.FocusEvent) => {
      requestAnimationFrame(() => {
        if (
          containerRef.current &&
          !containerRef.current.contains(document.activeElement)
        ) {
          setFocusedField(null);
          onBlur?.();
        }
      });
    },
    [onBlur]
  );

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditing && onClick) {
        onClick();
      }
    },
    [isEditing, onClick]
  );

  const handleFieldClick = useCallback(
    (field: EditableField, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isEditing && onClick) {
        onClick();
      }
      setFocusedField(field);
    },
    [isEditing, onClick]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (field: EditableField, e: React.KeyboardEvent) => {
      const maxLength = getMaxLength(field);
      const ref =
        field === "number"
          ? numberRef
          : field === "text"
            ? textRef
            : descriptionRef;

      // Tab to next field
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        if (field === "number" && textRef.current) {
          textRef.current.focus();
          setFocusedField("text");
          placeCursorAtEnd(textRef.current);
        } else if (field === "text" && descriptionRef.current) {
          descriptionRef.current.focus();
          setFocusedField("description");
          placeCursorAtEnd(descriptionRef.current);
        } else if (field === "description") {
          onBlur?.();
        }
      }

      // Shift+Tab to previous field
      if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        if (field === "description" && textRef.current) {
          textRef.current.focus();
          setFocusedField("text");
          placeCursorAtEnd(textRef.current);
        } else if (field === "text" && numberRef.current) {
          numberRef.current.focus();
          setFocusedField("number");
          placeCursorAtEnd(numberRef.current);
        }
      }

      // Escape to stop editing
      if (e.key === "Escape") {
        setFocusedField(null);
        onBlur?.();
      }

      // Special handling for number field - only allow digits
      if (field === "number") {
        if (
          !/[0-9]/.test(e.key) &&
          !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Escape"].includes(e.key) &&
          !e.metaKey &&
          !e.ctrlKey
        ) {
          e.preventDefault();
        }
        // Limit to 2 digits
        if (
          /[0-9]/.test(e.key) &&
          ref.current?.textContent &&
          ref.current.textContent.length >= 2
        ) {
          e.preventDefault();
        }
        return;
      }

      // Prevent typing beyond max length for text fields
      if (
        ref.current &&
        ref.current.textContent &&
        ref.current.textContent.length >= maxLength &&
        !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Escape"].includes(e.key) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
      }
    },
    [onBlur]
  );

  // Handle paste
  const handlePaste = useCallback(
    (field: EditableField, e: React.ClipboardEvent) => {
      e.preventDefault();
      const maxLength = getMaxLength(field);
      const ref =
        field === "number"
          ? numberRef
          : field === "text"
            ? textRef
            : descriptionRef;

      let pastedText = e.clipboardData.getData("text/plain");

      // For number field, only allow digits
      if (field === "number") {
        pastedText = pastedText.replace(/[^0-9]/g, "").slice(0, 2);
      }

      const currentText = ref.current?.textContent ?? "";
      const selection = window.getSelection();
      const selectedLength = selection?.toString().length ?? 0;
      const availableSpace = maxLength - currentText.length + selectedLength;
      const textToInsert = pastedText.slice(0, availableSpace);

      document.execCommand("insertText", false, textToInsert);
    },
    []
  );

  const getFieldStyles = (field: EditableField, isFocused: boolean) => {
    if (isFocused) {
      return "outline-none ring-2 ring-blue-500 ring-offset-1 rounded px-1 -mx-1";
    }
    if (isEditing) {
      return "cursor-text hover:ring-2 hover:ring-blue-200 hover:ring-offset-1 rounded px-1 -mx-1 transition-all";
    }
    return "";
  };

  const renderCharCounter = (
    field: "text" | "description",
    currentLength: number
  ) => {
    const maxLength = getMaxLength(field);
    const isOver = exceedsLimit(currentLength, maxLength);
    const isApproaching = isApproachingLimit(currentLength, maxLength);

    return (
      <span
        className={`text-xs ml-2 ${
          isOver
            ? "text-red-500 font-medium"
            : isApproaching
              ? "text-amber-500"
              : "text-gray-400"
        }`}
      >
        {currentLength}/{maxLength}
      </span>
    );
  };

  const containerStyles =
    onClick && !isEditing
      ? "cursor-pointer"
      : "";

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-start transition-all duration-200 ${containerStyles} ${className}`}
      style={{
        backgroundColor:
          "var(--theme-color-background-subtle, rgba(241, 245, 249, 0.5))",
        borderRadius: "var(--theme-effects-border-radius-large, 1rem)",
        padding: "var(--theme-spacing-content-padding, clamp(1.25rem, 2cqw, 1.5rem))",
        minHeight: "clamp(130px, 12cqw, 160px)",
        border: "1px solid var(--theme-color-border-subtle, rgba(226, 232, 240, 0.6))",
        boxShadow:
          isHovered && !isEditing
            ? "var(--theme-effects-box-shadow-large, 0 8px 20px -3px rgba(0, 0, 0, 0.08))"
            : "var(--theme-effects-box-shadow-small, 0 1px 2px rgba(0, 0, 0, 0.04))",
        transform: isHovered && !isEditing ? "translateY(-4px)" : "none",
      }}
      onClick={handleContainerClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Number badge */}
      <div
        ref={numberRef}
        className={`flex items-center justify-center rounded-full ${
          focusedField === "number"
            ? "ring-2 ring-blue-500 ring-offset-2"
            : isEditing
              ? "cursor-text hover:ring-2 hover:ring-blue-200 hover:ring-offset-2 transition-all"
              : ""
        }`}
        style={{
          width: "clamp(2.25rem, 3cqw, 2.75rem)",
          height: "clamp(2.25rem, 3cqw, 2.75rem)",
          background:
            "var(--theme-effects-gradient-primary, linear-gradient(135deg, #3b82f6 0%, #6366f1 100%))",
          color: "var(--theme-color-primary-foreground, #ffffff)",
          fontSize: "var(--theme-typography-subheading-size, clamp(1rem, 1.4cqw, 1.125rem))",
          fontWeight:
            "var(--theme-typography-heading-weight, 700)" as React.CSSProperties["fontWeight"],
          marginBottom: "var(--theme-spacing-sm, clamp(0.75rem, 1.2cqw, 1rem))",
          boxShadow: "var(--theme-effects-shadow-blue, 0 2px 8px rgba(59, 130, 246, 0.25))",
        }}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onInput={handleNumberInput}
        onFocus={() => handleFieldFocus("number")}
        onBlur={handleFieldBlur}
        onClick={(e) => handleFieldClick("number", e)}
        onKeyDown={(e) => handleKeyDown("number", e)}
        onPaste={(e) => handlePaste("number", e)}
      >
        {number}
      </div>

      {/* Title */}
      <div className="flex items-center w-full">
        <div
          ref={textRef}
          className={getFieldStyles("text", focusedField === "text")}
          style={{
            fontSize: "var(--theme-typography-subheading-size, clamp(1rem, 1.5cqw, 1.125rem))",
            fontWeight:
              "var(--theme-typography-subheading-weight, 600)" as React.CSSProperties["fontWeight"],
            color: "var(--theme-color-foreground, #0f172a)",
            lineHeight: "var(--theme-typography-subheading-line-height, 1.3)",
            letterSpacing: "var(--theme-typography-letter-spacing-tight, -0.01em)",
            marginBottom: "var(--theme-spacing-xs, clamp(0.25rem, 0.5cqw, 0.375rem))",
            flex: 1,
          }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onInput={() => handleTextInput("text")}
          onFocus={() => handleFieldFocus("text")}
          onBlur={handleFieldBlur}
          onClick={(e) => handleFieldClick("text", e)}
          onKeyDown={(e) => handleKeyDown("text", e)}
          onPaste={(e) => handlePaste("text", e)}
        >
          {text}
        </div>
        {focusedField === "text" && renderCharCounter("text", text.length)}
      </div>

      {/* Description */}
      <div className="flex items-start w-full">
        <div
          ref={descriptionRef}
          className={getFieldStyles("description", focusedField === "description")}
          style={{
            fontSize: "var(--theme-typography-body-small-size, clamp(0.8rem, 1.2cqw, 0.875rem))",
            color: "var(--theme-color-foreground-muted, #64748b)",
            lineHeight: "var(--theme-typography-body-small-line-height, 1.6)",
            flex: 1,
            minHeight: isEditing && !description ? "1.5em" : undefined,
          }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onInput={() => handleTextInput("description")}
          onFocus={() => handleFieldFocus("description")}
          onBlur={handleFieldBlur}
          onClick={(e) => handleFieldClick("description", e)}
          onKeyDown={(e) => handleKeyDown("description", e)}
          onPaste={(e) => handlePaste("description", e)}
          data-placeholder={isEditing && !description ? "Legg til beskrivelse..." : undefined}
        >
          {description || ""}
        </div>
        {focusedField === "description" &&
          renderCharCounter("description", (description ?? "").length)}
      </div>
    </div>
  );
}
