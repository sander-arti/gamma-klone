/**
 * CoverSlide Component
 *
 * Premium cover slide with 6 layout variants for Gamma-level visual impact.
 *
 * Variants:
 * - cinematic: Full-bleed image, dramatic gradient, large title at bottom
 * - editorial: Split layout - text left, image right
 * - minimal: Text-only with subtle gradient background
 * - centered: Centered text over image with vignette
 * - split_diagonal: Diagonal split between color and image
 * - gradient_only: Rich gradient without image
 */

import type { Slide } from "@/lib/schemas/slide";
import type { Block } from "@/lib/schemas/block";
import type { CoverLayoutVariant } from "@/lib/schemas/slide";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer } from "../blocks";
import {
  CinematicOverlay,
  GradientAccentLine,
  CornerAccent,
  CoverTitle,
  CoverSubtitle,
  CoverTextContainer,
} from "./cover";

interface CoverSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
}

// Helper to extract text from block content
function getBlockText(block: Block | null): string {
  if (!block) return "";
  if ("text" in block) return block.text || "";
  return "";
}

export function CoverSlide({
  slide,
  editable = false,
  slideIndex = 0,
}: CoverSlideProps) {
  // Determine variant - default to "cinematic" for new covers
  const variant = (slide.layoutVariant as CoverLayoutVariant) || "cinematic";

  // Extract blocks
  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const subtitleBlockIndex = slide.blocks.findIndex((b) => b.kind === "text");
  const imageBlock = slide.blocks.find((b) => b.kind === "image") as
    | (Block & { url?: string })
    | undefined;

  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;
  const subtitleBlock = subtitleBlockIndex >= 0 ? slide.blocks[subtitleBlockIndex] : null;

  // Check for valid background image
  const hasImage = Boolean(imageBlock?.url && !imageBlock.url.includes("placeholder"));
  const imageUrl = imageBlock?.url || "";

  // Get text content for custom rendering
  const titleText = getBlockText(titleBlock);
  const subtitleText = getBlockText(subtitleBlock);

  // Theme color (would come from ThemeProvider in real usage)
  const primaryColor = "var(--theme-color-primary, #2563eb)";

  // Render based on variant
  switch (variant) {
    case "cinematic":
      return (
        <CinematicLayout
          hasImage={hasImage}
          imageUrl={imageUrl}
          titleText={titleText}
          subtitleText={subtitleText}
          titleBlock={titleBlock}
          subtitleBlock={subtitleBlock}
          titleBlockIndex={titleBlockIndex}
          subtitleBlockIndex={subtitleBlockIndex}
          slideIndex={slideIndex}
          editable={editable}
          primaryColor={primaryColor}
        />
      );

    case "editorial":
      return (
        <EditorialLayout
          hasImage={hasImage}
          imageUrl={imageUrl}
          titleText={titleText}
          subtitleText={subtitleText}
          titleBlock={titleBlock}
          subtitleBlock={subtitleBlock}
          titleBlockIndex={titleBlockIndex}
          subtitleBlockIndex={subtitleBlockIndex}
          slideIndex={slideIndex}
          editable={editable}
          primaryColor={primaryColor}
        />
      );

    case "minimal":
      return (
        <MinimalLayout
          titleText={titleText}
          subtitleText={subtitleText}
          titleBlock={titleBlock}
          subtitleBlock={subtitleBlock}
          titleBlockIndex={titleBlockIndex}
          subtitleBlockIndex={subtitleBlockIndex}
          slideIndex={slideIndex}
          editable={editable}
          primaryColor={primaryColor}
        />
      );

    case "centered":
      return (
        <CenteredLayout
          hasImage={hasImage}
          imageUrl={imageUrl}
          titleText={titleText}
          subtitleText={subtitleText}
          titleBlock={titleBlock}
          subtitleBlock={subtitleBlock}
          titleBlockIndex={titleBlockIndex}
          subtitleBlockIndex={subtitleBlockIndex}
          slideIndex={slideIndex}
          editable={editable}
          primaryColor={primaryColor}
        />
      );

    case "split_diagonal":
      return (
        <SplitDiagonalLayout
          hasImage={hasImage}
          imageUrl={imageUrl}
          titleText={titleText}
          subtitleText={subtitleText}
          titleBlock={titleBlock}
          subtitleBlock={subtitleBlock}
          titleBlockIndex={titleBlockIndex}
          subtitleBlockIndex={subtitleBlockIndex}
          slideIndex={slideIndex}
          editable={editable}
          primaryColor={primaryColor}
        />
      );

    case "gradient_only":
      return (
        <GradientOnlyLayout
          titleText={titleText}
          subtitleText={subtitleText}
          titleBlock={titleBlock}
          subtitleBlock={subtitleBlock}
          titleBlockIndex={titleBlockIndex}
          subtitleBlockIndex={subtitleBlockIndex}
          slideIndex={slideIndex}
          editable={editable}
          primaryColor={primaryColor}
        />
      );

    default:
      // Fallback to cinematic
      return (
        <CinematicLayout
          hasImage={hasImage}
          imageUrl={imageUrl}
          titleText={titleText}
          subtitleText={subtitleText}
          titleBlock={titleBlock}
          subtitleBlock={subtitleBlock}
          titleBlockIndex={titleBlockIndex}
          subtitleBlockIndex={subtitleBlockIndex}
          slideIndex={slideIndex}
          editable={editable}
          primaryColor={primaryColor}
        />
      );
  }
}

