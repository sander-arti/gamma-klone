/**
 * useUserFriendlyError Hook
 *
 * Converts technical error objects to user-friendly Norwegian messages.
 */

import { useMemo } from "react";
import {
  getUserFriendlyError,
  isTemporaryError,
  isUserActionable,
  type UserFriendlyError,
} from "@/lib/errors/user-messages";
import type { ApiErrorCode } from "@/lib/api/errors";

/**
 * Error object structure from API/generation hooks
 */
export interface ErrorResponse {
  code?: string;
  message?: string;
  details?: unknown;
}

/**
 * Hook return type
 */
export interface UserFriendlyErrorResult {
  /** User-friendly error details */
  error: UserFriendlyError;
  /** Whether this is a temporary error */
  isTemporary: boolean;
  /** Whether user can take action */
  isActionable: boolean;
  /** Original error code */
  code: string;
  /** Original technical message (for debugging) */
  technicalMessage?: string;
}

/**
 * Convert error response to user-friendly format
 */
export function useUserFriendlyError(
  errorResponse: ErrorResponse | null | undefined
): UserFriendlyErrorResult | null {
  return useMemo(() => {
    if (!errorResponse) return null;

    // Extract error code
    const code = errorResponse.code ?? "INTERNAL_ERROR";

    // Get user-friendly message
    const error = getUserFriendlyError(
      code as ApiErrorCode // Type assertion safe because fallback exists
    );

    return {
      error,
      isTemporary: isTemporaryError(code as ApiErrorCode),
      isActionable: isUserActionable(code as ApiErrorCode),
      code,
      technicalMessage: errorResponse.message,
    };
  }, [errorResponse]);
}
