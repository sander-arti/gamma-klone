/**
 * PersonSpotlightSlide Component
 *
 * Profile/spotlight slide for featuring a person.
 * Shows portrait image, name, title, and key points.
 * Layout variants: centered, side_by_side
 */

import type { Slide } from "@/lib/schemas/slide";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer, ImageBlock } from "../blocks";

interface PersonSpotlightSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
  /** Whether AI is currently generating an image for this slide */
  isImageGenerating?: boolean;
}

export function PersonSpotlightSlide({
  slide,
  editable = false,
  slideIndex = 0,
  isImageGenerating = false,
}: PersonSpotlightSlideProps) {
  const variant = slide.layoutVariant || "centered";
  const isCentered = variant === "centered";

  // Find blocks - use existing block types
  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;

  const imageBlock = slide.blocks.find((b) => b.kind === "image");

  // Get all text blocks - first one is role, second is bio
  const textBlocks = slide.blocks.filter((b) => b.kind === "text");
  const roleTextBlock = textBlocks[0];
  const bioTextBlock = textBlocks[1];

  // Get bullets block for key points
  const bulletsBlock = slide.blocks.find((b) => b.kind === "bullets");

  // Extract data from blocks
  const personName = titleBlock?.text ?? "Navn";
  const personRole = roleTextBlock?.text ?? "";
  const personBio = bioTextBlock?.text ?? "";
  const personPoints = bulletsBlock?.items ?? [];

  // Styles for centered variant
  const centeredContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textAlign: "center",
    gap: "var(--theme-spacing-block-gap, 1.5rem)",
  };

  const avatarStyle: React.CSSProperties = {
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "4px solid var(--theme-color-accent, #8b5cf6)",
    boxShadow: "0 10px 40px rgba(139, 92, 246, 0.3)",
  };

  const nameStyle: React.CSSProperties = {
    fontSize: "var(--theme-font-size-h1, 2.5rem)",
    fontWeight: 700,
    color: "var(--theme-color-foreground, #0f172a)",
    letterSpacing: "-0.02em",
    margin: 0,
  };

  const roleStyle: React.CSSProperties = {
    fontSize: "var(--theme-font-size-h3, 1.25rem)",
    color: "var(--theme-color-accent, #8b5cf6)",
    fontWeight: 500,
  };

  const bioStyle: React.CSSProperties = {
    fontSize: "var(--theme-font-size-body, 1rem)",
    color: "var(--theme-color-foreground-muted, #64748b)",
    maxWidth: "50ch",
    lineHeight: 1.6,
  };

  const pointsContainerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--theme-spacing-block-gap, 0.75rem)",
    justifyContent: isCentered ? "center" : "flex-start",
    marginTop: "var(--theme-spacing-block-gap, 1rem)",
  };

  const pointStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    background: "var(--theme-color-accent-subtle, #f0f9ff)",
    borderRadius: "var(--theme-border-radius, 0.5rem)",
    fontSize: "var(--theme-font-size-sm, 0.875rem)",
    color: "var(--theme-color-foreground, #0f172a)",
  };

  const bulletStyle: React.CSSProperties = {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--theme-color-accent, #8b5cf6)",
  };

  if (!isCentered) {
    // Side-by-side layout
    return (
      <SlideLayout className="p-0 overflow-hidden">
        <div
          style={{
            display: "flex",
            height: "100%",
          }}
        >
          {/* Image side */}
          <div
            style={{
              flex: "0 0 40%",
              position: "relative",
              background:
                "linear-gradient(135deg, var(--theme-color-accent, #8b5cf6) 0%, #6366f1 100%)",
            }}
          >
            {imageBlock && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2rem",
                }}
              >
                <div
                  style={{
                    width: "280px",
                    height: "280px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "6px solid rgba(255,255,255,0.3)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                  }}
                >
                  <ImageBlock
                    url={imageBlock.url ?? ""}
                    alt={imageBlock.alt ?? personName}
                    cropMode="cover"
                    isGenerating={isImageGenerating}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content side */}
          <div
            style={{
              flex: 1,
              padding: "var(--theme-spacing-section, 2rem)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "var(--theme-spacing-block-gap, 1rem)",
            }}
          >
            <h2 style={nameStyle}>{personName}</h2>
            {personRole && <div style={roleStyle}>{personRole}</div>}
            {personBio && <p style={bioStyle}>{personBio}</p>}

            {personPoints.length > 0 && (
              <div style={pointsContainerStyle}>
                {personPoints.map((point, index) => (
                  <div key={index} style={pointStyle}>
                    <span style={bulletStyle} />
                    {point}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SlideLayout>
    );
  }

  // Centered layout
  return (
    <SlideLayout>
      <div style={centeredContainerStyle}>
        {/* Avatar */}
        {imageBlock && (
          <div style={avatarStyle}>
            <ImageBlock
              url={imageBlock.url ?? ""}
              alt={imageBlock.alt ?? personName}
              cropMode="cover"
              isGenerating={isImageGenerating}
            />
          </div>
        )}

        {/* Name */}
        <h2 style={nameStyle}>{personName}</h2>

        {/* Role */}
        {personRole && <div style={roleStyle}>{personRole}</div>}

        {/* Bio */}
        {personBio && <p style={bioStyle}>{personBio}</p>}

        {/* Key points */}
        {personPoints.length > 0 && (
          <div style={pointsContainerStyle}>
            {personPoints.map((point, index) => (
              <div key={index} style={pointStyle}>
                <span style={bulletStyle} />
                {point}
              </div>
            ))}
          </div>
        )}
      </div>
    </SlideLayout>
  );
}
