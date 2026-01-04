/**
 * useAutoSave Hook
 *
 * Automatically saves content after a debounce period.
 * Provides status feedback and error handling.
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface UseAutoSaveOptions {
  /** Function to call when saving */
  onSave: () => Promise<void>;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Debounce delay in milliseconds (default: 3000) */
  delay?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Whether to block save (e.g., validation errors) */
  blocked?: boolean;
  /** Callback when save succeeds (optional) */
  onSuccess?: () => void;
  /** Callback when save fails (optional) */
  onError?: (error: Error) => void;
}

export interface UseAutoSaveReturn {
  /** Last saved timestamp */
  lastSavedAt: Date | null;
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Error from last save attempt */
  error: string | null;
  /** Manually trigger a save */
  saveNow: () => Promise<void>;
  /** Clear the current error */
  clearError: () => void;
}

/**
 * Hook for automatic saving with debounce
 *
 * Triggers save after `delay` ms of inactivity when `isDirty` is true.
 * Provides status tracking and manual save capability.
 */
export function useAutoSave({
  onSave,
  isDirty,
  delay = 3000,
  enabled = true,
  blocked = false,
  onSuccess,
  onError,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for stable callbacks and cleanup
  const onSaveRef = useRef(onSave);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Update callback ref
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Perform save
  const performSave = useCallback(async () => {
    if (blocked || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSaveRef.current();
      if (isMountedRef.current) {
        setLastSavedAt(new Date());
        onSuccess?.();
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error("Auto-save error:", err);
        const error = err instanceof Error ? err : new Error("Lagring feilet");
        setError(error.message);
        onError?.(error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [blocked, isSaving, onSuccess, onError]);

  // Auto-save trigger when isDirty changes
  useEffect(() => {
    if (!enabled || !isDirty || blocked || isSaving) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      performSave();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, isDirty, blocked, delay, performSave, isSaving]);

  // Manual save function
  const saveNow = useCallback(async () => {
    // Clear any pending auto-save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isDirty || blocked) return;

    await performSave();
  }, [isDirty, blocked, performSave]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    lastSavedAt,
    isSaving,
    error,
    saveNow,
    clearError,
  };
}
