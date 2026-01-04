/**
 * GoldenContentSlide Component
 *
 * Pixel-perfect 60/40 split content slide matching Gamma's premium design.
 *
 * Features:
 * - 60/40 text-to-image split (or 40/60 reversed)
 * - Heading: 36px, weight 700
 * - Body: 20px, line-height 1.65
 * - Image: rounded corners, subtle shadow
 * - Gap: 64px between columns
 *
 * NO var(), clamp(), or cqw - only hardcoded pixel values.
 */

"use client";

import type { Slide } from "@/lib/schemas/slide";
import type { SlotContent } from "@/lib/templates/types";

interface GoldenContentSlideProps {
  slide: Slide;
  slotContent?: SlotContent;
  editable?: boolean;
  slideIndex?: number;
  /** Layout variant: text on left (default) or right */
  textPosition?: "left" | "right";
}

export function GoldenContentSlide({
  slide,
  slotContent,
  editable = false,
  slideIndex = 0,
  textPosition = "left",
}: GoldenContentSlideProps) {
  // Extract content from slot or fall back to slide blocks
  const titleBlock = slide.blocks.find((b) => b.kind === "title");
  const textBlock = slide.blocks.find((b) => b.kind === "text");
  const imageBlock = slide.blocks.find((b) => b.kind === "image");

  const title = slotContent?.title ?? titleBlock?.text ?? "";
  const body = slotContent?.body ?? textBlock?.text ?? "";
  const imageUrl = slotContent?.imageUrl ?? imageBlock?.url ?? "";
  const imageAlt = slotContent?.imageAlt ?? imageBlock?.alt ?? "";

  const isTextLeft = textPosition === "left";

  return (
    <div
      className="golden-slide"
      style={{
        width: "100%",
        height: "100%",
        padding: "80px 100px",
        display: "grid",
        gridTemplateColumns: isTextLeft ? "60fr 40fr" : "40fr 60fr",
        gap: "64px",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Text Column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          order: isTextLeft ? 1 : 2,
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: "36px",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            color: "#0F172A",
            margin: 0,
          }}
        >
          {title}
        </h2>

        {/* Body Text */}
        <p
          style={{
            fontSize: "20px",
            fontWeight: 400,
            lineHeight: 1.65,
            color: "#334155",
            margin: 0,
          }}
        >
          {body}
        </p>
      </div>

      {/* Image Column */}
      <div
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "400px",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          order: isTextLeft ? 2 : 1,
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#94A3B8", fontSize: "16px" }}>
              Bilde genereres...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
