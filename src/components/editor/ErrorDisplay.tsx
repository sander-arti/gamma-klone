/**
 * ErrorDisplay Component
 *
 * Reusable error display with user-friendly Norwegian messages,
 * recovery actions, and retry functionality.
 */

"use client";

import { AlertTriangle, RefreshCw, ArrowLeft, XCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useUserFriendlyError, type ErrorResponse } from "@/hooks/useUserFriendlyError";

export interface ErrorDisplayProps {
  /** Error object from API/hooks */
  error: ErrorResponse | null | undefined;
  /** Retry callback (optional) */
  onRetry?: () => void;
  /** Go back callback (optional) */
  onBack?: () => void;
  /** Custom className for container */
  className?: string;
  /** Show compact version (smaller, less spacing) */
  compact?: boolean;
  /** Show technical details (for debugging) */
  showTechnical?: boolean;
}

/**
 * ErrorDisplay Component
 */
export function ErrorDisplay({
  error,
  onRetry,
  onBack,
  className = "",
  compact = false,
  showTechnical = false,
}: ErrorDisplayProps) {
  const userError = useUserFriendlyError(error);

  if (!userError) return null;

  const { error: errorDetails, isTemporary, isActionable, technicalMessage, code } = userError;

  // Icon based on error severity
  const Icon = isTemporary ? AlertTriangle : XCircle;
  const iconColor = isTemporary ? "text-amber-600" : "text-red-600";
  const bgColor = isTemporary ? "bg-amber-100" : "bg-red-100";

  return (
    <div className={`text-center ${compact ? "py-8" : "py-16"} ${className}`}>
      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center ${
          compact ? "w-12 h-12" : "w-16 h-16"
        } rounded-full ${bgColor} ${iconColor} mb-4`}
      >
        <Icon className={compact ? "w-6 h-6" : "w-8 h-8"} />
      </div>

      {/* Title */}
      <h3
        className={`${
          compact ? "text-base" : "text-lg"
        } font-medium text-gray-900 mb-2`}
      >
        {errorDetails.title}
      </h3>

      {/* Message */}
      <p
        className={`text-gray-500 ${
          compact ? "text-sm mb-3" : "mb-4"
        } max-w-md mx-auto`}
      >
        {errorDetails.message}
      </p>

      {/* Recovery actions */}
      {errorDetails.recovery && errorDetails.recovery.length > 0 && (
        <div className={`max-w-sm mx-auto text-left ${compact ? "mb-4" : "mb-6"}`}>
          <p className="text-xs font-medium text-gray-700 mb-2">
            {isActionable ? "Hva du kan gjøre:" : "Forslag:"}
          </p>
          <ul className="space-y-1 text-xs text-gray-600">
            {errorDetails.recovery.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technical details (for debugging) */}
      {showTechnical && technicalMessage && (
        <details className="max-w-md mx-auto mb-4">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
            Tekniske detaljer
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-left">
            <p className="text-xs font-mono text-gray-600 mb-1">
              <span className="font-semibold">Kode:</span> {code}
            </p>
            <p className="text-xs font-mono text-gray-600">
              <span className="font-semibold">Melding:</span> {technicalMessage}
            </p>
          </div>
        </details>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        {onBack && (
          <Button variant="secondary" onClick={onBack} size={compact ? "sm" : "md"}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Gå tilbake
          </Button>
        )}
        {onRetry && isActionable && (
          <Button variant="primary" onClick={onRetry} size={compact ? "sm" : "md"}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {isTemporary ? "Prøv igjen" : "Prøv på nytt"}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline error message (compact, for forms)
 */
export function InlineError({ error }: { error: ErrorResponse | null | undefined }) {
  const userError = useUserFriendlyError(error);

  if (!userError) return null;

  return (
    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">
          {userError.error.title}
        </p>
        <p className="text-xs text-red-600 mt-1">{userError.error.message}</p>
      </div>
    </div>
  );
}
