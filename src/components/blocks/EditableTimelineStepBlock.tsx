"use client";

/**
 * EditableTimelineStepBlock Component (Phase 7)
 *
 * Editable version of TimelineStepBlock with inline editing for:
 * - step (1-10) - displayed in circle
 * - title (max 80 chars) - step title
 * - description (max 200 chars, optional) - step description
 * - status (dropdown: completed, current, upcoming)
 *
 * Click on any field to edit. Tab to move between fields.
 * Click on status indicator to change status via dropdown.
 */

import { useRef, useEffect, useCallback, useState } from "react";
import {
  BLOCK_CONSTRAINTS,
  isApproachingLimit,
  exceedsLimit,
} from "@/lib/editor/constraints";
import { InlineDropdown, type DropdownOption } from "@/components/ui";

type TimelineStatus = "completed" | "current" | "upcoming";
type EditableField = "step" | "title" | "description" | null;

const STATUS_OPTIONS: DropdownOption<TimelineStatus>[] = [
  { value: "completed", label: "Fullført", color: "#22c55e" },
  { value: "current", label: "Pågår", color: "#3b82f6" },
  { value: "upcoming", label: "Kommende", color: "#94a3b8" },
];

interface EditableTimelineStepBlockProps {
  step: number;
  title: string;
  description?: string;
  status?: TimelineStatus;
  className?: string;
  isLast?: boolean;
  layout?: "vertical" | "horizontal";
  /** Enable inline editing mode */
  isEditing?: boolean;
  /** Callback when any field changes */
  onFieldChange?: (
    field: "step" | "title" | "description" | "status",
    value: string | number
  ) => void;
  /** Callback when editing ends */
  onBlur?: () => void;
  /** Callback when block is clicked */
  onClick?: () => void;
}

