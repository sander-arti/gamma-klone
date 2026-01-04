/**
 * ActionItemsTableSlide Component
 *
 * Task/Owner/Deadline table slide.
 * Layout variants: default, compact, detailed
 */

import type { Slide } from "@/lib/schemas/slide";
import { SlideLayout } from "./SlideLayout";
import { SmartBlockRenderer } from "../blocks";

interface ActionItemsTableSlideProps {
  slide: Slide;
  editable?: boolean;
  slideIndex?: number;
}

export function ActionItemsTableSlide({
  slide,
  editable = false,
  slideIndex = 0,
}: ActionItemsTableSlideProps) {
  const variant = slide.layoutVariant || "default";

  const titleBlockIndex = slide.blocks.findIndex((b) => b.kind === "title");
  const tableBlockIndex = slide.blocks.findIndex((b) => b.kind === "table");

  const titleBlock = titleBlockIndex >= 0 ? slide.blocks[titleBlockIndex] : null;
  const tableBlock = tableBlockIndex >= 0 ? slide.blocks[tableBlockIndex] : null;

  // Size classes based on variant
  const tableClasses: Record<string, string> = {
    default: "",
    compact: "[&_td]:py-2 [&_th]:py-2 text-sm",
    detailed: "[&_td]:py-4 [&_th]:py-4",
  };

  return (
    <SlideLayout className="justify-start">
      <div className="space-y-[var(--theme-spacing-block-gap)]">
        {titleBlock && (
          <SmartBlockRenderer
            block={titleBlock}
            slideIndex={slideIndex}
            blockIndex={titleBlockIndex}
            titleLevel={2}
            editable={editable}
          />
        )}
        {tableBlock && (
          <div className={tableClasses[variant] || ""}>
            <SmartBlockRenderer
              block={tableBlock}
              slideIndex={slideIndex}
              blockIndex={tableBlockIndex}
              editable={editable}
            />
          </div>
        )}
      </div>
    </SlideLayout>
  );
}
