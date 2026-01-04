"use client";

/**
 * StatBlock Component (Phase 7)
 *
 * Renders a large statistic/metric display for key numbers.
 * Used for highlighting metrics like "95%", "180", "1.2M NOK".
 * Features a large value with label and optional sublabel.
 */

interface StatBlockProps {
  value: string;
  label: string;
  sublabel?: string;
  className?: string;
  /** Scale factor for dynamic sizing (0.5-1.0), defaults to 1 */
  scale?: number;
}

export function StatBlock({ value, label, sublabel, className = "", scale = 1 }: StatBlockProps) {
  // Apply scale to font sizes when scale < 1
  // Using container-relative units for responsive scaling
  const valueSize =
    scale === 1 ? "clamp(2.5rem, 4cqw, 3.5rem)" : `calc(clamp(2.5rem, 4cqw, 3.5rem) * ${scale})`;

  const labelSize =
    scale === 1
      ? "clamp(0.9rem, 1.4cqw, 1.125rem)"
      : `calc(clamp(0.9rem, 1.4cqw, 1.125rem) * ${Math.max(scale, 0.85)})`;

  const sublabelSize =
    scale === 1
      ? "clamp(0.75rem, 1.1cqw, 0.875rem)"
      : `calc(clamp(0.75rem, 1.1cqw, 0.875rem) * ${Math.max(scale, 0.85)})`;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${className}`}
      style={{
        backgroundColor: "var(--theme-color-background-subtle, rgba(0, 0, 0, 0.02))",
        borderRadius: "var(--theme-effects-border-radius, 0.75rem)",
        padding: "clamp(1rem, 2cqw, 1.5rem)",
        minHeight:
          scale === 1
            ? "clamp(100px, 10cqw, 140px)"
            : `calc(clamp(100px, 10cqw, 140px) * ${scale})`,
      }}
    >
      {/* Large value - uses display typography */}
      <div
        style={{
          fontSize: valueSize,
          color: "var(--theme-color-primary, #3b82f6)",
          fontWeight:
            "var(--theme-typography-display-weight, 800)" as React.CSSProperties["fontWeight"],
          lineHeight: "var(--theme-typography-display-line-height, 1)",
          letterSpacing: "var(--theme-typography-display-letter-spacing, -0.03em)",
        }}
      >
        {value}
      </div>

      {/* Label - uses subheading typography */}
      <div
        style={{
          fontSize: labelSize,
          fontWeight:
            "var(--theme-typography-subheading-weight, 600)" as React.CSSProperties["fontWeight"],
          color: "var(--theme-color-foreground, #0f172a)",
          marginTop: "clamp(0.5rem, 0.8cqw, 0.75rem)",
        }}
      >
        {label}
      </div>

      {/* Optional sublabel - uses caption typography */}
      {sublabel && (
        <div
          style={{
            fontSize: sublabelSize,
            fontWeight:
              "var(--theme-typography-caption-weight, 500)" as React.CSSProperties["fontWeight"],
            color: "var(--theme-color-foreground-muted, #64748b)",
            marginTop: "clamp(0.25rem, 0.4cqw, 0.375rem)",
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}
