"use client";

/**
 * CinematicOverlay Component
 *
 * Multi-layer gradient overlay system for premium cover slides.
 * Creates depth and visual interest with:
 * - Base gradient for text readability
 * - Colored accent gradient from theme
 * - Vignette effect for focus
 */

import { motion } from "framer-motion";

export type OverlayVariant = "cinematic" | "editorial" | "minimal" | "centered" | "vignette" | "diagonal";

interface CinematicOverlayProps {
  variant?: OverlayVariant;
  /** Theme primary color for accent gradient */
  primaryColor?: string;
  /** Whether the slide has a background image */
  hasImage?: boolean;
  /** Custom opacity for base layer (0-1) */
  baseOpacity?: number;
  /** Enable subtle animation */
  animated?: boolean;
  className?: string;
}

/**
 * Convert hex color to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get overlay layers based on variant
 */
function getOverlayLayers(
  variant: OverlayVariant,
  primaryColor: string,
  hasImage: boolean,
  baseOpacity: number
): string[] {
  const layers: string[] = [];

  switch (variant) {
    case "cinematic":
      // Dramatic bottom-heavy gradient for large titles
      layers.push(
        `linear-gradient(to top, rgba(0,0,0,${baseOpacity * 1.2}) 0%, rgba(0,0,0,${baseOpacity * 0.6}) 40%, transparent 70%)`
      );
      // Colored accent from top-left
      if (hasImage) {
        layers.push(
          `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.25)} 0%, transparent 50%)`
        );
      }
      // Subtle vignette
      layers.push(
        `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,${baseOpacity * 0.4}) 100%)`
      );
      break;

    case "editorial":
      // Left-side gradient for split layout
      layers.push(
        `linear-gradient(to right, rgba(0,0,0,${baseOpacity * 0.8}) 0%, rgba(0,0,0,${baseOpacity * 0.3}) 50%, transparent 70%)`
      );
      break;

    case "minimal":
      // Very subtle gradient for text-only covers
      layers.push(
        `linear-gradient(180deg, ${hexToRgba(primaryColor, 0.03)} 0%, ${hexToRgba(primaryColor, 0.08)} 100%)`
      );
      break;

    case "centered":
      // Radial vignette for centered focus
      layers.push(
        `radial-gradient(ellipse at center, rgba(0,0,0,${baseOpacity * 0.2}) 0%, rgba(0,0,0,${baseOpacity * 0.7}) 100%)`
      );
      // Slight top darkening
      if (hasImage) {
        layers.push(
          `linear-gradient(to bottom, rgba(0,0,0,${baseOpacity * 0.3}) 0%, transparent 30%, transparent 70%, rgba(0,0,0,${baseOpacity * 0.5}) 100%)`
        );
      }
      break;

    case "vignette":
      // Strong vignette effect
      layers.push(
        `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${baseOpacity * 0.6}) 100%)`
      );
      break;

    case "diagonal":
      // Diagonal gradient for split designs
      layers.push(
        `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.9)} 0%, ${hexToRgba(primaryColor, 0.7)} 45%, transparent 55%)`
      );
      break;
  }

  return layers;
}

export function CinematicOverlay({
  variant = "cinematic",
  primaryColor = "#2563eb",
  hasImage = true,
  baseOpacity = 0.5,
  animated = true,
  className = "",
}: CinematicOverlayProps) {
  const layers = getOverlayLayers(variant, primaryColor, hasImage, baseOpacity);

  // Don't render if no layers needed
  if (layers.length === 0) return null;

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: layers.join(", "),
    pointerEvents: "none",
  };

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={overlayStyle}
        className={className}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      style={overlayStyle}
      className={className}
      aria-hidden="true"
    />
  );
}

/**
 * Decorative gradient accent line
 */
interface GradientAccentLineProps {
  primaryColor?: string;
  secondaryColor?: string;
  width?: string;
  height?: string;
  animated?: boolean;
  className?: string;
}

export function GradientAccentLine({
  primaryColor = "#2563eb",
  secondaryColor = "#ec4899",
  width = "120px",
  height = "4px",
  animated = true,
  className = "",
}: GradientAccentLineProps) {
  const lineStyle: React.CSSProperties = {
    width,
    height,
    background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    borderRadius: "2px",
  };

  if (animated) {
    return (
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        style={{ ...lineStyle, transformOrigin: "left" }}
        className={className}
      />
    );
  }

  return <div style={lineStyle} className={className} />;
}

/**
 * Decorative corner accent
 */
interface CornerAccentProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  primaryColor?: string;
  size?: number;
  className?: string;
}

export function CornerAccent({
  position = "bottom-right",
  primaryColor = "#2563eb",
  size = 200,
  className = "",
}: CornerAccentProps) {
  const positionStyles: Record<string, React.CSSProperties> = {
    "top-left": { top: 0, left: 0 },
    "top-right": { top: 0, right: 0 },
    "bottom-left": { bottom: 0, left: 0 },
    "bottom-right": { bottom: 0, right: 0 },
  };

  const gradientDirection: Record<string, string> = {
    "top-left": "to bottom right",
    "top-right": "to bottom left",
    "bottom-left": "to top right",
    "bottom-right": "to top left",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
      style={{
        position: "absolute",
        ...positionStyles[position],
        width: size,
        height: size,
        background: `radial-gradient(circle at ${position.replace("-", " ")}, ${hexToRgba(primaryColor, 0.15)} 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
      className={className}
      aria-hidden="true"
    />
  );
}
