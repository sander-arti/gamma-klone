"use client";

/**
 * TimelineStepBlock Component (Phase 7)
 *
 * Renders a single step in a timeline/roadmap.
 * Features a status indicator (circle), title, and optional description.
 * Status determines visual styling: completed (green), current (blue), upcoming (gray).
 */

interface TimelineStepBlockProps {
  step: number;
  title: string;
  description?: string;
  status?: "completed" | "current" | "upcoming";
  className?: string;
  /** Whether this is the last step (no connecting line) */
  isLast?: boolean;
  /** Layout direction - vertical (default) or horizontal */
  layout?: "vertical" | "horizontal";
}

export function TimelineStepBlock({
  step,
  title,
  description,
  status = "upcoming",
  className = "",
  isLast = false,
  layout = "vertical",
}: TimelineStepBlockProps) {
  // Status-based colors using theme tokens
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
      case "upcoming":
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
  const isVertical = layout === "vertical";

  return (
    <div
      className={`flex ${isVertical ? "flex-row" : "flex-col items-center"} ${className}`}
      style={{ minHeight: isVertical ? "80px" : "auto" }}
    >
      {/* Status indicator column */}
      <div
        className={`flex ${isVertical ? "flex-col items-center" : "flex-row items-center justify-center"}`}
        style={{ width: isVertical ? "40px" : "auto", flexShrink: 0 }}
      >
        {/* Circle/node */}
        <div
          className="flex items-center justify-center rounded-full font-semibold"
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: colors.bg,
            border: `2px solid ${colors.border}`,
            color: colors.text,
            fontSize: "0.875rem",
            boxShadow: status === "current" ? "0 0 0 4px rgba(59, 130, 246, 0.2)" : "none",
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
        {/* Title - uses heading typography for horizontal, subheading for vertical */}
        <div
          style={{
            fontSize: isVertical
              ? "var(--theme-typography-subheading-size, 1.125rem)"
              : "var(--theme-typography-heading-size, clamp(1.125rem, 1.8cqw, 1.375rem))",
            fontWeight:
              "var(--theme-typography-heading-weight, 600)" as React.CSSProperties["fontWeight"],
            color: "var(--theme-color-foreground, #0f172a)",
            lineHeight: "var(--theme-typography-heading-line-height, 1.3)",
          }}
        >
          {title}
        </div>

        {/* Description - uses body typography, larger for horizontal */}
        {description && (
          <div
            style={{
              marginTop: "var(--theme-spacing-sm, 0.5rem)",
              fontSize: isVertical
                ? "var(--theme-typography-body-size, 0.9375rem)"
                : "var(--theme-typography-body-size, clamp(0.875rem, 1.3cqw, 1rem))",
              color: "var(--theme-color-foreground-muted, #64748b)",
              lineHeight: "var(--theme-typography-body-line-height, 1.5)",
              maxWidth: !isVertical ? "clamp(150px, 25cqw, 250px)" : undefined,
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
