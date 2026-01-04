"use client";

/**
 * EditableStatBlock Component (Phase 7)
 *
 * Editable version of StatBlock with inline editing for:
 * - value (max 20 chars) - the big number/metric
 * - label (max 50 chars) - what the stat represents
 * - sublabel (max 100 chars, optional) - additional context
 *
 * Click on any field to edit it directly. Tab to move between fields.
 */

import { useRef, useEffect, useCallback, useState } from "react";
import {
  BLOCK_CONSTRAINTS,
  isApproachingLimit,
  exceedsLimit,
} from "@/lib/editor/constraints";

type EditableField = "value" | "label" | "sublabel" | null;

interface EditableStatBlockProps {
  value: string;
  label: string;
  sublabel?: string;
  className?: string;
  /** Scale factor for dynamic sizing (0.5-1.0), defaults to 1 */
  scale?: number;
  /** Enable inline editing mode */
  isEditing?: boolean;
  /** Callback when any field changes */
  onFieldChange?: (field: "value" | "label" | "sublabel", text: string) => void;
  /** Callback when editing ends (blur outside all fields) */
  onBlur?: () => void;
  /** Callback when block is clicked (to start editing) */
  onClick?: () => void;
}

export function EditableStatBlock({
  value,
  label,
  sublabel,
  className = "",
  scale = 1,
  isEditing = false,
  onFieldChange,
  onBlur,
  onClick,
}: EditableStatBlockProps) {
  const valueRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const sublabelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track which field is currently focused
  const [focusedField, setFocusedField] = useState<EditableField>(null);

  const constraints = BLOCK_CONSTRAINTS.stat_block;

  // Focus the value field when entering edit mode
  useEffect(() => {
    if (isEditing && !focusedField && valueRef.current) {
      valueRef.current.focus();
      setFocusedField("value");
      placeCursorAtEnd(valueRef.current);
    }
  }, [isEditing, focusedField]);

  // Place cursor at end of contentEditable
  const placeCursorAtEnd = (element: HTMLElement) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  // Get max length for a field
  const getMaxLength = (field: EditableField): number => {
    switch (field) {
      case "value":
        return constraints.maxValueChars;
      case "label":
        return constraints.maxLabelChars;
      case "sublabel":
        return constraints.maxSublabelChars;
      default:
        return 100;
    }
  };

  // Handle input changes
  const handleInput = useCallback(
    (field: "value" | "label" | "sublabel") => {
      const ref =
        field === "value"
          ? valueRef
          : field === "label"
            ? labelRef
            : sublabelRef;
      if (ref.current && onFieldChange) {
        const newText = ref.current.textContent ?? "";
        onFieldChange(field, newText);
      }
    },
    [onFieldChange]
  );

  // Handle focus on a field
  const handleFieldFocus = useCallback((field: EditableField) => {
    setFocusedField(field);
  }, []);

  // Handle blur - check if focus moved outside the component
  const handleFieldBlur = useCallback(
    (e: React.FocusEvent) => {
      // Small delay to allow focus to move to another field within the component
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

  // Handle click on container (start editing)
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditing && onClick) {
        onClick();
      }
    },
    [isEditing, onClick]
  );

  // Handle click on a specific field
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
        field === "value"
          ? valueRef
          : field === "label"
            ? labelRef
            : sublabelRef;

      // Tab to next field
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        if (field === "value" && labelRef.current) {
          labelRef.current.focus();
          setFocusedField("label");
          placeCursorAtEnd(labelRef.current);
        } else if (field === "label" && sublabelRef.current) {
          sublabelRef.current.focus();
          setFocusedField("sublabel");
          placeCursorAtEnd(sublabelRef.current);
        } else if (field === "sublabel") {
          // Tab out of component
          onBlur?.();
        }
      }

      // Shift+Tab to previous field
      if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        if (field === "sublabel" && labelRef.current) {
          labelRef.current.focus();
          setFocusedField("label");
          placeCursorAtEnd(labelRef.current);
        } else if (field === "label" && valueRef.current) {
          valueRef.current.focus();
          setFocusedField("value");
          placeCursorAtEnd(valueRef.current);
        }
      }

      // Escape to stop editing
      if (e.key === "Escape") {
        setFocusedField(null);
        onBlur?.();
      }

      // Prevent typing beyond max length
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
        field === "value"
          ? valueRef
          : field === "label"
            ? labelRef
            : sublabelRef;

      const pastedText = e.clipboardData.getData("text/plain");
      const currentText = ref.current?.textContent ?? "";
      const selection = window.getSelection();
      const selectedLength = selection?.toString().length ?? 0;
      const availableSpace = maxLength - currentText.length + selectedLength;
      const textToInsert = pastedText.slice(0, availableSpace);

      document.execCommand("insertText", false, textToInsert);
    },
    []
  );

  // Apply scale to font sizes
  const valueSize =
    scale === 1
      ? "clamp(2.5rem, 4cqw, 3.5rem)"
      : `calc(clamp(2.5rem, 4cqw, 3.5rem) * ${scale})`;

  const labelSize =
    scale === 1
      ? "clamp(0.9rem, 1.4cqw, 1.125rem)"
      : `calc(clamp(0.9rem, 1.4cqw, 1.125rem) * ${Math.max(scale, 0.85)})`;

  const sublabelSize =
    scale === 1
      ? "clamp(0.75rem, 1.1cqw, 0.875rem)"
      : `calc(clamp(0.75rem, 1.1cqw, 0.875rem) * ${Math.max(scale, 0.85)})`;

  // Field editing styles
  const getFieldStyles = (field: EditableField, isFocused: boolean) => {
    if (isFocused) {
      return "outline-none ring-2 ring-blue-500 ring-offset-1 rounded px-1 -mx-1";
    }
    if (isEditing) {
      return "cursor-text hover:ring-2 hover:ring-blue-200 hover:ring-offset-1 rounded px-1 -mx-1 transition-all";
    }
    return "";
  };

  // Character counter for focused field
  const renderCharCounter = (
    field: "value" | "label" | "sublabel",
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

  const containerStyles = onClick && !isEditing
    ? "cursor-pointer hover:ring-2 hover:ring-blue-200 hover:ring-offset-2 rounded transition-all"
    : "";

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center text-center ${containerStyles} ${className}`}
      style={{
        backgroundColor:
          "var(--theme-color-background-subtle, rgba(0, 0, 0, 0.02))",
        borderRadius: "var(--theme-effects-border-radius, 0.75rem)",
        padding: "clamp(1rem, 2cqw, 1.5rem)",
        minHeight:
          scale === 1
            ? "clamp(100px, 10cqw, 140px)"
            : `calc(clamp(100px, 10cqw, 140px) * ${scale})`,
      }}
      onClick={handleContainerClick}
    >
      {/* Value field */}
      <div className="flex items-center">
        <div
          ref={valueRef}
          className={getFieldStyles("value", focusedField === "value")}
          style={{
            fontSize: valueSize,
            color: "var(--theme-color-primary, #3b82f6)",
            fontWeight:
              "var(--theme-typography-display-weight, 800)" as React.CSSProperties["fontWeight"],
            lineHeight: "var(--theme-typography-display-line-height, 1)",
            letterSpacing:
              "var(--theme-typography-display-letter-spacing, -0.03em)",
          }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onInput={() => handleInput("value")}
          onFocus={() => handleFieldFocus("value")}
          onBlur={handleFieldBlur}
          onClick={(e) => handleFieldClick("value", e)}
          onKeyDown={(e) => handleKeyDown("value", e)}
          onPaste={(e) => handlePaste("value", e)}
        >
          {value}
        </div>
        {focusedField === "value" && renderCharCounter("value", value.length)}
      </div>

      {/* Label field */}
      <div className="flex items-center" style={{ marginTop: "clamp(0.5rem, 0.8cqw, 0.75rem)" }}>
        <div
          ref={labelRef}
          className={getFieldStyles("label", focusedField === "label")}
          style={{
            fontSize: labelSize,
            fontWeight:
              "var(--theme-typography-subheading-weight, 600)" as React.CSSProperties["fontWeight"],
            color: "var(--theme-color-foreground, #0f172a)",
          }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onInput={() => handleInput("label")}
          onFocus={() => handleFieldFocus("label")}
          onBlur={handleFieldBlur}
          onClick={(e) => handleFieldClick("label", e)}
          onKeyDown={(e) => handleKeyDown("label", e)}
          onPaste={(e) => handlePaste("label", e)}
        >
          {label}
        </div>
        {focusedField === "label" && renderCharCounter("label", label.length)}
      </div>

      {/* Sublabel field (or placeholder for adding one) */}
      <div className="flex items-center" style={{ marginTop: "clamp(0.25rem, 0.4cqw, 0.375rem)" }}>
        <div
          ref={sublabelRef}
          className={getFieldStyles("sublabel", focusedField === "sublabel")}
          style={{
            fontSize: sublabelSize,
            fontWeight:
              "var(--theme-typography-caption-weight, 500)" as React.CSSProperties["fontWeight"],
            color: "var(--theme-color-foreground-muted, #64748b)",
            minWidth: isEditing && !sublabel ? "100px" : undefined,
          }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onInput={() => handleInput("sublabel")}
          onFocus={() => handleFieldFocus("sublabel")}
          onBlur={handleFieldBlur}
          onClick={(e) => handleFieldClick("sublabel", e)}
          onKeyDown={(e) => handleKeyDown("sublabel", e)}
          onPaste={(e) => handlePaste("sublabel", e)}
          data-placeholder={isEditing && !sublabel ? "Legg til undertekst..." : undefined}
        >
          {sublabel || (isEditing ? "" : "")}
        </div>
        {focusedField === "sublabel" &&
          renderCharCounter("sublabel", (sublabel ?? "").length)}
      </div>
    </div>
  );
}
