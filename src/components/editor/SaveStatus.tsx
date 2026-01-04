/**
 * SaveStatus Component
 *
 * Displays the current save status with visual indicators.
 * Shows saving spinner, saved timestamp, or error state.
 * Validation errors are clickable to show details.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui";
import type { ConstraintViolation } from "@/lib/editor/types";

export interface SaveStatusProps {
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Last saved timestamp */
  lastSavedAt: Date | null;
  /** Error from last save attempt */
  error: string | null;
  /** Validation violations (full array for showing details) */
  violations?: ConstraintViolation[];
  /** Number of validation errors that block saving (fallback if violations not provided) */
  violationCount?: number;
  /** Callback to repair all violations */
  onRepairAll?: () => Promise<void>;
  /** Whether repair is in progress */
  isRepairing?: boolean;
}

/**
 * Format time as "kl. HH:MM"
 */
function formatTime(date: Date): string {
  return `kl. ${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export function SaveStatus({
  isDirty,
  isSaving,
  lastSavedAt,
  error,
  violations = [],
  violationCount,
  onRepairAll,
  isRepairing = false,
}: SaveStatusProps) {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Use provided violationCount or fall back to violations.length
  const errorCount = violationCount ?? violations.length;

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    }

    if (showPopover) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPopover]);

  // Error state
  if (error) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-red-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Lagring feilet</span>
      </span>
    );
  }

  // Validation errors blocking save
  if (errorCount > 0) {
    return (
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setShowPopover(!showPopover)}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{errorCount} feil</span>
          <svg
            className={`w-3 h-3 transition-transform ${showPopover ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Popover with violation details */}
        {showPopover && violations.length > 0 && (
          <div
            ref={popoverRef}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {violations.length} valideringsfeil
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Rett disse feilene for å kunne lagre
                  </p>
                </div>
                {onRepairAll && (
                  <button
                    type="button"
                    onClick={async () => {
                      await onRepairAll();
                      setShowPopover(false);
                    }}
                    disabled={isRepairing}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors flex items-center gap-1.5"
                  >
                    {isRepairing ? (
                      <>
                        <LoadingSpinner size="sm" label="Fikser feil" />
                        <span>Fikser...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Fiks alle</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <ul className="max-h-60 overflow-y-auto">
              {violations.map((violation, idx) => (
                <li
                  key={`${violation.blockId}-${idx}`}
                  className="px-3 py-2 border-b border-gray-50 last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{violation.message}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Slide {parseInt(violation.blockId.split("-")[0]) + 1}, blokk{" "}
                        {parseInt(violation.blockId.split("-")[1]) + 1}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Saving in progress
  if (isSaving) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-gray-500">
        <LoadingSpinner size="sm" label="Lagrer" />
        <span>Lagrer...</span>
      </span>
    );
  }

  // Unsaved changes
  if (isDirty) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-gray-500">
        <span className="w-2 h-2 rounded-full bg-yellow-400" />
        <span>Ulagrede endringer</span>
      </span>
    );
  }

  // Saved state
  if (lastSavedAt) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-green-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>Lagret {formatTime(lastSavedAt)}</span>
      </span>
    );
  }

  // Initial state (no changes yet)
  return (
    <span className="flex items-center gap-1.5 text-sm text-gray-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
        />
      </svg>
      <span>Lagret</span>
    </span>
  );
}
