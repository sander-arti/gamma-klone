"use client";

/**
 * StreamingTextBlock Component
 *
 * Displays text with character-by-character typing animation.
 * Creates the "magic" effect of seeing AI write content in real-time.
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InlineGeneratingCursor } from "./GeneratingIndicator";

interface StreamingTextBlockProps {
  text: string;
  isStreaming?: boolean;
  speed?: "slow" | "normal" | "fast";
  onComplete?: () => void;
  className?: string;
}

const SPEED_MAP = {
  slow: 50,
  normal: 25,
  fast: 10,
};

export function StreamingTextBlock({
  text,
  isStreaming = false,
  speed = "normal",
  onComplete,
  className = "",
}: StreamingTextBlockProps) {
  const [displayedLength, setDisplayedLength] = useState(isStreaming ? 0 : text.length);

  const charDelay = SPEED_MAP[speed];

  // Animate text reveal when streaming
  useEffect(() => {
    if (!isStreaming) {
      setDisplayedLength(text.length);
      return;
    }

    if (displayedLength >= text.length) {
      onComplete?.();
      return;
    }

    const timeout = setTimeout(() => {
      // Reveal multiple characters at once for faster effect
      const charsToAdd = speed === "fast" ? 3 : speed === "normal" ? 2 : 1;
      setDisplayedLength((prev) => Math.min(prev + charsToAdd, text.length));
    }, charDelay);

    return () => clearTimeout(timeout);
  }, [displayedLength, text.length, isStreaming, charDelay, speed, onComplete]);

  // Reset when text changes
  useEffect(() => {
    if (isStreaming) {
      setDisplayedLength(0);
    } else {
      setDisplayedLength(text.length);
    }
  }, [text, isStreaming]);

  const displayedText = text.slice(0, displayedLength);
  const isComplete = displayedLength >= text.length;

  return (
    <span className={className}>
      {displayedText}
      <AnimatePresence>
        {isStreaming && !isComplete && <InlineGeneratingCursor />}
      </AnimatePresence>
    </span>
  );
}

/**
 * Streaming paragraph with staggered word reveal
 */
interface StreamingParagraphProps {
  text: string;
  isNew?: boolean;
  className?: string;
}

export function StreamingParagraph({
  text,
  isNew = false,
  className = "",
}: StreamingParagraphProps) {
  const words = useMemo(() => text.split(" "), [text]);

  return (
    <motion.p
      initial={isNew ? { opacity: 0 } : { opacity: 1 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={isNew ? { opacity: 0, y: 5 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.15,
            delay: isNew ? index * 0.02 : 0,
          }}
          className="inline"
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.p>
  );
}

/**
 * Streaming bullet list with staggered item reveal
 */
interface StreamingBulletListProps {
  items: string[];
  isNew?: boolean;
  className?: string;
}

export function StreamingBulletList({
  items,
  isNew = false,
  className = "",
}: StreamingBulletListProps) {
  return (
    <ul className={className}>
      {items.map((item, index) => (
        <motion.li
          key={`${item}-${index}`}
          initial={isNew ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.2,
            delay: isNew ? index * 0.1 : 0,
          }}
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}

/**
 * Container for slide content with reveal animation
 */
interface StreamingSlideContentProps {
  children: React.ReactNode;
  slideIndex: number;
  isNewSlide?: boolean;
}

export function StreamingSlideContent({
  children,
  slideIndex,
  isNewSlide = false,
}: StreamingSlideContentProps) {
  return (
    <motion.div
      initial={isNewSlide ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: isNewSlide ? 0.1 : 0,
        ease: [0.175, 0.885, 0.32, 1.275], // Spring easing
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
