"use client";

/**
 * IconCardBlock Component (Phase 7 Sprint 4)
 *
 * Renders a card with an icon, title, and optional description.
 * Used for feature showcases, benefits, or categories.
 * Icons are from the Lucide icon set.
 * Features premium colored shadows on hover.
 */

import { useState } from "react";
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

interface IconCardBlockProps {
  icon: string;
  text: string;
  description?: string;
  bgColor?: string;
  className?: string;
}

/**
 * Icon name to component mapping
 * Supports common Lucide icon names
 */
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

/**
 * Get a Lucide icon component by name
 * Falls back to Circle icon if not found
 */
function getIconComponent(iconName: string): LucideIcon {
  const normalizedName = iconName.toLowerCase();
  return iconMap[normalizedName] || Circle;
}

/**
 * Premium color presets matching Gamma's design
 * Now includes themed shadows for hover effects
 */
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

export function IconCardBlock({
  icon,
  text,
  description,
  bgColor,
  className = "",
}: IconCardBlockProps) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = getIconComponent(icon);

  // Get colors based on preset or default
  const getColors = () => {
    if (bgColor) {
      const normalizedColor = bgColor.toLowerCase() as ColorPreset;
      if (normalizedColor in COLOR_PRESETS) {
        return COLOR_PRESETS[normalizedColor];
      }
    }
    // Default to purple theme
    return {
      bg: "var(--theme-color-surface, rgba(147, 51, 234, 0.08))",
      border: "var(--theme-color-border, rgba(147, 51, 234, 0.2))",
      iconBg: "var(--theme-color-accent-purple-light, rgba(147, 51, 234, 0.15))",
      icon: "var(--theme-color-primary, #7c3aed)",
      shadow: "var(--theme-effects-shadow-purple, 0 4px 14px rgba(139, 92, 246, 0.15))",
    };
  };

  const colors = getColors();

  return (
    <div
      className={`flex flex-col items-start transition-all duration-200 ${className}`}
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "var(--theme-effects-border-radius-large, 1rem)",
        padding: "var(--theme-spacing-content-padding, clamp(1.25rem, 2cqw, 1.5rem))",
        minHeight: "clamp(140px, 12cqw, 180px)",
        boxShadow: isHovered ? colors.shadow : "none",
        transform: isHovered ? "translateY(-4px)" : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon in colored circle */}
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          backgroundColor: colors.iconBg,
          width: "clamp(2.5rem, 3.5cqw, 3.25rem)",
          height: "clamp(2.5rem, 3.5cqw, 3.25rem)",
          marginBottom: "var(--theme-spacing-sm, clamp(0.75rem, 1.2cqw, 1rem))",
        }}
      >
        <IconComponent
          className="w-[clamp(1.25rem,1.8cqw,1.5rem)] h-[clamp(1.25rem,1.8cqw,1.5rem)]"
          strokeWidth={2}
          style={{
            color: colors.icon,
          }}
        />
      </div>

      {/* Title - uses subheading typography */}
      <div
        style={{
          fontSize: "var(--theme-typography-subheading-size, clamp(1rem, 1.5cqw, 1.125rem))",
          fontWeight:
            "var(--theme-typography-subheading-weight, 600)" as React.CSSProperties["fontWeight"],
          color: "var(--theme-color-foreground, #0f172a)",
          lineHeight: "var(--theme-typography-subheading-line-height, 1.3)",
          letterSpacing: "var(--theme-typography-letter-spacing-tight, -0.01em)",
          marginBottom: "var(--theme-spacing-xs, clamp(0.375rem, 0.6cqw, 0.5rem))",
        }}
      >
        {text}
      </div>

      {/* Description - uses body-small typography */}
      {description && (
        <div
          style={{
            fontSize: "var(--theme-typography-body-small-size, clamp(0.8rem, 1.2cqw, 0.875rem))",
            color: "var(--theme-color-foreground-muted, #64748b)",
            lineHeight: "var(--theme-typography-body-small-line-height, 1.6)",
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}
