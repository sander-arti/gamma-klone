/**
 * GoldenCTASlide Component
 *
 * Pixel-perfect call-to-action slide matching Gamma's premium design.
 *
 * Features:
 * - Centered layout
 * - Title: 48px, weight 700
 * - Subtitle: 20px, muted color
 * - 2-3 action items with pink bullet badges
 *
 * NO var(), clamp(), or cqw - only hardcoded pixel values.
 */

"use client";

import type { Slide } from "@/lib/schemas/slide";
import type { SlotContent } from "@/lib/templates/types";

interface GoldenCTASlideProps {
  slide: Slide;
  slotContent?: SlotContent;
  editable?: boolean;
  slideIndex?: number;
}

export function GoldenCTASlide({
  slide,
  slotContent,
  editable = false,
  slideIndex = 0,
}: GoldenCTASlideProps) {
  // Extract content from slot or fall back to slide blocks
  const titleBlock = slide.blocks.find((b) => b.kind === "title");
  const textBlock = slide.blocks.find((b) => b.kind === "text");
  const bulletsBlock = slide.blocks.find((b) => b.kind === "bullets");

  const title = slotContent?.title ?? titleBlock?.text ?? "Neste steg";
  const subtitle = slotContent?.body ?? textBlock?.text ?? "";

  // Get actions from slotContent or slide blocks (max 3)
  // The bullets block has an `items` array property
  const actions = slotContent?.items?.slice(0, 3).map((item) => item.text) ??
    (bulletsBlock?.items ?? []).slice(0, 3);

  return (
    <div
      className="golden-slide"
      style={{
        width: "100%",
        height: "100%",
        padding: "80px 100px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        gap: "32px",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: "48px",
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
          color: "#0F172A",
          margin: 0,
        }}
      >
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontSize: "20px",
            fontWeight: 400,
            lineHeight: 1.65,
            color: "#64748B",
            margin: 0,
            maxWidth: "600px",
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Action Items */}
      {actions.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          {actions.map((action, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "20px",
                fontWeight: 500,
                color: "#0F172A",
              }}
            >
              {/* Pink badge with number */}
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  backgroundColor: "#E91E63",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </span>
              <span>{action}</span>
            </div>
          ))}
        </div>
      )}

      {/* Decorative accent line at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "60px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80px",
          height: "4px",
          backgroundColor: "#E91E63",
          borderRadius: "2px",
          opacity: 0.5,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
