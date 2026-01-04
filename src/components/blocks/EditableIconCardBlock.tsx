"use client";

/**
 * EditableIconCardBlock Component (Phase 7)
 *
 * Editable version of IconCardBlock with inline editing for:
 * - icon (picker from available icons)
 * - text (max 60 chars) - card title
 * - description (max 150 chars, optional) - card body
 * - bgColor (color picker from presets)
 *
 * Features IconPicker and ColorSwatchPicker for visual editing.
 */

import { useRef, useEffect, useCallback, useState } from "react";
import {
  Circle,
  Zap,
  Shield,
  Globe,
  Heart,
  Star,
  Check,
  Clock,
  Users,
  Settings,
  TrendingUp,
  Target,
  Award,
  Lightbulb,
  Rocket,
  Lock,
  Cpu,
  Database,
  Cloud,
  BarChart,
  type LucideIcon,
} from "lucide-react";
import { BLOCK_CONSTRAINTS, isApproachingLimit, exceedsLimit } from "@/lib/editor/constraints";
import { IconPicker, ColorSwatchPicker } from "@/components/ui";

type EditableField = "text" | "description" | null;

// Icon map (same as IconCardBlock)
const iconMap: Record<string, LucideIcon> = {
  circle: Circle,
  zap: Zap,
  shield: Shield,
  globe: Globe,
  heart: Heart,
  star: Star,
  check: Check,
  clock: Clock,
  users: Users,
  settings: Settings,
  "trending-up": TrendingUp,
  trendingup: TrendingUp,
  target: Target,
  award: Award,
  lightbulb: Lightbulb,
  rocket: Rocket,
  lock: Lock,
  cpu: Cpu,
  database: Database,
  cloud: Cloud,
  "bar-chart": BarChart,
  barchart: BarChart,
};

function getIconComponent(iconName: string): LucideIcon {
  const normalizedName = iconName.toLowerCase();
  return iconMap[normalizedName] || Circle;
}

// Color presets (same as IconCardBlock)
const COLOR_PRESETS = {
  pink: {
    bg: "rgba(236, 72, 153, 0.12)",
    border: "rgba(236, 72, 153, 0.3)",
    iconBg: "rgba(236, 72, 153, 0.2)",
    icon: "#be185d",
    shadow: "var(--theme-effects-shadow-pink, 0 4px 14px rgba(236, 72, 153, 0.15))",
  },
  purple: {
    bg: "rgba(147, 51, 234, 0.12)",
    border: "rgba(147, 51, 234, 0.3)",
    iconBg: "rgba(147, 51, 234, 0.2)",
    icon: "#7c3aed",
    shadow: "var(--theme-effects-shadow-purple, 0 4px 14px rgba(139, 92, 246, 0.15))",
  },
  blue: {
    bg: "rgba(59, 130, 246, 0.12)",
    border: "rgba(59, 130, 246, 0.3)",
    iconBg: "rgba(59, 130, 246, 0.2)",
    icon: "#2563eb",
    shadow: "var(--theme-effects-shadow-blue, 0 4px 14px rgba(59, 130, 246, 0.15))",
  },
  green: {
    bg: "rgba(34, 197, 94, 0.12)",
    border: "rgba(34, 197, 94, 0.3)",
    iconBg: "rgba(34, 197, 94, 0.2)",
    icon: "#16a34a",
    shadow: "0 4px 14px rgba(34, 197, 94, 0.15)",
  },
  orange: {
    bg: "rgba(249, 115, 22, 0.12)",
    border: "rgba(249, 115, 22, 0.3)",
    iconBg: "rgba(249, 115, 22, 0.2)",
    icon: "#ea580c",
    shadow: "0 4px 14px rgba(249, 115, 22, 0.15)",
  },
  cyan: {
    bg: "rgba(6, 182, 212, 0.12)",
    border: "rgba(6, 182, 212, 0.3)",
    iconBg: "rgba(6, 182, 212, 0.2)",
    icon: "#0891b2",
    shadow: "0 4px 14px rgba(6, 182, 212, 0.15)",
  },
  yellow: {
    bg: "rgba(234, 179, 8, 0.12)",
    border: "rgba(234, 179, 8, 0.3)",
    iconBg: "rgba(234, 179, 8, 0.2)",
    icon: "#ca8a04",
    shadow: "0 4px 14px rgba(234, 179, 8, 0.15)",
  },
  red: {
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.3)",
    iconBg: "rgba(239, 68, 68, 0.2)",
    icon: "#dc2626",
    shadow: "0 4px 14px rgba(239, 68, 68, 0.15)",
  },
} as const;

type ColorPreset = keyof typeof COLOR_PRESETS;

interface EditableIconCardBlockProps {
  icon: string;
  text: string;
  description?: string;
  bgColor?: string;
  className?: string;
  /** Enable inline editing mode */
  isEditing?: boolean;
  /** Callback when any field changes */
  onFieldChange?: (field: "icon" | "text" | "description" | "bgColor", value: string) => void;
  /** Callback when editing ends */
  onBlur?: () => void;
  /** Callback when block is clicked */
  onClick?: () => void;
}

