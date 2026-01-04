/**
 * CharacterCounter Component
 *
 * Displays character count with color-coded status.
 * Colors: green (<60%), yellow (60-80%), orange (80-100%), red (>100%)
 */

import { useMemo } from "react";

interface CharacterCounterProps {
  /** Current character count */
  current: number;
  /** Maximum allowed characters */
  max: number;
  /** Show as compact (just numbers) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get color class based on usage percentage.
 */
function getColorClass(percentage: number): string {
  if (percentage > 100) {
    return "text-red-600";
  }
  if (percentage > 80) {
    return "text-orange-500";
  }
  if (percentage > 60) {
    return "text-yellow-600";
  }
  return "text-gray-400";
}

/**
 * Get background color for the counter badge.
 */
function getBgClass(percentage: number): string {
  if (percentage > 100) {
    return "bg-red-50";
  }
  if (percentage > 80) {
    return "bg-orange-50";
  }
  if (percentage > 60) {
    return "bg-yellow-50";
  }
  return "bg-transparent";
}

/**
 * CharacterCounter displays the current character count relative to a maximum.
 * The color changes based on how close the user is to the limit.
 */
export function CharacterCounter({
  current,
  max,
  compact = false,
  className = "",
}: CharacterCounterProps) {
  const { percentage, colorClass, bgClass, remaining } = useMemo(() => {
    const pct = max > 0 ? Math.round((current / max) * 100) : 0;
    return {
      percentage: pct,
      colorClass: getColorClass(pct),
      bgClass: getBgClass(pct),
      remaining: Math.max(0, max - current),
    };
  }, [current, max]);

  if (compact) {
    return (
      <span className={`text-xs font-mono ${colorClass} ${className}`}>
        {current}/{max}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded ${colorClass} ${bgClass} ${className}`}
    >
      <span>{current}</span>
      <span className="text-gray-300">/</span>
      <span>{max}</span>
      {percentage > 80 && (
        <span className="ml-1 text-[10px]">
          ({remaining > 0 ? `${remaining} igjen` : "over grensen"})
        </span>
      )}
    </span>
  );
}

// ============================================================================
// Variants
// ============================================================================

/**
 * Progress bar variant of the character counter.
 * Shows a horizontal bar that fills based on usage.
 */
export function CharacterProgressBar({
  current,
  max,
  className = "",
}: Omit<CharacterCounterProps, "compact">) {
  const { percentage, colorClass, barColorClass } = useMemo(() => {
    const pct = max > 0 ? Math.min(Math.round((current / max) * 100), 100) : 0;
    const overflow = current > max;

    let barColor = "bg-gray-300";
    if (overflow) {
      barColor = "bg-red-500";
    } else if (pct > 80) {
      barColor = "bg-orange-400";
    } else if (pct > 60) {
      barColor = "bg-yellow-400";
    } else {
      barColor = "bg-green-400";
    }

    return {
      percentage: pct,
      colorClass: getColorClass(pct),
      barColorClass: barColor,
    };
  }, [current, max]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColorClass} transition-all duration-150`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-xs font-mono ${colorClass}`}>
        {current}/{max}
      </span>
    </div>
  );
}

// ============================================================================
// Item Counter (for bullets)
// ============================================================================

interface ItemCounterProps {
  /** Current item count */
  current: number;
  /** Maximum allowed items */
  max: number;
  /** Minimum required items */
  min?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ItemCounter displays the current item count for bullets or table rows.
 */
export function ItemCounter({ current, max, min = 1, className = "" }: ItemCounterProps) {
  const { percentage, colorClass, status } = useMemo(() => {
    const pct = max > 0 ? Math.round((current / max) * 100) : 0;

    let statusText = "";
    if (current > max) {
      statusText = `${current - max} for mange`;
    } else if (current < min) {
      statusText = `${min - current} påkrevd`;
    } else if (current === max) {
      statusText = "maks";
    }

    return {
      percentage: pct,
      colorClass: getColorClass(pct),
      status: statusText,
    };
  }, [current, max, min]);

  return (
    <span className={`text-xs font-mono ${colorClass} ${className}`}>
      {current}/{max} punkter
      {status && <span className="ml-1 opacity-75">({status})</span>}
    </span>
  );
}
