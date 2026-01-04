/**
 * API Error Types and Mapping
 *
 * Standard error codes and mapping from internal errors to API errors (PRD §14).
 */

import { NextResponse } from "next/server";
import { PipelineError } from "@/lib/ai/pipeline";

/**
 * API Error Codes (PRD §14)
 */
export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "MODEL_ERROR"
  | "INTERNAL_ERROR";

/**
 * HTTP Status codes for each error
 */
export const ERROR_HTTP_STATUS: Record<ApiErrorCode, number> = {
  INVALID_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  MODEL_ERROR: 500,
  INTERNAL_ERROR: 500,
};

/**
 * Default messages for each error code
 */
export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_REQUEST: "Invalid request parameters",
  UNAUTHORIZED: "Missing or invalid API key",
  FORBIDDEN: "Access denied",
  NOT_FOUND: "Resource not found",
  RATE_LIMITED: "Too many requests, please try again later",
  MODEL_ERROR: "AI model error during generation",
  INTERNAL_ERROR: "An unexpected error occurred",
};

/**
 * API Error class for consistent error handling
 */
export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message?: string,
    public readonly details?: unknown
  ) {
    super(message ?? ERROR_MESSAGES[code]);
    this.name = "ApiError";
  }

  get status(): number {
    return ERROR_HTTP_STATUS[this.code];
  }

  toResponse(): NextResponse {
    const errorBody: { code: ApiErrorCode; message: string; details?: unknown } = {
      code: this.code,
      message: this.message,
    };

    if (this.details !== undefined) {
      errorBody.details = this.details;
    }

    return NextResponse.json({ error: errorBody }, { status: this.status });
  }
}

/**
 * Map PipelineError to ApiError code
 */
export function mapPipelineErrorToApiCode(error: PipelineError): ApiErrorCode {
  switch (error.code) {
    case "OUTLINE_FAILED":
    case "CONTENT_FAILED":
    case "VALIDATION_FAILED":
    case "REPAIR_FAILED":
    case "MAX_RETRIES":
      return "MODEL_ERROR";
    default:
      return "INTERNAL_ERROR";
  }
}

/**
 * Map any error to ApiError
 */
export function mapErrorToApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof PipelineError) {
    return new ApiError(mapPipelineErrorToApiCode(error), error.message);
  }

  if (error instanceof Error) {
    // Check for known error patterns
    if (error.message.includes("rate limit")) {
      return new ApiError("RATE_LIMITED");
    }
    if (error.message.includes("unauthorized") || error.message.includes("invalid key")) {
      return new ApiError("UNAUTHORIZED");
    }
    return new ApiError("INTERNAL_ERROR", error.message);
  }

  return new ApiError("INTERNAL_ERROR");
}

/**
 * Create error response helper
 */
export function errorResponse(
  code: ApiErrorCode,
  message?: string,
  details?: unknown
): NextResponse {
  return new ApiError(code, message, details).toResponse();
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}
