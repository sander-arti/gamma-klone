/**
 * OverflowWarning Component
 *
 * Displays a warning banner when content exceeds constraints.
 * Shows suggested actions like "Kort ned" or "Del i to".
 */

"use client";

import { useMemo, useState } from "react";
import type { ConstraintViolation } from "@/lib/editor/types";
import type { BlockKind } from "@/lib/schemas/block";
import { Button, LoadingSpinner, Tooltip } from "@/components/ui";
import { getConstraintHelp } from "@/lib/editor/constraint-help";

interface OverflowWarningProps {
  /** List of constraint violations */
  violations: ConstraintViolation[];
  /** Suggested action */
  suggestedAction: "shorten" | "split" | null;
  /** Callback when "Kort ned" is clicked */
  onShorten?: () => void;
  /** Callback when "Del i to" is clicked */
  onSplit?: () => void;
  /** Whether AI action is loading */
  isLoading?: boolean;
  /** Block kind for context-specific help */
  blockKind?: BlockKind;
  /** Additional CSS classes */
  className?: string;
}

/**
 * OverflowWarning displays constraint violations with action buttons.
 */
export function OverflowWarning({
  violations,
  suggestedAction,
  onShorten,
  onSplit,
  isLoading = false,
  blockKind,
  className = "",
}: OverflowWarningProps) {
  const [showHelp, setShowHelp] = useState(false);

  // Don't render if no violations
  if (violations.length === 0) {
    return null;
  }

  // Get help text for first violation (most relevant)
  const helpText = useMemo(() => {
    if (violations.length === 0) return null;
    return getConstraintHelp(violations[0], blockKind);
  }, [violations, blockKind]);

  // Summarize violations
  const summary = useMemo(() => {
    if (violations.length === 1) {
      return violations[0].message;
    }
    return `${violations.length} begrensninger overskredet`;
  }, [violations]);

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Warning icon */}
        <div className="flex-shrink-0 text-red-500">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h4 className="text-sm font-medium text-red-800 flex-1">
              Innhold overskrider grensene
            </h4>
            {/* Info icon with tooltip */}
            {helpText && (
              <Tooltip content={helpText.explanation} position="top">
                <button
                  className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                  onClick={() => setShowHelp(!showHelp)}
                  aria-label="Vis hjelp"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </Tooltip>
            )}
          </div>
          <p className="mt-1 text-sm text-red-700">{summary}</p>

          {/* Violation list (if multiple) */}
          {violations.length > 1 && (
            <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
              {violations.slice(0, 3).map((v, i) => (
                <li key={i}>{v.message}</li>
              ))}
              {violations.length > 3 && (
                <li>... og {violations.length - 3} til</li>
              )}
            </ul>
          )}

          {/* Expandable help section */}
          {showHelp && helpText && (
            <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
              <h5 className="text-xs font-semibold text-red-900 mb-1">
                Hvorfor er dette begrenset?
              </h5>
              <p className="text-xs text-red-800 mb-2">{helpText.reason}</p>
              {helpText.suggestions.length > 0 && (
                <>
                  <h6 className="text-xs font-semibold text-red-900 mb-1">
                    Hva kan du gjøre?
                  </h6>
                  <ul className="text-xs text-red-800 list-disc list-inside space-y-0.5">
                    {helpText.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
          {(onShorten || onSplit) && (
            <div className="mt-3 flex items-center gap-2">
              {onShorten && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onShorten}
                  disabled={isLoading}
                  className={
                    suggestedAction === "shorten"
                      ? "ring-2 ring-red-300"
                      : ""
                  }
                >
                  {isLoading ? (
                    <span className="flex items-center gap-1">
                      <LoadingSpinner size="sm" label="Forkorter" />
                      Forkorter...
                    </span>
                  ) : (
                    <>
                      <ShortenIcon />
                      Kort ned
                    </>
                  )}
                </Button>
              )}
              {onSplit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onSplit}
                  disabled={isLoading}
                  className={
                    suggestedAction === "split"
                      ? "ring-2 ring-red-300"
                      : ""
                  }
                >
                  {isLoading ? (
                    <span className="flex items-center gap-1">
                      <LoadingSpinner size="sm" label="Deler" />
                      Deler...
                    </span>
                  ) : (
                    <>
                      <SplitIcon />
                      Del i to
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Compact variant for inline use
// ============================================================================

interface CompactOverflowWarningProps {
  /** Primary message */
  message: string;
  /** Whether to show as error (red) or warning (orange) */
  severity?: "error" | "warning";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Compact inline warning for use within blocks.
 */
export function CompactOverflowWarning({
  message,
  severity = "error",
  className = "",
}: CompactOverflowWarningProps) {
  const colorClasses =
    severity === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-orange-50 text-orange-700 border-orange-200";

  return (
    <div
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${colorClasses} ${className}`}
      role="alert"
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function ShortenIcon() {
  return (
    <svg
      className="w-4 h-4 mr-1"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 13l-7 7-7-7m14-8l-7 7-7-7"
      />
    </svg>
  );
}

function SplitIcon() {
  return (
    <svg
      className="w-4 h-4 mr-1"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
      />
    </svg>
  );
}
