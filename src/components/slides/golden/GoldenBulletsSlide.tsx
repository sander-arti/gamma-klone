/**
 * GoldenBulletsSlide Component
 *
 * Pixel-perfect bullet points slide matching Gamma's premium design.
 *
 * Features:
 * - 4-5 bullet points (hardcoded max)
 * - Pink accent bullets: 8px diameter
 * - Bullet text: 22px, line-height 1.6
 * - Gap: 20px between items
 *
 * NO var(), clamp(), or cqw - only hardcoded pixel values.
 */

"use client";

import type { Slide } from "@/lib/schemas/slide";
import type { SlotContent } from "@/lib/templates/types";

interface GoldenBulletsSlideProps {
  slide: Slide;
  slotContent?: SlotContent;
  editable?: boolean;
  slideIndex?: number;
}

export function GoldenBulletsSlide({
  slide,
  slotContent,
  editable = false,
  slideIndex = 0,
}: GoldenBulletsSlideProps) {
  // Extract content from slot or fall back to slide blocks
  const titleBlock = slide.blocks.find((b) => b.kind === "title");
  const bulletsBlock = slide.blocks.find((b) => b.kind === "bullets");

  const title = slotContent?.title ?? titleBlock?.text ?? "Viktige punkter";

  // Get bullets from slotContent or slide blocks (max 5)
  // The bullets block has an `items` array property
  const bullets = slotContent?.items?.slice(0, 5).map((item) => item.text) ??
    (bulletsBlock?.items ?? []).slice(0, 5);

  return (
    <div
      className="golden-slide"
      style={{
        width: "100%",
        height: "100%",
        padding: "80px 100px",
        display: "flex",
        flexDirection: "column",
        gap: "48px",
        backgroundColor: "#FFFFFF",
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

      {/* Bullets List */}
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {bullets.map((bullet, index) => (
          <li
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
              fontSize: "22px",
              fontWeight: 400,
              lineHeight: 1.6,
              color: "#334155",
            }}
          >
            {/* Pink bullet point */}
            <span
              style={{
                flexShrink: 0,
                width: "8px",
                height: "8px",
                marginTop: "12px",
                backgroundColor: "#E91E63",
                borderRadius: "50%",
              }}
              aria-hidden="true"
            />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
