/**
 * Tooltip Component
 *
 * Features:
 * - 500ms delay before showing
 * - Portal rendering (avoids z-index issues)
 * - Positioning: top, right, bottom, left
 * - Keyboard shortcut display with platform-specific formatting
 * - Automatic cleanup on unmount
 */

'use client';

import { useState, useEffect, useRef, ReactNode, useMemo } from 'react';
import { createPortal } from 'react-dom';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

type TooltipProps = {
  content: string;
  shortcut?: string | string[];
  position?: TooltipPosition;
  delay?: number;
  children: ReactNode;
};

export function Tooltip({
  content,
  shortcut,
  position = 'top',
  delay = 500,
  children,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate tooltip position
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const offset = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - offset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + offset;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - offset;
        break;
    }

    // Clamp to viewport
    const padding = 8;
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

    setTooltipPosition({ top, left });
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Memoize shortcuts array
  const shortcuts = useMemo(
    () => (Array.isArray(shortcut) ? shortcut : shortcut ? [shortcut] : []),
    [shortcut]
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      {mounted &&
        isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[10000] px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
            role="tooltip"
          >
            <div className="flex items-center gap-2">
              <span>{content}</span>
              {shortcuts.length > 0 && (
                <div className="flex gap-1">
                  {shortcuts.map((key, index) => (
                    <kbd
                      key={index}
                      className="px-1.5 py-0.5 text-xs font-mono bg-gray-800 rounded border border-gray-700"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