export function EditableTimelineStepBlock({
  step,
  title,
  description,
  status = "upcoming",
  className = "",
  isLast = false,
  layout = "vertical",
  isEditing = false,
  onFieldChange,
  onBlur,
  onClick,
}: EditableTimelineStepBlockProps) {
  const stepRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [focusedField, setFocusedField] = useState<EditableField>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const constraints = BLOCK_CONSTRAINTS.timeline_step;
  const isVertical = layout === "vertical";

  // Focus title when entering edit mode
  useEffect(() => {
    if (isEditing && !focusedField && titleRef.current) {
      titleRef.current.focus();
      setFocusedField("title");
      placeCursorAtEnd(titleRef.current);
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
      case "step":
        return 2;
      case "title":
        return constraints.maxTitleChars;
      case "description":
        return constraints.maxDescriptionChars;
      default:
        return 100;
    }
  };

  // Status colors
  const getStatusColors = () => {
    switch (status) {
      case "completed":
        return {
          bg: "var(--theme-color-success, #22c55e)",
          border: "var(--theme-color-success, #22c55e)",
          text: "var(--theme-color-primary-foreground, #ffffff)",
          line: "var(--theme-color-success, #22c55e)",
        };
      case "current":
        return {
          bg: "var(--theme-color-primary, #3b82f6)",
          border: "var(--theme-color-primary, #3b82f6)",
          text: "var(--theme-color-primary-foreground, #ffffff)",
          line: "var(--theme-color-border, #e2e8f0)",
        };
      default:
        return {
          bg: "transparent",
          border: "var(--theme-color-border, #cbd5e1)",
          text: "var(--theme-color-foreground-muted, #64748b)",
          line: "var(--theme-color-border, #e2e8f0)",
        };
    }
  };

  const colors = getStatusColors();

  // Handle text input
  const handleTextInput = useCallback(
    (field: "title" | "description") => {
      const ref = field === "title" ? titleRef : descriptionRef;
      if (ref.current && onFieldChange) {
        const newText = ref.current.textContent ?? "";
        onFieldChange(field, newText);
      }
    },
    [onFieldChange]
  );

  // Handle step input
  const handleStepInput = useCallback(() => {
    if (stepRef.current && onFieldChange) {
      const rawText = stepRef.current.textContent ?? "";
      const parsed = parseInt(rawText, 10);
      if (!isNaN(parsed)) {
        const clamped = Math.max(
          constraints.minStep,
          Math.min(constraints.maxStep, parsed)
        );
        onFieldChange("step", clamped);
      }
    }
  }, [onFieldChange, constraints]);

  // Handle status change
  const handleStatusChange = useCallback(
    (newStatus: TimelineStatus) => {
      onFieldChange?.("status", newStatus);
    },
    [onFieldChange]
  );

  const handleFieldFocus = useCallback((field: EditableField) => {
    setFocusedField(field);
  }, []);

  const handleFieldBlur = useCallback(
    (e: React.FocusEvent) => {
      requestAnimationFrame(() => {
        if (
          containerRef.current &&
          !containerRef.current.contains(document.activeElement) &&
          !statusDropdownOpen
        ) {
          setFocusedField(null);
          onBlur?.();
        }
      });
    },
    [onBlur, statusDropdownOpen]
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
        field === "step"
          ? stepRef
          : field === "title"
            ? titleRef
            : descriptionRef;

      // Tab navigation
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        if (field === "step" && titleRef.current) {
          titleRef.current.focus();
          setFocusedField("title");
          placeCursorAtEnd(titleRef.current);
        } else if (field === "title" && descriptionRef.current) {
          descriptionRef.current.focus();
          setFocusedField("description");
          placeCursorAtEnd(descriptionRef.current);
        } else if (field === "description") {
          onBlur?.();
        }
      }

      if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        if (field === "description" && titleRef.current) {
          titleRef.current.focus();
          setFocusedField("title");
          placeCursorAtEnd(titleRef.current);
        } else if (field === "title" && stepRef.current) {
          stepRef.current.focus();
          setFocusedField("step");
          placeCursorAtEnd(stepRef.current);
        }
      }

      if (e.key === "Escape") {
        setFocusedField(null);
        onBlur?.();
      }

      // Step field - only digits
      if (field === "step") {
        if (
          !/[0-9]/.test(e.key) &&
          !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Escape"].includes(e.key) &&
          !e.metaKey &&
          !e.ctrlKey
        ) {
          e.preventDefault();
        }
        if (
          /[0-9]/.test(e.key) &&
          ref.current?.textContent &&
          ref.current.textContent.length >= 2
        ) {
          e.preventDefault();
        }
        return;
      }

      // Text fields - max length
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
        field === "step"
          ? stepRef
          : field === "title"
            ? titleRef
            : descriptionRef;

      let pastedText = e.clipboardData.getData("text/plain");

      if (field === "step") {
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
    field: "title" | "description",
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

  return (
    <div
      ref={containerRef}
      className={`flex ${isVertical ? "flex-row" : "flex-col items-center"} ${className}`}
      style={{ minHeight: isVertical ? "80px" : "auto" }}
      onClick={handleContainerClick}
    >
      {/* Status indicator column */}
      <div
        className={`flex ${isVertical ? "flex-col items-center" : "flex-row items-center justify-center"}`}
        style={{ width: isVertical ? "40px" : "auto", flexShrink: 0 }}
      >
        {/* Circle/node - editable step number OR status dropdown */}
        <div className="relative">
          {isEditing ? (
            <div className="flex flex-col items-center gap-1">
              {/* Editable step number */}
              <div
                ref={stepRef}
                className={`flex items-center justify-center rounded-full font-semibold ${
                  focusedField === "step"
                    ? "ring-2 ring-blue-500 ring-offset-2"
                    : "cursor-text hover:ring-2 hover:ring-blue-200 hover:ring-offset-2 transition-all"
                }`}
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: colors.bg,
                  border: `2px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: "0.875rem",
                  boxShadow:
                    status === "current" ? "0 0 0 4px rgba(59, 130, 246, 0.2)" : "none",
                }}
                contentEditable={status !== "completed"}
                suppressContentEditableWarning
                onInput={handleStepInput}
                onFocus={() => handleFieldFocus("step")}
                onBlur={handleFieldBlur}
                onClick={(e) => handleFieldClick("step", e)}
                onKeyDown={(e) => handleKeyDown("step", e)}
                onPaste={(e) => handlePaste("step", e)}
              >
                {status === "completed" ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step
                )}
              </div>

              {/* Status dropdown */}
              <InlineDropdown
                value={status}
                options={STATUS_OPTIONS}
                onChange={handleStatusChange}
                onClose={() => setStatusDropdownOpen(false)}
                variant="badge"
                className="mt-1"
                clickToOpen
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-full font-semibold"
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: colors.bg,
                border: `2px solid ${colors.border}`,
                color: colors.text,
                fontSize: "0.875rem",
                boxShadow:
                  status === "current" ? "0 0 0 4px rgba(59, 130, 246, 0.2)" : "none",
              }}
            >
              {status === "completed" ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                step
              )}
            </div>
          )}
        </div>

        {/* Connecting line */}
        {!isLast && (
          <div
            style={{
              ...(isVertical
                ? { width: "2px", flex: 1, minHeight: "32px" }
                : { height: "2px", width: "48px", marginLeft: "8px", marginRight: "8px" }),
              backgroundColor: colors.line,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div
        className={`flex flex-col ${isVertical ? "pb-4" : "text-center"}`}
        style={{
          flex: isVertical ? 1 : undefined,
          minWidth: !isVertical ? "clamp(120px, 20cqw, 200px)" : undefined,
          marginLeft: isVertical ? "var(--theme-spacing-md, 1rem)" : undefined,
          marginTop: !isVertical ? "var(--theme-spacing-md, 1rem)" : undefined,
        }}
      >
        {/* Title */}
        <div className="flex items-center">
          <div
            ref={titleRef}
            className={getFieldStyles("title", focusedField === "title")}
            style={{
              fontSize: isVertical
                ? "var(--theme-typography-subheading-size, 1.125rem)"
                : "var(--theme-typography-heading-size, clamp(1.125rem, 1.8cqw, 1.375rem))",
              fontWeight:
                "var(--theme-typography-heading-weight, 600)" as React.CSSProperties["fontWeight"],
              color: "var(--theme-color-foreground, #0f172a)",
              lineHeight: "var(--theme-typography-heading-line-height, 1.3)",
            }}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onInput={() => handleTextInput("title")}
            onFocus={() => handleFieldFocus("title")}
            onBlur={handleFieldBlur}
            onClick={(e) => handleFieldClick("title", e)}
            onKeyDown={(e) => handleKeyDown("title", e)}
            onPaste={(e) => handlePaste("title", e)}
          >
            {title}
          </div>
          {focusedField === "title" && renderCharCounter("title", title.length)}
        </div>

        {/* Description */}
        <div
          className="flex items-start"
          style={{ marginTop: "var(--theme-spacing-sm, 0.5rem)" }}
        >
          <div
            ref={descriptionRef}
            className={getFieldStyles("description", focusedField === "description")}
            style={{
              fontSize: isVertical
                ? "var(--theme-typography-body-size, 0.9375rem)"
                : "var(--theme-typography-body-size, clamp(0.875rem, 1.3cqw, 1rem))",
              color: "var(--theme-color-foreground-muted, #64748b)",
              lineHeight: "var(--theme-typography-body-line-height, 1.5)",
              maxWidth: !isVertical ? "clamp(150px, 25cqw, 250px)" : undefined,
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
            data-placeholder={
              isEditing && !description ? "Legg til beskrivelse..." : undefined
            }
          >
            {description || ""}
          </div>
          {focusedField === "description" &&
            renderCharCounter("description", (description ?? "").length)}
        </div>
      </div>
    </div>
  );
}
