"use client";

/**
 * NumberedCardBlock Component (Phase 7 Sprint 4)
 *
 * Renders a card with a number badge, title, and optional description.
 * Used for ordered concepts, steps, or principles.
 * Features gradient badge and hover effects for premium look.
 */

import { useState } from "react";

interface NumberedCardBlockProps {
  number: number;
  text: string;
  description?: string;
  className?: string;
}

export function NumberedCardBlock({
  number,
  text,
  description,
  className = "",
}: NumberedCardBlockProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`flex flex-col items-start transition-all duration-200 ${className}`}
      style={{
        backgroundColor: "var(--theme-color-background-subtle, rgba(241, 245, 249, 0.5))",
        borderRadius: "var(--theme-effects-border-radius-large, 1rem)",
        padding: "var(--theme-spacing-content-padding, clamp(1.25rem, 2cqw, 1.5rem))",
        minHeight: "clamp(130px, 12cqw, 160px)",
        border: "1px solid var(--theme-color-border-subtle, rgba(226, 232, 240, 0.6))",
        boxShadow: isHovered
          ? "var(--theme-effects-box-shadow-large, 0 8px 20px -3px rgba(0, 0, 0, 0.08))"
          : "var(--theme-effects-box-shadow-small, 0 1px 2px rgba(0, 0, 0, 0.04))",
        transform: isHovered ? "translateY(-4px)" : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Number badge with gradient */}
      <div
        className="flex items-center justify-center rounded-full"
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
      >
        {number}
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
          marginBottom: "var(--theme-spacing-xs, clamp(0.25rem, 0.5cqw, 0.375rem))",
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
