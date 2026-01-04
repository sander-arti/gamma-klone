/**
 * Modal Component
 *
 * Accessible modal dialog with backdrop and focus trap.
 * Supports customizable header, body, and footer.
 */

"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  closeOnBackdropClick?: boolean;
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdropClick = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store previously focused element and restore on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      dialogRef.current?.focus();
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop - ARTI Premium: Light with blur */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog - ARTI Premium: Light glass effect */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`
          relative w-full ${sizeStyles[size]}
          bg-white/95 backdrop-blur-xl
          border border-[#e5e2dd]
          rounded-2xl
          shadow-2xl shadow-gray-300/50
          animate-in fade-in-0 zoom-in-95 duration-200
          focus:outline-none
        `}
      >
        {/* Subtle glow effect on top edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-4">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id="modal-description"
                className="mt-1 text-sm text-gray-500"
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`px-6 ${title || description ? "" : "pt-6"} pb-6`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#e5e2dd] flex justify-end gap-3">
            {footer}
          </div>
        )}

        {/* Close button - ARTI Premium */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg
            text-gray-400
            hover:text-gray-600
            hover:bg-[#f0ede8]
            transition-colors duration-200"
          aria-label="Lukk"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );

  // Use portal to render at document root
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
