"use client";

/**
 * SmartBlockRenderer Component
 *
 * Renders BlockRenderer or EditableBlockRenderer based on editable prop.
 * Simplifies slide component updates by providing a unified interface.
 */

import type { Block } from "@/lib/schemas/block";
import { BlockRenderer } from "./BlockRenderer";
import { EditableBlockRenderer } from "./EditableBlockRenderer";

interface SmartBlockRendererProps {
  block: Block;
  /** Slide index in the deck */
  slideIndex: number;
  /** Block index within the slide */
  blockIndex: number;
  /** Title level for title blocks */
  titleLevel?: 1 | 2;
  /** Enable inline editing */
  editable?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether AI is currently generating an image for this slide */
  isImageGenerating?: boolean;
}

/**
 * Smart block renderer that automatically switches between
 * read-only and editable modes based on the editable prop.
 */
export function SmartBlockRenderer({
  block,
  slideIndex,
  blockIndex,
  titleLevel = 2,
  editable = false,
  className = "",
  isImageGenerating = false,
}: SmartBlockRendererProps) {
  if (editable) {
    return (
      <EditableBlockRenderer
        block={block}
        slideIndex={slideIndex}
        blockIndex={blockIndex}
        titleLevel={titleLevel}
        className={className}
      />
    );
  }

  return (
    <BlockRenderer
      block={block}
      titleLevel={titleLevel}
      className={className}
      isImageGenerating={isImageGenerating}
    />
  );
}
