"use client";

/**
 * ColorSwatchPicker Component
 *
 * A popover for selecting colors from a predefined palette.
 * Used in EditableIconCardBlock for changing card background color.
 *
 * Features:
 * - Grid of color swatches
 * - Keyboard navigation
 * - Current selection highlighted with checkmark
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";

export interface ColorOption {
  name: string;
  label: string;
  /** The display color for the swatch */
  color: string;
  /** Preview background color */
  bgPreview: string;
}

export const AVAILABLE_COLORS: ColorOption[] = [
  { name: "pink", label: "Rosa", color: "#ec4899", bgPreview: "rgba(236, 72, 153, 0.12)" },
  { name: "purple", label: "Lilla", color: "#9333ea", bgPreview: "rgba(147, 51, 234, 0.12)" },
  { name: "blue", label: "Blå", color: "#3b82f6", bgPreview: "rgba(59, 130, 246, 0.12)" },
  { name: "cyan", label: "Cyan", color: "#06b6d4", bgPreview: "rgba(6, 182, 212, 0.12)" },
  { name: "green", label: "Grønn", color: "#22c55e", bgPreview: "rgba(34, 197, 94, 0.12)" },
  { name: "yellow", label: "Gul", color: "#eab308", bgPreview: "rgba(234, 179, 8, 0.12)" },
  { name: "orange", label: "Oransje", color: "#f97316", bgPreview: "rgba(249, 115, 22, 0.12)" },
  { name: "red", label: "Rød", color: "#ef4444", bgPreview: "rgba(239, 68, 68, 0.12)" },
];

interface ColorSwatchPickerProps {
  value: string;
  onChange: (colorName: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
  className?: string;
}

export function ColorSwatchPicker({
  value,
  onChange,
  onClose,
  isOpen: controlledIsOpen,
  className = "",
}: ColorSwatchPickerProps) {
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? false);
  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    AVAILABLE_COLORS.findIndex((color) => color.name === value)
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Sync with controlled prop
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  // Update position when opening
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: Math.max(8, rect.left - 60),
      });
    }
  }, [isOpen]);

  // Reset highlight when opening
  useEffect(() => {
    if (isOpen) {
      const index = AVAILABLE_COLORS.findIndex((color) => color.name === value);
      setHighlightedIndex(index >= 0 ? index : 0);
    }
  }, [isOpen, value]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        gridRef.current &&
        !gridRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      const columns = 4;
      const totalItems = AVAILABLE_COLORS.length;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev + columns < totalItems ? prev + columns : prev % columns
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev - columns >= 0 ? prev - columns : totalItems - columns + (prev % columns)
          );
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < totalItems) {
            onChange(AVAILABLE_COLORS[highlightedIndex].name);
            setIsOpen(false);
            onClose?.();
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          onClose?.();
          break;
        case "Tab":
          setIsOpen(false);
          onClose?.();
          break;
      }
    },
    [isOpen, highlightedIndex, onChange, onClose]
  );

  const handleColorClick = useCallback(
    (colorName: string) => {
      onChange(colorName);
      setIsOpen(false);
      onClose?.();
    },
    [onChange, onClose]
  );

  const handleTriggerClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Get current color
  const currentColor = AVAILABLE_COLORS.find((color) => color.name === value);
  const currentColorValue = currentColor?.color ?? "#9333ea";

  // Render picker in portal
  const renderPicker = () => {
    if (!isOpen || !position) return null;

    return createPortal(
      <div
        ref={gridRef}
        className="fixed z-50 p-3 bg-white rounded-xl shadow-xl border border-gray-200"
        style={{
          top: position.top,
          left: position.left,
          width: "200px",
        }}
      >
        <div className="text-xs font-medium text-gray-500 mb-2 px-1">Velg farge</div>
        <div className="grid grid-cols-4 gap-2">
          {AVAILABLE_COLORS.map((color, index) => {
            const isSelected = color.name === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <button
                key={color.name}
                type="button"
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-lg transition-all
                  ${isHighlighted ? "ring-2 ring-blue-400 ring-offset-2" : ""}
                  hover:scale-110
                `}
                style={{ backgroundColor: color.color }}
                onClick={() => handleColorClick(color.name)}
                onMouseEnter={() => setHighlightedIndex(index)}
                title={color.label}
              >
                {isSelected && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors
          ${
            isOpen
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        `}
        onClick={handleTriggerClick}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Endre farge"
      >
        <span className="w-5 h-5 rounded-full" style={{ backgroundColor: currentColorValue }} />
        <span className="text-sm text-gray-700">{currentColor?.label ?? "Farge"}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {renderPicker()}
    </div>
  );
}
