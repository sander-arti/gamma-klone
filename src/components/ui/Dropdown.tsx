/**
 * Dropdown Component
 *
 * Accessible dropdown menu with keyboard navigation.
 * Uses native button and positioned menu pattern.
 */

"use client";

import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
} from "react";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "left",
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (focusedIndex >= 0 && !items[focusedIndex].disabled) {
          items[focusedIndex].onClick?.();
          setIsOpen(false);
        }
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick?.();
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className={`
            absolute z-50 mt-2 min-w-[180px]
            bg-[var(--theme-color-background)]
            border border-[var(--theme-color-border)]
            rounded-xl shadow-lg
            py-1 overflow-hidden
            animate-in fade-in-0 zoom-in-95 duration-150
            ${align === "right" ? "right-0" : "left-0"}
          `}
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => handleItemClick(item)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5
                text-sm text-left
                transition-colors duration-100
                ${
                  focusedIndex === index
                    ? "bg-[var(--theme-color-background-subtle)]"
                    : ""
                }
                ${
                  item.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[var(--theme-color-background-subtle)] cursor-pointer"
                }
                ${
                  item.danger
                    ? "text-red-600"
                    : "text-[var(--theme-color-foreground)]"
                }
              `}
            >
              {item.icon && <span className="flex-shrink-0 w-4">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
