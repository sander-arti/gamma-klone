"use client";

/**
 * StreamingSlidePreview Component
 *
 * Renders a slide being generated in real-time with character-by-character
 * typing animation. Shows blocks as they stream in from the AI.
 */

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { StreamingTextBlock } from "./StreamingTextBlock";
import type { StreamingBlock } from "@/hooks/useGenerationStream";

interface StreamingSlidePreviewProps {
  blocks: StreamingBlock[];
  slideIndex: number;
  className?: string;
}

export function StreamingSlidePreview({
  blocks,
  slideIndex,
  className = "",
}: StreamingSlidePreviewProps) {
  if (blocks.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full gap-3 ${className}`}>
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-8 h-8 text-emerald-400" />
        </motion.div>
        <span className="text-sm text-muted-foreground">Starter slide {slideIndex + 1}...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 p-4 ${className}`}>
      {blocks.map((block, index) => {
        const isLatest = index === blocks.length - 1;
        const isStreaming = isLatest && !block.isComplete;

        return (
          <StreamingBlockRenderer
            key={`${block.kind}-${index}`}
            block={block}
            isStreaming={isStreaming}
          />
        );
      })}
    </div>
  );
}

interface StreamingBlockRendererProps {
  block: StreamingBlock;
  isStreaming: boolean;
}

function StreamingBlockRenderer({ block, isStreaming }: StreamingBlockRendererProps) {
  const { kind, text } = block;

  switch (kind) {
    case "title":
      return (
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg font-bold text-foreground"
        >
          <StreamingTextBlock text={text} isStreaming={isStreaming} speed="fast" />
        </motion.h2>
      );

    case "text":
      return (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground leading-relaxed"
        >
          <StreamingTextBlock text={text} isStreaming={isStreaming} speed="normal" />
        </motion.p>
      );

    case "bullets":
      // Parse bullet text (assuming newline-separated or similar)
      const bulletItems = text.split("\n").filter(Boolean);
      return (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-1 text-sm text-muted-foreground list-disc list-inside"
        >
          {bulletItems.map((item, i) => (
            <li key={i}>
              <StreamingTextBlock
                text={item.replace(/^[-*]\s*/, "")}
                isStreaming={isStreaming && i === bulletItems.length - 1}
                speed="normal"
              />
            </li>
          ))}
        </motion.ul>
      );

    case "callout":
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-primary/5 rounded-lg border border-primary/10"
        >
          <p className="text-sm italic text-primary/80">
            <StreamingTextBlock text={text} isStreaming={isStreaming} speed="normal" />
          </p>
        </motion.div>
      );

    case "stat_block":
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <span className="text-2xl font-bold text-primary">
            <StreamingTextBlock text={text} isStreaming={isStreaming} speed="fast" />
          </span>
        </motion.div>
      );

    case "image":
      // Image blocks just show a placeholder during streaming
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-20 bg-muted/30 rounded-lg border-2 border-dashed border-muted"
        >
          <span className="text-xs text-muted-foreground">Bilde genereres...</span>
        </motion.div>
      );

    case "table":
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-2 bg-muted/20 rounded text-xs text-muted-foreground"
        >
          <StreamingTextBlock
            text={text || "Tabell data..."}
            isStreaming={isStreaming}
            speed="normal"
          />
        </motion.div>
      );

    default:
      // Fallback for unknown block types
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          <StreamingTextBlock text={text} isStreaming={isStreaming} speed="normal" />
        </motion.div>
      );
  }
}

export default StreamingSlidePreview;
