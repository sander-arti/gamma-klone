/**
 * Generation Animation Utilities
 *
 * Spring-based animations and timing configurations
 * for the slide generation experience.
 */

import type { Transition, Variants } from "framer-motion";

/**
 * Spring presets for different animation types
 */
export const springPresets = {
  // Snappy, responsive animations
  snappy: {
    type: "spring",
    stiffness: 400,
    damping: 30,
  } as const,

  // Smooth, elegant animations
  smooth: {
    type: "spring",
    stiffness: 200,
    damping: 25,
  } as const,

  // Bouncy, playful animations
  bouncy: {
    type: "spring",
    stiffness: 300,
    damping: 20,
    bounce: 0.4,
  } as const,

  // Gentle, subtle animations
  gentle: {
    type: "spring",
    stiffness: 150,
    damping: 20,
  } as const,
} satisfies Record<string, Transition>;

/**
 * Staggered reveal timing for list items
 */
export const staggerConfig = {
  // Fast stagger for short lists
  fast: {
    staggerChildren: 0.05,
    delayChildren: 0.1,
  },

  // Normal stagger for medium lists
  normal: {
    staggerChildren: 0.08,
    delayChildren: 0.15,
  },

  // Slow stagger for emphasis
  slow: {
    staggerChildren: 0.12,
    delayChildren: 0.2,
  },
};

/**
 * Fade in from bottom animation
 * Used for slide content appearing
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springPresets.smooth,
  },
};

/**
 * Fade in from left animation
 * Used for sidebar elements
 */
export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: springPresets.smooth,
  },
};

/**
 * Fade in from right animation
 * Used for panel elements
 */
export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: springPresets.smooth,
  },
};

/**
 * Scale in animation
 * Used for cards and thumbnails
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springPresets.snappy,
  },
};

/**
 * Staggered list container
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: staggerConfig.normal,
  },
};

/**
 * Staggered list item
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springPresets.gentle,
  },
};

/**
 * Skeleton to content transition
 * Used when content loads and replaces skeleton
 */
export const skeletonToContent: Variants = {
  skeleton: {
    opacity: 1,
  },
  content: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

/**
 * Pulse animation for loading states
 */
export const pulseAnimation: Variants = {
  pulse: {
    opacity: [0.4, 0.7, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Shimmer animation for skeleton loading
 */
export const shimmerAnimation = {
  backgroundSize: "200% 100%",
  backgroundPosition: ["-100% 0%", "100% 0%"],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "linear",
  },
};

/**
 * Slide transition for carousel/gallery
 */
export const slideTransition: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: springPresets.smooth,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  }),
};

/**
 * Typewriter effect configuration
 * For streaming text animations
 */
export const typewriterConfig = {
  // Characters per second
  speed: 50,
  // Delay between words (ms)
  wordDelay: 50,
  // Delay before starting (ms)
  startDelay: 100,
};

/**
 * Calculate typewriter animation duration
 */
export function getTypewriterDuration(text: string): number {
  const charCount = text.length;
  const wordCount = text.split(/\s+/).length;
  return (
    typewriterConfig.startDelay +
    (charCount * 1000) / typewriterConfig.speed +
    wordCount * typewriterConfig.wordDelay
  );
}

/**
 * Glow effect for active/generating elements
 */
export const glowAnimation: Variants = {
  idle: {
    boxShadow: "0 0 0 0 rgba(139, 92, 246, 0)",
  },
  active: {
    boxShadow: [
      "0 0 0 0 rgba(139, 92, 246, 0)",
      "0 0 20px 4px rgba(139, 92, 246, 0.3)",
      "0 0 0 0 rgba(139, 92, 246, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Ring animation for focus/attention
 */
export const ringAnimation: Variants = {
  idle: {
    boxShadow: "0 0 0 0 rgba(139, 92, 246, 0)",
  },
  ring: {
    boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.4)",
    transition: springPresets.snappy,
  },
};

/**
 * Counter animation for stats
 */
export const counterAnimation = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      ...springPresets.bouncy,
      delay: 0.1,
    },
  },
};

/**
 * Page transition for navigation
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Accordion/collapse animation
 */
export const collapseAnimation: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.2 },
      opacity: { duration: 0.15 },
    },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.25, delay: 0.1 },
    },
  },
};

/**
 * Tooltip animation
 */
export const tooltipAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

/**
 * Modal/dialog animation
 */
export const modalAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springPresets.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * Backdrop animation for modals
 */
export const backdropAnimation: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};
