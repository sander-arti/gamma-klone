/**
 * GoldenStatsSlide Component
 *
 * Pixel-perfect statistics slide matching Gamma's premium design.
 *
 * Features:
 * - Exactly 3 statistics in horizontal grid
 * - Stat value: 64px, weight 800, pink color
 * - Stat label: 18px, weight 500
 * - Grid gap: 48px
 * - Optional intro text above stats
 *
 * NO var(), clamp(), or cqw - only hardcoded pixel values.
 */

"use client";

import type { Slide } from "@/lib/schemas/slide";
import type { SlotContent } from "@/lib/templates/types";

interface GoldenStatsSlideProps {
  slide: Slide;
  slotContent?: SlotContent;
  editable?: boolean;
  slideIndex?: number;
}

export function GoldenStatsSlide({
  slide,
  slotContent,
  editable = false,
  slideIndex = 0,
}: GoldenStatsSlideProps) {
  // Extract content from slot or fall back to slide blocks
  const titleBlock = slide.blocks.find((b) => b.kind === "title");
  const textBlock = slide.blocks.find((b) => b.kind === "text");
  const statBlocks = slide.blocks.filter((b) => b.kind === "stat_block");

  const title = slotContent?.title ?? titleBlock?.text ?? "Nøkkeltall";
  const intro = slotContent?.body ?? textBlock?.text ?? "";

  // Get stats from slotContent or slide blocks
  const stats =
    slotContent?.items?.slice(0, 3) ??
    statBlocks.slice(0, 3).map((block) => ({
      value: block.value ?? "",
      label: block.label ?? "",
      sublabel: block.sublabel,
    }));

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
      {/* Header section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
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

        {/* Intro text */}
        {intro && (
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
            {intro}
          </p>
        )}
      </div>

      {/* Stats Grid - exactly 3 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "48px",
          marginTop: "auto",
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* Stat Value */}
            <div
              style={{
                fontSize: "64px",
                fontWeight: 800,
                lineHeight: 1,
                color: "#E91E63",
              }}
            >
              {stat.value}
            </div>

            {/* Stat Label */}
            <div
              style={{
                fontSize: "18px",
                fontWeight: 500,
                lineHeight: 1.4,
                color: "#334155",
              }}
            >
              {stat.label}
            </div>

            {/* Stat Sublabel (optional) */}
            {stat.sublabel && (
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#64748B",
                }}
              >
                {stat.sublabel}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