export function EditableIconCardBlock({
  icon,
  text,
  description,
  bgColor,
  className = "",
  isEditing = false,
  onFieldChange,
  onBlur,
  onClick,
}: EditableIconCardBlockProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [focusedField, setFocusedField] = useState<EditableField>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const constraints = BLOCK_CONSTRAINTS.icon_card;

  // Focus text when entering edit mode
  useEffect(() => {
    if (isEditing && !focusedField && !iconPickerOpen && !colorPickerOpen && textRef.current) {
      textRef.current.focus();
      setFocusedField("text");
      placeCursorAtEnd(textRef.current);
    }
  }, [isEditing, focusedField, iconPickerOpen, colorPickerOpen]);

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
      case "text":
        return constraints.maxTextChars;
      case "description":
        return constraints.maxDescriptionChars;
      default:
        return 100;
    }
  };

  // Get colors based on preset
  const getColors = () => {
    if (bgColor) {
      const normalizedColor = bgColor.toLowerCase() as ColorPreset;
      if (normalizedColor in COLOR_PRESETS) {
        return COLOR_PRESETS[normalizedColor];
      }
    }
    return COLOR_PRESETS.purple;
  };

  const colors = getColors();
  const IconComponent = getIconComponent(icon);

  // Handle text input
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

  // Handle icon change
  const handleIconChange = useCallback(
    (newIcon: string) => {
      onFieldChange?.("icon", newIcon);
    },
    [onFieldChange]
  );

  // Handle color change
  const handleColorChange = useCallback(
    (newColor: string) => {
      onFieldChange?.("bgColor", newColor);
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
          !iconPickerOpen &&
          !colorPickerOpen
        ) {
          setFocusedField(null);
          onBlur?.();
        }
      });
    },
    [onBlur, iconPickerOpen, colorPickerOpen]
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
      const ref = field === "text" ? textRef : descriptionRef;

      // Tab navigation
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        if (field === "text" && descriptionRef.current) {
          descriptionRef.current.focus();
          setFocusedField("description");
          placeCursorAtEnd(descriptionRef.current);
        } else if (field === "description") {
          onBlur?.();
        }
      }

      if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        if (field === "description" && textRef.current) {
          textRef.current.focus();
          setFocusedField("text");
          placeCursorAtEnd(textRef.current);
        }
      }

      if (e.key === "Escape") {
        setFocusedField(null);
        onBlur?.();
      }

      // Max length check
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
  const handlePaste = useCallback((field: EditableField, e: React.ClipboardEvent) => {
    e.preventDefault();
    const maxLength = getMaxLength(field);
    const ref = field === "text" ? textRef : descriptionRef;

    const pastedText = e.clipboardData.getData("text/plain");
    const currentText = ref.current?.textContent ?? "";
    const selection = window.getSelection();
    const selectedLength = selection?.toString().length ?? 0;
    const availableSpace = maxLength - currentText.length + selectedLength;
    const textToInsert = pastedText.slice(0, availableSpace);

    document.execCommand("insertText", false, textToInsert);
  }, []);

  const getFieldStyles = (field: EditableField, isFocused: boolean) => {
    if (isFocused) {
      return "outline-none ring-2 ring-blue-500 ring-offset-1 rounded px-1 -mx-1";
    }
    if (isEditing) {
      return "cursor-text hover:ring-2 hover:ring-blue-200 hover:ring-offset-1 rounded px-1 -mx-1 transition-all";
    }
    return "";
  };

  const renderCharCounter = (field: "text" | "description", currentLength: number) => {
    const maxLength = getMaxLength(field);
    const isOver = exceedsLimit(currentLength, maxLength);
    const isApproaching = isApproachingLimit(currentLength, maxLength);

    return (
      <span
        className={`text-xs ml-2 ${
          isOver ? "text-red-500 font-medium" : isApproaching ? "text-amber-500" : "text-gray-400"
        }`}
      >
        {currentLength}/{maxLength}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-start transition-all duration-200 ${className}`}
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "var(--theme-effects-border-radius-large, 1rem)",
        padding: "var(--theme-spacing-content-padding, clamp(1.25rem, 2cqw, 1.5rem))",
        minHeight: "clamp(140px, 12cqw, 180px)",
        boxShadow: isHovered && !isEditing ? colors.shadow : "none",
        transform: isHovered && !isEditing ? "translateY(-4px)" : "none",
      }}
      onClick={handleContainerClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon section - with picker in edit mode */}
      <div
        className="flex items-center gap-2 mb-3"
        style={{ marginBottom: "var(--theme-spacing-sm, clamp(0.75rem, 1.2cqw, 1rem))" }}
      >
        {isEditing ? (
          <>
            <IconPicker
              value={icon}
              onChange={handleIconChange}
              onClose={() => setIconPickerOpen(false)}
              trigger={
                <div
                  className="flex items-center justify-center rounded-full cursor-pointer hover:ring-2 hover:ring-blue-200 hover:ring-offset-2 transition-all"
                  style={{
                    backgroundColor: colors.iconBg,
                    width: "clamp(2.5rem, 3.5cqw, 3.25rem)",
                    height: "clamp(2.5rem, 3.5cqw, 3.25rem)",
                  }}
                  onClick={() => setIconPickerOpen(!iconPickerOpen)}
                >
                  <IconComponent
                    className="w-[clamp(1.25rem,1.8cqw,1.5rem)] h-[clamp(1.25rem,1.8cqw,1.5rem)]"
                    strokeWidth={2}
                    style={{ color: colors.icon }}
                  />
                </div>
              }
            />
            <ColorSwatchPicker
              value={bgColor || "purple"}
              onChange={handleColorChange}
              onClose={() => setColorPickerOpen(false)}
            />
          </>
        ) : (
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              backgroundColor: colors.iconBg,
              width: "clamp(2.5rem, 3.5cqw, 3.25rem)",
              height: "clamp(2.5rem, 3.5cqw, 3.25rem)",
            }}
          >
            <IconComponent
              className="w-[clamp(1.25rem,1.8cqw,1.5rem)] h-[clamp(1.25rem,1.8cqw,1.5rem)]"
              strokeWidth={2}
              style={{ color: colors.icon }}
            />
          </div>
        )}
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
            marginBottom: "var(--theme-spacing-xs, clamp(0.375rem, 0.6cqw, 0.5rem))",
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
