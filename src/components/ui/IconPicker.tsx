"use client";

/**
 * IconPicker Component
 *
 * A popover for selecting icons from a predefined set.
 * Used in EditableIconCardBlock for changing the card icon.
 *
 * Features:
 * - Grid layout of available icons
 * - Keyboard navigation
 * - Current selection highlighted
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
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

export interface IconOption {
  name: string;
  label: string;
  Icon: LucideIcon;
}

export const AVAILABLE_ICONS: IconOption[] = [
  { name: "zap", label: "Lyn", Icon: Zap },
  { name: "shield", label: "Skjold", Icon: Shield },
  { name: "globe", label: "Globus", Icon: Globe },
  { name: "heart", label: "Hjerte", Icon: Heart },
  { name: "star", label: "Stjerne", Icon: Star },
  { name: "check", label: "Hake", Icon: Check },
  { name: "clock", label: "Klokke", Icon: Clock },
  { name: "users", label: "Brukere", Icon: Users },
  { name: "settings", label: "Innstillinger", Icon: Settings },
  { name: "trending-up", label: "Trend opp", Icon: TrendingUp },
  { name: "target", label: "Mål", Icon: Target },
  { name: "award", label: "Premie", Icon: Award },
  { name: "lightbulb", label: "Lyspære", Icon: Lightbulb },
  { name: "rocket", label: "Rakett", Icon: Rocket },
  { name: "lock", label: "Lås", Icon: Lock },
  { name: "cpu", label: "Prosessor", Icon: Cpu },
  { name: "database", label: "Database", Icon: Database },
  { name: "cloud", label: "Sky", Icon: Cloud },
  { name: "bar-chart", label: "Diagram", Icon: BarChart },
  { name: "circle", label: "Sirkel", Icon: Circle },
];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
  /** Custom trigger element */
  trigger?: React.ReactNode;
  className?: string;
}

export function IconPicker({
  value,
  onChange,
  onClose,
  isOpen: controlledIsOpen,
  trigger,
  className = "",
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? false);
  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    AVAILABLE_ICONS.findIndex((icon) => icon.name === value)
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
        left: Math.max(8, rect.left - 100),
      });
    }
  }, [isOpen]);

  // Reset highlight when opening
  useEffect(() => {
    if (isOpen) {
      const index = AVAILABLE_ICONS.findIndex((icon) => icon.name === value);
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

      const columns = 5;
      const totalItems = AVAILABLE_ICONS.length;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < totalItems - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowLeft":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : totalItems - 1
          );
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
            prev - columns >= 0
              ? prev - columns
              : totalItems - columns + (prev % columns)
          );
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < totalItems) {
            onChange(AVAILABLE_ICONS[highlightedIndex].name);
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

  const handleIconClick = useCallback(
    (iconName: string) => {
      onChange(iconName);
      setIsOpen(false);
      onClose?.();
    },
    [onChange, onClose]
  );

  const handleTriggerClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Get current icon
  const currentIcon = AVAILABLE_ICONS.find((icon) => icon.name === value);
  const CurrentIconComponent = currentIcon?.Icon ?? Circle;

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
          width: "280px",
        }}
      >
        <div className="text-xs font-medium text-gray-500 mb-2 px-1">
          Velg ikon
        </div>
        <div className="grid grid-cols-5 gap-1">
          {AVAILABLE_ICONS.map((icon, index) => {
            const IconComponent = icon.Icon;
            const isSelected = icon.name === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <button
                key={icon.name}
                type="button"
                className={`
                  flex items-center justify-center p-2 rounded-lg transition-colors
                  ${isSelected ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}
                  ${isHighlighted ? "ring-2 ring-blue-400" : ""}
                `}
                onClick={() => handleIconClick(icon.name)}
                onMouseEnter={() => setHighlightedIndex(index)}
                title={icon.label}
              >
                <IconComponent className="w-5 h-5" strokeWidth={2} />
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
      {trigger ? (
        <div onClick={handleTriggerClick}>{trigger}</div>
      ) : (
        <button
          type="button"
          className={`
            flex items-center justify-center p-2 rounded-lg border transition-colors
            ${isOpen
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          `}
          onClick={handleTriggerClick}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          title="Endre ikon"
        >
          <CurrentIconComponent className="w-5 h-5 text-gray-700" strokeWidth={2} />
          <svg
            className={`w-4 h-4 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
      )}
      {renderPicker()}
    </div>
  );
}
