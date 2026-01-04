/**
 * SlideViewer Component
 *
 * Renders a single slide with its theme applied.
 * Combines ThemeProvider, SlideCanvas, and SlideRenderer.
 */

"use client";

import type { Slide } from "@/lib/schemas/slide";
import type { ThemeId, BrandKitOverrides } from "@/lib/themes";
import { ThemeProvider } from "./ThemeProvider";
import { SlideCanvas } from "./SlideCanvas";
import { SlideRenderer } from "../slides";

interface SlideViewerProps {
  slide: Slide;
  themeId?: ThemeId;
  brandKit?: BrandKitOverrides;
  className?: string;
}

/**
 * SlideViewer renders a single slide with theme and aspect ratio.
 *
 * @param slide - The slide data to render
 * @param themeId - The theme to apply (defaults to "nordic_light")
 * @param brandKit - Optional brand kit color overrides
 * @param className - Additional CSS classes
 */
export function SlideViewer({
  slide,
  themeId = "nordic_light",
  brandKit,
  className = "",
}: SlideViewerProps) {
  return (
    <ThemeProvider themeId={themeId} brandKit={brandKit} className={className}>
      <SlideCanvas>
        <SlideRenderer slide={slide} />
      </SlideCanvas>
    </ThemeProvider>
  );
}
