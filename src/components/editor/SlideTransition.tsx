"use client";

/**
 * SlideTransition Component
 *
 * Wraps slide content with smooth Framer Motion transitions
 * when navigating between slides in the editor.
 */

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useState, useEffect, useRef } from "react";

interface SlideTransitionProps {
  /** Current slide index - used as key for AnimatePresence */
  slideIndex: number;
  /** The slide content to render */
  children: ReactNode;
  /** Transition type */
  transition?: "slide" | "fade" | "scale" | "slideUp";
}

// Variant configurations for different transition types
const variants = {
  slide: {
    initial: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.98,
    }),
  },
  fade: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  },
  scale: {
    initial: {
      opacity: 0,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 1.05,
    },
  },
  slideUp: {
    initial: {
      y: 30,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
    },
    exit: {
      y: -30,
      opacity: 0,
    },
  },
};

// Spring configuration for smooth, natural motion
const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
};

// Tween configuration for simpler transitions
const tweenTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1] as const, // CSS ease-out equivalent
};

export function SlideTransition({
  slideIndex,
  children,
  transition = "fade",
}: SlideTransitionProps) {
  const prevIndexRef = useRef(slideIndex);
  const [direction, setDirection] = useState(0);

  // Calculate direction based on index change
  useEffect(() => {
    const dir = slideIndex > prevIndexRef.current ? 1 : -1;
    setDirection(dir);
    prevIndexRef.current = slideIndex;
  }, [slideIndex]);

  const currentVariants = variants[transition];
  const transitionConfig = transition === "slide" ? springTransition : tweenTransition;

  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={slideIndex}
        custom={direction}
        variants={currentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transitionConfig}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default SlideTransition;
