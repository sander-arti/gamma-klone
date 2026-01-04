/**
 * BlockRenderer Component
 *
 * Factory component that renders the appropriate block component
 * based on the block's kind property.
 */

import type { Block } from "@/lib/schemas/block";
import { TitleBlock } from "./TitleBlock";
import { TextBlock } from "./TextBlock";
import { BulletsBlock } from "./BulletsBlock";
import { ImageBlock } from "./ImageBlock";
import { TableBlock } from "./TableBlock";
import { CalloutBlock } from "./CalloutBlock";
import { StatBlock } from "./StatBlock";
import { TimelineStepBlock } from "./TimelineStepBlock";
import { IconCardBlock } from "./IconCardBlock";
import { NumberedCardBlock } from "./NumberedCardBlock";

interface BlockRendererProps {
  block: Block;
  /** Title level: 1 for slide title, 2 for section heading */
  titleLevel?: 1 | 2;
  /** Additional CSS classes */
  className?: string;
  /** Whether AI is currently generating an image for this slide */
  isImageGenerating?: boolean;
}

export function BlockRenderer({
  block,
  titleLevel = 2,
  className = "",
  isImageGenerating = false,
}: BlockRendererProps) {
  switch (block.kind) {
    case "title":
      return <TitleBlock text={block.text ?? ""} level={titleLevel} className={className} />;

    case "text":
      return <TextBlock text={block.text ?? ""} className={className} />;

    case "bullets":
      return <BulletsBlock items={block.items ?? []} className={className} />;

    case "image":
      return (
        <ImageBlock
          url={block.url ?? ""}
          alt={block.alt ?? ""}
          cropMode={block.cropMode}
          className={className}
          isGenerating={isImageGenerating}
        />
      );

    case "table":
      return (
        <TableBlock columns={block.columns ?? []} rows={block.rows ?? []} className={className} />
      );

    case "callout":
      return <CalloutBlock text={block.text ?? ""} style={block.style} className={className} />;

    case "stat_block":
      return (
        <StatBlock
          value={block.value ?? ""}
          label={block.label ?? ""}
          sublabel={block.sublabel}
          className={className}
        />
      );

    case "timeline_step":
      return (
        <TimelineStepBlock
          step={block.step ?? 1}
          title={block.text ?? ""}
          description={block.description}
          status={block.status}
          className={className}
        />
      );

    case "icon_card":
      return (
        <IconCardBlock
          icon={block.icon ?? "circle"}
          text={block.text ?? ""}
          description={block.description}
          bgColor={block.bgColor}
          className={className}
        />
      );

    case "numbered_card":
      return (
        <NumberedCardBlock
          number={block.number ?? 1}
          text={block.text ?? ""}
          description={block.description}
          className={className}
        />
      );

    default:
      console.warn(`Unknown block kind: ${(block as Block).kind}`);
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded">
          Unknown block type: {(block as Block).kind}
        </div>
      );
  }
}
