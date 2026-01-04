"use client";

/**
 * ImageBlock Component (Punkt 5)
 *
 * Premium image rendering with theme-aware styling:
 * - Multiple style variants (default, framed, floating, minimal)
 * - Loading skeleton animation
 * - Error state with fallback
 * - Placeholder when no URL
 * - Smooth fade-in on load
 * - Theme-aware shadows and borders
 */

import { useState, useCallback } from "react";
import { ImageIcon, AlertCircle, Sparkles } from "lucide-react";

export type ImageStyleVariant = "default" | "framed" | "floating" | "minimal";

interface ImageBlockProps {
  url: string;
  alt: string;
  cropMode?: "cover" | "contain" | "fill";
  className?: string;
  caption?: string;
  /** Style variant for the image container */
  variant?: ImageStyleVariant;
  /** Custom aspect ratio (default: 16/9) */
  aspectRatio?: string;
  /** Whether AI is currently generating an image for this block */
  isGenerating?: boolean;
}

type ImageStatus = "loading" | "loaded" | "error";

export function ImageBlock({
  url,
  alt,
  cropMode = "cover",
  className = "",
  caption,
  variant = "default",
  aspectRatio = "16/9",
  isGenerating = false,
}: ImageBlockProps) {
  const [status, setStatus] = useState<ImageStatus>(url ? "loading" : "error");

  const handleLoad = useCallback(() => {
    setStatus("loaded");
  }, []);

  const handleError = useCallback(() => {
    setStatus("error");
  }, []);

  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
  };

  // Get container styles based on variant
  const getContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      aspectRatio,
      borderRadius: "var(--theme-effects-image-border-radius, 0.75rem)",
      overflow: "hidden",
    };

    switch (variant) {
      case "framed":
        return {
          ...baseStyle,
          boxShadow: "var(--theme-effects-image-shadow, 0 4px 12px -2px rgba(0, 0, 0, 0.08))",
          border: `var(--theme-effects-image-frame-width, 4px) solid var(--theme-effects-image-frame-color, rgba(255, 255, 255, 0.9))`,
        };
      case "floating":
        return {
          ...baseStyle,
          boxShadow: "var(--theme-effects-image-shadow-floating, 0 20px 40px -12px rgba(0, 0, 0, 0.15))",
          transform: "translateY(-2px)",
        };
      case "minimal":
        return {
          ...baseStyle,
          boxShadow: "none",
          borderRadius: "var(--theme-effects-border-radius-small, 0.375rem)",
        };
      default:
        return {
          ...baseStyle,
          boxShadow: "var(--theme-effects-image-shadow, 0 4px 12px -2px rgba(0, 0, 0, 0.08))",
        };
    }
  };

  // Inner shadow overlay for depth (not on minimal)
  const showInnerShadow = variant !== "minimal" && status === "loaded";

  // AI Generating state - show pulsing animation with sparkles
  if (isGenerating && !url) {
    return (
      <div
        className={`relative w-full overflow-hidden ${className}`}
        style={{
          aspectRatio,
          borderRadius: "var(--theme-effects-image-border-radius, 0.75rem)",
          background: "linear-gradient(135deg, #ede9fe 0%, #fae8ff 50%, #e0e7ff 100%)",
        }}
      >
        {/* Animated shimmer overlay */}
        <div
          className="absolute inset-0 animate-shimmer"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          {/* Pulsing sparkles icon */}
          <div className="relative">
            <Sparkles
              className="w-10 h-10 animate-pulse"
              style={{ color: "#8b5cf6" }}
            />
            {/* Glow effect */}
            <div
              className="absolute inset-0 blur-md animate-pulse"
              style={{ background: "rgba(139, 92, 246, 0.3)", borderRadius: "50%" }}
              aria-hidden="true"
            />
          </div>
          <span
            className="animate-pulse"
            style={{
              color: "#6b21a8",
              fontSize: "var(--theme-typography-caption-size, 0.875rem)",
              fontWeight: 500,
            }}
          >
            Genererer bilde...
          </span>
        </div>
      </div>
    );
  }

  // Placeholder when no URL provided (not generating)
  if (!url) {
    return (
      <div
        className={`relative w-full overflow-hidden ${className}`}
        style={{
          aspectRatio,
          borderRadius: "var(--theme-effects-image-border-radius, 0.75rem)",
          background: "var(--theme-effects-image-placeholder-bg, linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%))",
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <ImageIcon
            className="w-12 h-12"
            style={{ color: "var(--theme-color-foreground-muted, #64748b)" }}
          />
          <span
            style={{
              color: "var(--theme-color-foreground-muted, #64748b)",
              fontSize: "var(--theme-typography-caption-size, 0.8125rem)",
            }}
          >
            Bilde mangler
          </span>
        </div>
      </div>
    );
  }

  return (
    <figure className={`relative w-full ${className}`}>
      {/* Image container with theme-aware styling */}
      <div
        className="relative w-full transition-transform duration-300"
        style={getContainerStyle()}
      >
        {/* Loading skeleton */}
        {status === "loading" && (
          <div
            className="absolute inset-0 animate-shimmer"
            style={{
              background: "var(--theme-effects-image-placeholder-bg, linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%))",
              backgroundSize: "200% 100%",
            }}
            aria-hidden="true"
          />
        )}

        {/* Error state */}
        {status === "error" && url && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{
              background: "var(--theme-effects-image-placeholder-bg, linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%))",
            }}
          >
            <AlertCircle
              className="w-10 h-10"
              style={{ color: "var(--theme-color-error, #dc2626)" }}
            />
            <span
              style={{
                color: "var(--theme-color-foreground-muted, #64748b)",
                fontSize: "var(--theme-typography-caption-size, 0.8125rem)",
              }}
            >
              Kunne ikke laste bilde
            </span>
          </div>
        )}

        {/* Actual image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full transition-opacity duration-300 ${objectFitClass[cropMode]}`}
          style={{
            opacity: status === "loaded" ? 1 : 0,
          }}
        />

        {/* Inner shadow overlay for depth */}
        {showInnerShadow && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: "var(--theme-effects-image-inner-shadow, inset 0 0 0 1px rgba(0, 0, 0, 0.04))",
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Caption with theme typography */}
      {caption && status === "loaded" && (
        <figcaption
          className="mt-2 text-center animate-fade-in"
          style={{
            color: "var(--theme-color-foreground-muted, #64748b)",
            fontSize: "var(--theme-typography-caption-size, 0.8125rem)",
            lineHeight: "var(--theme-typography-caption-line-height, 1.4)",
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
