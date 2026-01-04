"use client";

/**
 * GeneratingIndicator Component
 *
 * Small pill badge with sparkle icon that pulses during generation.
 * Used to indicate which slide is currently being generated.
 */

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface GeneratingIndicatorProps {
  label?: string;
  size?: "sm" | "md";
}

export function GeneratingIndicator({
  label = "Genererer...",
  size = "md",
}: GeneratingIndicatorProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`
        inline-flex items-center rounded-full
        bg-gradient-to-r from-emerald-500 to-emerald-600
        text-white font-medium shadow-lg shadow-emerald-500/25
        ${sizeClasses[size]}
      `}
    >
      {/* Pulsing sparkle */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles className={iconSizes[size]} />
      </motion.div>

      {/* Label with fade animation */}
      <motion.span
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {label}
      </motion.span>

      {/* Trailing dots animation */}
      <span className="flex gap-0.5 ml-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-1 h-1 rounded-full bg-white"
          />
        ))}
      </span>
    </motion.div>
  );
}

/**
 * Inline generating indicator for use within text blocks
 */
export function InlineGeneratingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
      className="inline-block w-0.5 h-5 bg-emerald-500 ml-0.5 align-middle"
    />
  );
}
