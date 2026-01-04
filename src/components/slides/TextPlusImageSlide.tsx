/**
 * TextPlusImageSlide Component
 *
 * Text with accompanying image slide.
 * Layout variants: default, image_left, image_right, image_background
 */

import type { Slide } from "@/lib/schemas/slide";
import { isContentBlock } from "@/lib/schemas/block";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer } from "../blocks";

interface TextPlusImageSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
  /** Whether AI is currently generating an image for this slide */
  isImageGenerating?: boolean;
}

export function TextPlusImageSlide({
  slide,
  editable = false,
  slideIndex = 0,
  isImageGenerating = false,
}: TextPlusImageSlideProps) {
  const variant = slide.layoutVariant || "image_right";

  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  // Find any content block (text, bullets, callout) - allows AI to transform text to bullets
  const contentBlockIndex = slide.blocks.findIndex((b) => isContentBlock(b.kind));
  const imageBlockIndex = slide.blocks.findIndex((b) => b.kind === "image");

  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;
  const contentBlock = contentBlockIndex >= 0 ? slide.blocks[contentBlockIndex] : null;
  const imageBlock = imageBlockIndex >= 0 ? slide.blocks[imageBlockIndex] : null;

  // Image background variant - special layout
  if (variant === "image_background") {
    return (
      <div className="relative w-full h-full">
        {/* Background image */}
        {imageBlock && (
          <div className="absolute inset-0">
            <SmartBlockRenderer
              block={imageBlock}
              slideIndex={slideIndex}
              blockIndex={imageBlockIndex}
              editable={false}
              isImageGenerating={isImageGenerating}
            />
          </div>
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Content */}
        <SlideLayout className="relative z-10 justify-end">
          <div className="space-y-[var(--theme-spacing-block-gap)] max-w-3xl">
            {titleBlock && (
              <div className="[&_*]:text-white">
                <SmartBlockRenderer
                  block={titleBlock}
                  slideIndex={slideIndex}
                  blockIndex={titleBlockIndex}
                  titleLevel={2}
                  editable={editable}
                />
              </div>
            )}
            {contentBlock && (
              <div className="[&_*]:text-white/90">
                <SmartBlockRenderer
                  block={contentBlock}
                  slideIndex={slideIndex}
                  blockIndex={contentBlockIndex}
                  editable={editable}
                />
              </div>
            )}
          </div>
        </SlideLayout>
      </div>
    );
  }

  // Standard layouts with image left or right
  const isImageLeft = variant === "image_left";

  return (
    <SlideLayout className="justify-start">
      {titleBlock && (
        <div className="mb-[var(--theme-spacing-block-gap)]">
          <SmartBlockRenderer
            block={titleBlock}
            slideIndex={slideIndex}
            blockIndex={titleBlockIndex}
            titleLevel={2}
            editable={editable}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-[var(--theme-spacing-block-gap)] flex-1 min-h-0">
        {isImageLeft ? (
          <>
            <div className="flex items-center min-h-0">
              {imageBlock && (
                <SmartBlockRenderer
                  block={imageBlock}
                  slideIndex={slideIndex}
                  blockIndex={imageBlockIndex}
                  editable={false}
                  isImageGenerating={isImageGenerating}
                />
              )}
            </div>
            <div className="flex items-center">
              {contentBlock && (
                <SmartBlockRenderer
                  block={contentBlock}
                  slideIndex={slideIndex}
                  blockIndex={contentBlockIndex}
                  editable={editable}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center">
              {contentBlock && (
                <SmartBlockRenderer
                  block={contentBlock}
                  slideIndex={slideIndex}
                  blockIndex={contentBlockIndex}
                  editable={editable}
                />
              )}
            </div>
            <div className="flex items-center min-h-0">
              {imageBlock && (
                <SmartBlockRenderer
                  block={imageBlock}
                  slideIndex={slideIndex}
                  blockIndex={imageBlockIndex}
                  editable={false}
                  isImageGenerating={isImageGenerating}
                />
              )}
            </div>
          </>
        )}
      </div>
    </SlideLayout>
  );
}
