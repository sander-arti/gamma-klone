/**
 * GoldenCoverSlide Component
 *
 * Pixel-perfect cover slide matching Gamma's premium design.
 *
 * Features:
 * - Title: 72px, weight 800, -0.02em letter-spacing
 * - Accent line: 120px x 4px, white
 * - Background image: full-bleed with gradient overlay
 * - Padding: 80px all sides
 *
 * NO var(), clamp(), or cqw - only hardcoded pixel values.
 */

"use client";

import type { Slide } from "@/lib/schemas/slide";
import type { SlotContent } from "@/lib/templates/types";

interface GoldenCoverSlideProps {
  slide: Slide;
  slotContent?: SlotContent;
  editable?: boolean;
  slideIndex?: number;
}

export function GoldenCoverSlide({
  slide,
  slotContent,
  editable = false,
  slideIndex = 0,
}: GoldenCoverSlideProps) {
  // Extract content from slot or fall back to slide blocks
  const titleBlock = slide.blocks.find((b) => b.kind === "title");
  const textBlock = slide.blocks.find((b) => b.kind === "text");
  const imageBlock = slide.blocks.find((b) => b.kind === "image");

  const title = slotContent?.title ?? titleBlock?.text ?? "";
  const subtitle = slotContent?.body ?? textBlock?.text ?? "";
  const backgroundUrl = slotContent?.imageUrl ?? imageBlock?.url;

  // Check for valid background image
  const hasBackground = backgroundUrl && !backgroundUrl.includes("placeholder");

  return (
    <div
      className="golden-slide"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Image */}
      {hasBackground && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: 0,
          }}
          aria-hidden="true"
        />
      )}

      {/* Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hasBackground
            ? "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.45) 100%)"
            : "linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.04) 100%)",
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          padding: "80px 100px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: hasBackground ? "#FFFFFF" : "#0F172A",
            textShadow: hasBackground ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
            margin: 0,
            marginBottom: "24px",
            maxWidth: "800px",
          }}
        >
          {title}
        </h1>

        {/* Accent Line */}
        <div
          style={{
            width: "120px",
            height: "4px",
            backgroundColor: hasBackground ? "#FFFFFF" : "#E91E63",
            borderRadius: "2px",
            marginBottom: "24px",
          }}
          aria-hidden="true"
        />

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontSize: "24px",
              fontWeight: 400,
              lineHeight: 1.5,
              color: hasBackground ? "rgba(255,255,255,0.9)" : "#64748B",
              textShadow: hasBackground ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
              margin: 0,
              maxWidth: "600px",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Decorative gradient corner (when no background) */}
      {!hasBackground && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "30%",
            height: "30%",
            background: "radial-gradient(circle at bottom right, #E91E63 0%, transparent 70%)",
            opacity: 0.05,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
