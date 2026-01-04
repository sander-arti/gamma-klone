"use client";

/**
 * InlineDropdown Component
 *
 * A minimal dropdown for inline editing of enum values.
 * Used for selecting status, icons, colors, etc. within editable blocks.
 *
 * Features:
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Click outside to close
 * - Focus management
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface InlineDropdownProps<T extends string = string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  onClose?: () => void;
  /** Label shown when closed */
  displayLabel?: string;
  /** Show dropdown initially open */
  isOpen?: boolean;
  /** Styling variant */
  variant?: "default" | "badge" | "minimal";
  className?: string;
  /** Allow clicking the closed state to open */
  clickToOpen?: boolean;
}

export function InlineDropdown<T extends string = string>({
  value,
  options,
  onChange,
  onClose,
  displayLabel,
  isOpen: controlledIsOpen,
  variant = "default",
  className = "",
  clickToOpen = true,
}: InlineDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? false);
  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    options.findIndex((opt) => opt.value === value)
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
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
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 120),
      });
    }
  }, [isOpen]);

  // Focus the highlighted option when opening
  useEffect(() => {
    if (isOpen && listRef.current) {
      const index = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(index >= 0 ? index : 0);
    }
  }, [isOpen, options, value]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : options.length - 1
          );
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            onChange(options[highlightedIndex].value);
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
    [isOpen, highlightedIndex, options, onChange, onClose]
  );

  // Handle option click
  const handleOptionClick = useCallback(
    (optionValue: T) => {
      onChange(optionValue);
      setIsOpen(false);
      onClose?.();
    },
    [onChange, onClose]
  );

  // Handle trigger click
  const handleTriggerClick = useCallback(() => {
    if (clickToOpen) {
      setIsOpen(!isOpen);
    }
  }, [clickToOpen, isOpen]);

  // Find current option
  const currentOption = options.find((opt) => opt.value === value);
  const displayText = displayLabel ?? currentOption?.label ?? value;

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "badge":
        return {
          trigger:
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
          triggerHover: "hover:ring-2 hover:ring-blue-200",
          triggerActive: "ring-2 ring-blue-500",
        };
      case "minimal":
        return {
          trigger:
            "inline-flex items-center gap-1 text-sm transition-colors underline decoration-dotted underline-offset-2",
          triggerHover: "hover:text-blue-600",
          triggerActive: "text-blue-600",
        };
      default:
        return {
          trigger:
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border transition-colors",
          triggerHover: "hover:border-blue-300 hover:bg-blue-50",
          triggerActive: "border-blue-500 bg-blue-50 ring-2 ring-blue-200",
        };
    }
  };

  const styles = getVariantStyles();

  // Render dropdown in a portal
  const renderDropdown = () => {
    if (!isOpen || !dropdownPosition) return null;

    return createPortal(
      <ul
        ref={listRef}
        className="fixed z-50 py-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          minWidth: dropdownPosition.width,
        }}
        role="listbox"
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            className={`
              flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors
              ${option.value === value ? "bg-blue-50 text-blue-700" : "text-gray-700"}
              ${highlightedIndex === index ? "bg-blue-100" : ""}
              hover:bg-blue-50
            `}
            onClick={() => handleOptionClick(option.value)}
            onMouseEnter={() => setHighlightedIndex(index)}
            role="option"
            aria-selected={option.value === value}
          >
            {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
            {option.color && (
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: option.color }}
              />
            )}
            <span>{option.label}</span>
            {option.value === value && (
              <span className="ml-auto text-blue-600">✓</span>
            )}
          </li>
        ))}
      </ul>,
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
          ${styles.trigger}
          ${isOpen ? styles.triggerActive : styles.triggerHover}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        `}
        onClick={handleTriggerClick}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={
          variant === "badge" && currentOption?.color
            ? {
                backgroundColor: `${currentOption.color}20`,
                color: currentOption.color,
                borderColor: currentOption.color,
              }
            : undefined
        }
      >
        {currentOption?.icon && (
          <span className="flex-shrink-0">{currentOption.icon}</span>
        )}
        {currentOption?.color && variant !== "badge" && (
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: currentOption.color }}
          />
        )}
        <span>{displayText}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {renderDropdown()}
    </div>
  );
}
