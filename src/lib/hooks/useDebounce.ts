/**
 * useDebounce Hooks
 *
 * Provides debounced value and debounced callback utilities.
 */

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Debounce a value
 *
 * Returns the debounced value that only updates after the specified delay.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Create a debounced callback
 *
 * Returns a stable callback that is debounced.
 * The callback will only be executed after the specified delay
 * has passed without being called again.
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns A debounced version of the callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  return debouncedCallback;
}

/**
 * Create a debounced callback with flush capability
 *
 * Returns a debounced callback and a flush function
 * to immediately execute the pending callback.
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Object with debounced callback and flush function
 */
export function useDebouncedCallbackWithFlush<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): {
  debouncedCallback: (...args: Parameters<T>) => void;
  flush: () => void;
  cancel: () => void;
} {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingArgsRef = useRef<Parameters<T> | null>(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      pendingArgsRef.current = args;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (pendingArgsRef.current) {
          callbackRef.current(...pendingArgsRef.current);
          pendingArgsRef.current = null;
        }
      }, delay);
    },
    [delay]
  );

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pendingArgsRef.current) {
      callbackRef.current(...pendingArgsRef.current);
      pendingArgsRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingArgsRef.current = null;
  }, []);

  return { debouncedCallback, flush, cancel };
}