// =============================================================================
// Layout Variants
// =============================================================================

interface LayoutProps {
  hasImage?: boolean;
  imageUrl?: string;
  titleText: string;
  subtitleText: string;
  titleBlock: Block | null;
  subtitleBlock: Block | null;
  titleBlockIndex: number;
  subtitleBlockIndex: number;
  slideIndex: number;
  editable: boolean;
  primaryColor: string;
}

/**
 * Cinematic Layout
 * Full-bleed image with dramatic gradient overlay, large title at bottom
 */
function CinematicLayout({
  hasImage,
  imageUrl,
  titleText,
  subtitleText,
  titleBlock,
  subtitleBlock,
  titleBlockIndex,
  subtitleBlockIndex,
  slideIndex,
  editable,
}: LayoutProps) {
  return (
    <SlideLayout className="relative overflow-hidden">
      {/* Background Image */}
      {hasImage && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
      )}

      {/* Cinematic Overlay */}
      <CinematicOverlay
        variant="cinematic"
        hasImage={hasImage}
        baseOpacity={hasImage ? 0.6 : 0.1}
      />

      {/* Corner accent when no image */}
      {!hasImage && <CornerAccent position="bottom-right" size={300} />}

      {/* Content */}
      <CoverTextContainer align="bottom" justify="left">
        {titleText && (
          <CoverTitle light={hasImage} size="hero">
            {editable && titleBlock ? (
              <SmartBlockRenderer
                block={titleBlock}
                slideIndex={slideIndex}
                blockIndex={titleBlockIndex}
                titleLevel={1}
                editable={editable}
              />
            ) : (
              titleText
            )}
          </CoverTitle>
        )}

        <GradientAccentLine
          width="120px"
          height="4px"
          primaryColor={hasImage ? "#ffffff" : undefined}
          secondaryColor={hasImage ? "rgba(255,255,255,0.6)" : undefined}
        />

        {subtitleText && (
          <CoverSubtitle light={hasImage} maxWidth="700px">
            {editable && subtitleBlock ? (
              <SmartBlockRenderer
                block={subtitleBlock}
                slideIndex={slideIndex}
                blockIndex={subtitleBlockIndex}
                editable={editable}
              />
            ) : (
              subtitleText
            )}
          </CoverSubtitle>
        )}
      </CoverTextContainer>
    </SlideLayout>
  );
}

/**
 * Editorial Layout
 * Split layout - text on left (60%), image on right (40%)
 */
