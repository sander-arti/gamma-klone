/**
 * Product Tour Component for New User Onboarding
 *
 * Features:
 * - Portal rendering (renders above all other content)
 * - Spotlight effect with backdrop blur
 * - Step-by-step progression with dots indicator
 * - Smooth animations via Framer Motion
 * - Responsive positioning (top/right/bottom/left/center)
 */

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TourStep } from "@/lib/onboarding/tour-steps";
import { onboarding } from "@/lib/analytics/events";

type ProductTourProps = {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
};

export function ProductTour({ steps, onComplete, onSkip }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track tour started when component mounts
  useEffect(() => {
    onboarding.tourStarted();
  }, []);

  // Track step viewed when currentStep changes
  useEffect(() => {
    if (step) {
      onboarding.tourStepViewed(step.id, currentStep);
    }
  }, [currentStep, step]);

  // Focus management: save previous focus and restore on unmount
  useEffect(() => {
    // Save currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the dialog when mounted
    if (dialogRef.current) {
      dialogRef.current.focus();
    }

    return () => {
      // Restore focus when tour closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, []);

  // Focus trap: keep focus within dialog
  useEffect(() => {
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: if on first element, wrap to last
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleTabKey);
    return () => window.removeEventListener("keydown", handleTabKey);
  }, []);

  // Update target element rect when step changes
  useEffect(() => {
    if (step.target === "modal") {
      setTargetRect(null);
      return;
    }

    const updateTargetRect = () => {
      const element = document.querySelector(step.target);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        console.warn(`[ProductTour] Target element not found: ${step.target}`);
        setTargetRect(null);
      }
    };

    // Initial update
    updateTargetRect();

    // Debounce resize/scroll handlers (150ms)
    let resizeTimeout: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateTargetRect, 150);
    };

    // Update on resize and scroll (debounced)
    window.addEventListener("resize", debouncedUpdate);
    window.addEventListener("scroll", debouncedUpdate, true);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", debouncedUpdate);
      window.removeEventListener("scroll", debouncedUpdate, true);
    };
  }, [step]);

  // Handle navigation
  const handleNext = useCallback(() => {
    if (isLast) {
      onboarding.tourCompleted(steps.length);
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLast, onComplete, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    onboarding.tourSkipped(currentStep, steps.length);
    onSkip();
  }, [currentStep, steps.length, onSkip]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          handleSkip();
          break;
        case "ArrowRight":
        case "Enter":
          handleNext();
          break;
        case "ArrowLeft":
          handlePrevious();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrevious, handleSkip]);

  // Calculate tooltip position based on target and preferred position (memoized)
  const tooltipStyle = useMemo((): React.CSSProperties => {
    if (!targetRect || step.position === "center") {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const offset = 16;
    const styles: React.CSSProperties = { position: "fixed" };

    switch (step.position) {
      case "right":
        styles.left = targetRect.right + offset;
        styles.top = targetRect.top;
        break;
      case "bottom":
        styles.left = targetRect.left;
        styles.top = targetRect.bottom + offset;
        break;
      case "left":
        styles.right = window.innerWidth - targetRect.left + offset;
        styles.top = targetRect.top;
        break;
      case "top":
        styles.left = targetRect.left;
        styles.bottom = window.innerHeight - targetRect.top + offset;
        break;
    }

    return styles;
  }, [targetRect, step.position]);

  // Don't render on server
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div
        ref={dialogRef}
        className="fixed inset-0 z-[9999]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-description"
        tabIndex={-1}
      >
        {/* Backdrop with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleSkip}
        />

        {/* Spotlight on target element */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute rounded-lg pointer-events-none"
            style={{
              left: targetRect.left - 4,
              top: targetRect.top - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              boxShadow: "0 0 0 4px rgba(139, 92, 246, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.5)",
              zIndex: 9998,
            }}
          />
        )}

        {/* Tooltip card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
          style={tooltipStyle}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h3 id="tour-title" className="text-lg font-semibold text-gray-900 pr-8">
              {step.title}
            </h3>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Lukk tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p id="tour-description" className="text-gray-600 mb-6 leading-relaxed">
            {step.description}
          </p>

          {/* Live region for screen reader announcements */}
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            Steg {currentStep + 1} av {steps.length}: {step.title}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center">
            {/* Progress dots */}
            <div
              className="flex gap-1.5"
              role="progressbar"
              aria-valuenow={currentStep + 1}
              aria-valuemin={1}
              aria-valuemax={steps.length}
            >
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i === currentStep
                      ? "bg-violet-600 w-6"
                      : i < currentStep
                        ? "bg-violet-400"
                        : "bg-gray-300"
                  }`}
                  aria-label={`Step ${i + 1} ${i === currentStep ? "(current)" : i < currentStep ? "(completed)" : "(upcoming)"}`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label={`Gå til forrige steg (${currentStep} av ${steps.length})`}
                >
                  Tilbake
                </button>
              )}
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Hopp over tour og lukk"
              >
                Hopp over
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
                aria-label={
                  isLast
                    ? "Fullfør tour"
                    : `Gå til neste steg (${currentStep + 2} av ${steps.length})`
                }
              >
                {isLast ? "Ferdig" : "Neste"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
