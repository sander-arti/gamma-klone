/**
 * SlideCanvas Component
 *
 * Renders a slide at a fixed 16:9 aspect ratio (1280x720 base).
 * Scales to fit container while maintaining aspect ratio.
 * Used as the source for PDF export.
 */

"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

// Base dimensions for 16:9 slide
const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;
const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;

interface SlideCanvasProps {
  children: ReactNode;
  className?: string;
}

/**
 * SlideCanvas maintains 16:9 aspect ratio and scales content to fit.
 *
 * The canvas uses transform scaling to fit the container while
 * keeping the internal layout at 1280x720px for consistent rendering.
 */
export function SlideCanvas({ children, className = "" }: SlideCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    // Initial calculation
    updateSize();

    // Observe container size changes
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate scale based on container size state
  const scale = containerSize.width > 0 && containerSize.height > 0
    ? Math.min(
        containerSize.width / BASE_WIDTH,
        containerSize.height / BASE_HEIGHT
      )
    : 1;

  // Calculate centering based on state (not ref)
  const left = containerSize.width > 0
    ? containerSize.width / 2 - (BASE_WIDTH * scale) / 2
    : 0;
  const top = containerSize.height > 0
    ? containerSize.height / 2 - (BASE_HEIGHT * scale) / 2
    : 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        // Ensure container maintains aspect ratio if no explicit height
        aspectRatio: `${BASE_WIDTH} / ${BASE_HEIGHT}`,
      }}
    >
      {/* Scaled slide content - container queries enabled for responsive sizing */}
      <div
        className="absolute origin-top-left"
        style={{
          width: `${BASE_WIDTH}px`,
          height: `${BASE_HEIGHT}px`,
          transform: `scale(${scale})`,
          left: `${left}px`,
          top: `${top}px`,
          backgroundColor: 'var(--theme-color-background, #f8fafc)',
          // Enable container queries so cqw/cqh units work relative to slide size
          containerType: 'size' as React.CSSProperties['containerType'],
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Export base dimensions for use in PDF rendering
 */
export const SLIDE_DIMENSIONS = {
  width: BASE_WIDTH,
  height: BASE_HEIGHT,
  aspectRatio: ASPECT_RATIO,
} as const;