function EditorialLayout({
  hasImage,
  imageUrl,
  titleText,
  subtitleText,
  titleBlock,
  subtitleBlock,
  titleBlockIndex,
  subtitleBlockIndex,
  slideIndex,
  editable,
  primaryColor,
}: LayoutProps) {
  return (
    <SlideLayout className="relative overflow-hidden p-0">
      <div className="absolute inset-0 flex">
        {/* Left side - Text content */}
        <div
          className="w-[55%] flex flex-col justify-center"
          style={{
            padding: "clamp(2rem, 5cqw, 4rem)",
            background: "var(--theme-color-background, #f8fafc)",
          }}
        >
          <div className="flex flex-col gap-6 max-w-xl">
            <GradientAccentLine width="80px" height="4px" />

            {titleText && (
              <CoverTitle size="large" animated delay={0.1}>
                {editable && titleBlock ? (
                  <SmartBlockRenderer
                    block={titleBlock}
                    slideIndex={slideIndex}
                    blockIndex={titleBlockIndex}
                    titleLevel={1}
                    editable={editable}
                  />
                ) : (
                  titleText
                )}
              </CoverTitle>
            )}

            {subtitleText && (
              <CoverSubtitle animated delay={0.3}>
                {editable && subtitleBlock ? (
                  <SmartBlockRenderer
                    block={subtitleBlock}
                    slideIndex={slideIndex}
                    blockIndex={subtitleBlockIndex}
                    editable={editable}
                  />
                ) : (
                  subtitleText
                )}
              </CoverSubtitle>
            )}
          </div>
        </div>

        {/* Right side - Image */}
        <div className="w-[45%] relative">
          {hasImage ? (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, color-mix(in srgb, ${primaryColor} 80%, black) 100%)`,
              }}
            />
          )}
        </div>
      </div>
    </SlideLayout>
  );
}

/**
 * Minimal Layout
 * Clean text-only design with subtle gradient
 */
function MinimalLayout({
  titleText,
  subtitleText,
  titleBlock,
  subtitleBlock,
  titleBlockIndex,
  subtitleBlockIndex,
  slideIndex,
  editable,
}: LayoutProps) {
  return (
    <SlideLayout className="relative">
      <CinematicOverlay variant="minimal" hasImage={false} />

      <CoverTextContainer align="center" justify="center">
        <div className="flex flex-col items-center text-center gap-6 max-w-3xl">
          {titleText && (
            <CoverTitle size="hero" animated>
              {editable && titleBlock ? (
                <SmartBlockRenderer
                  block={titleBlock}
                  slideIndex={slideIndex}
                  blockIndex={titleBlockIndex}
                  titleLevel={1}
                  editable={editable}
                />
              ) : (
                titleText
              )}
            </CoverTitle>
          )}

          <GradientAccentLine width="100px" height="3px" />

          {subtitleText && (
            <CoverSubtitle animated maxWidth="600px">
              {editable && subtitleBlock ? (
                <SmartBlockRenderer
                  block={subtitleBlock}
                  slideIndex={slideIndex}
                  blockIndex={subtitleBlockIndex}
                  editable={editable}
                />
              ) : (
                subtitleText
              )}
            </CoverSubtitle>
          )}
        </div>
      </CoverTextContainer>
    </SlideLayout>
  );
}

/**
 * Centered Layout
 * Classic centered text over image with vignette
 */
function CenteredLayout({
  hasImage,
  imageUrl,
  titleText,
  subtitleText,
  titleBlock,
  subtitleBlock,
  titleBlockIndex,
  subtitleBlockIndex,
  slideIndex,
  editable,
}: LayoutProps) {
  return (
    <SlideLayout className="relative overflow-hidden">
      {/* Background */}
      {hasImage && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
      )}

      <CinematicOverlay variant="centered" hasImage={hasImage} baseOpacity={0.5} />

      <CoverTextContainer align="center" justify="center">
        <div className="flex flex-col items-center text-center gap-5 max-w-3xl">
          {titleText && (
            <CoverTitle light={hasImage} size="large" animated>
              {editable && titleBlock ? (
                <SmartBlockRenderer
                  block={titleBlock}
                  slideIndex={slideIndex}
                  blockIndex={titleBlockIndex}
                  titleLevel={1}
                  editable={editable}
                />
              ) : (
                titleText
              )}
            </CoverTitle>
          )}

          <GradientAccentLine
            width="80px"
            height="3px"
            primaryColor={hasImage ? "#ffffff" : undefined}
            secondaryColor={hasImage ? "rgba(255,255,255,0.5)" : undefined}
          />

          {subtitleText && (
            <CoverSubtitle light={hasImage} animated maxWidth="550px">
              {editable && subtitleBlock ? (
                <SmartBlockRenderer
                  block={subtitleBlock}
                  slideIndex={slideIndex}
                  blockIndex={subtitleBlockIndex}
                  editable={editable}
                />
              ) : (
                subtitleText
              )}
            </CoverSubtitle>
          )}
        </div>
      </CoverTextContainer>
    </SlideLayout>
  );
}

/**
 * Split Diagonal Layout
 * Diagonal split between theme color and image
 */
function SplitDiagonalLayout({
  hasImage,
  imageUrl,
  titleText,
  subtitleText,
  titleBlock,
  subtitleBlock,
  titleBlockIndex,
  subtitleBlockIndex,
  slideIndex,
  editable,
  primaryColor,
}: LayoutProps) {
  return (
    <SlideLayout className="relative overflow-hidden p-0">
      {/* Background image */}
      {hasImage && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Diagonal overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor} 45%, transparent 55%)`,
        }}
      />

      {/* Content on the colored side */}
      <div
        className="absolute inset-0 z-20 flex items-center"
        style={{ padding: "clamp(2rem, 5cqw, 4rem)" }}
      >
        <div className="flex flex-col gap-5 max-w-lg">
          <GradientAccentLine
            width="80px"
            height="4px"
            primaryColor="#ffffff"
            secondaryColor="rgba(255,255,255,0.6)"
          />

          {titleText && (
            <CoverTitle light size="large" animated>
              {editable && titleBlock ? (
                <SmartBlockRenderer
                  block={titleBlock}
                  slideIndex={slideIndex}
                  blockIndex={titleBlockIndex}
                  titleLevel={1}
                  editable={editable}
                />
              ) : (
                titleText
              )}
            </CoverTitle>
          )}

          {subtitleText && (
            <CoverSubtitle light animated maxWidth="400px">
              {editable && subtitleBlock ? (
                <SmartBlockRenderer
                  block={subtitleBlock}
                  slideIndex={slideIndex}
                  blockIndex={subtitleBlockIndex}
                  editable={editable}
                />
              ) : (
                subtitleText
              )}
            </CoverSubtitle>
          )}
        </div>
      </div>
    </SlideLayout>
  );
}

/**
 * Gradient Only Layout
 * Rich gradient background without image, bold centered typography
 */
function GradientOnlyLayout({
  titleText,
  subtitleText,
  titleBlock,
  subtitleBlock,
  titleBlockIndex,
  subtitleBlockIndex,
  slideIndex,
  editable,
  primaryColor,
}: LayoutProps) {
  return (
    <SlideLayout className="relative overflow-hidden p-0">
      {/* Rich gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, ${primaryColor} 0%, color-mix(in srgb, ${primaryColor} 70%, #1e1b4b) 50%, #1e1b4b 100%)
          `,
        }}
      />

      {/* Decorative gradient orbs */}
      <div
        className="absolute top-0 right-0 w-1/2 h-1/2 opacity-30"
        style={{
          background: "radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-20"
        style={{
          background: "radial-gradient(circle at bottom left, rgba(236,72,153,0.3) 0%, transparent 60%)",
        }}
      />

      <CoverTextContainer align="center" justify="center">
        <div className="flex flex-col items-center text-center gap-6 max-w-3xl">
          {titleText && (
            <CoverTitle light size="hero" animated>
              {editable && titleBlock ? (
                <SmartBlockRenderer
                  block={titleBlock}
                  slideIndex={slideIndex}
                  blockIndex={titleBlockIndex}
                  titleLevel={1}
                  editable={editable}
                />
              ) : (
                titleText
              )}
            </CoverTitle>
          )}

          <GradientAccentLine
            width="120px"
            height="4px"
            primaryColor="#ffffff"
            secondaryColor="rgba(236,72,153,0.8)"
          />

          {subtitleText && (
            <CoverSubtitle light animated maxWidth="600px">
              {editable && subtitleBlock ? (
                <SmartBlockRenderer
                  block={subtitleBlock}
                  slideIndex={slideIndex}
                  blockIndex={subtitleBlockIndex}
                  editable={editable}
                />
              ) : (
                subtitleText
              )}
            </CoverSubtitle>
          )}
        </div>
      </CoverTextContainer>
    </SlideLayout>
  );
}
