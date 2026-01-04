"use client";

/**
 * AIChat Component
 *
 * Floating panel for AI-powered slide transformations.
 * Gamma-style interface with:
 * - Custom instruction input
 * - Quick action buttons
 * - Streaming feedback
 * - Chat history
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  MessageSquare,
  Globe,
  BarChart3,
  Loader2,
  Check,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useAIChat, type AIChatMessage, type AIChatStatus } from "./useAIChat";
import type { Slide } from "@/lib/schemas/slide";
import type { SlideTransformResult } from "@/lib/ai/slide-agent";
import type { TransformationType } from "@/lib/ai/prompts/slide-transform";

// ============================================================================
// Types
// ============================================================================

/** Pending action from command palette */
export interface PendingAction {
  type: "quick-action" | "custom" | "generate-image";
  quickAction?: TransformationType;
  instruction?: string;
}

export interface AIChatProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback to close the panel */
  onClose: () => void;
  /** Current slide to transform */
  slide: Slide | null;
  /** Current slide index in the deck */
  slideIndex: number;
  /** Deck ID for API calls */
  deckId: string;
  /** Callback when transformation completes */
  onTransformComplete?: (result: SlideTransformResult) => void;
  /** Deck title for context */
  deckTitle?: string;
  /** Pending action from command palette */
  pendingAction?: PendingAction | null;
  /** Callback when pending action is consumed */
  onPendingActionConsumed?: () => void;
}

// ============================================================================
// Quick Actions
// ============================================================================

interface QuickAction {
  id: TransformationType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "simplify",
    label: "Forenkle",
    icon: <Minimize2 className="w-4 h-4" />,
    description: "Gjør kortere og enklere",
  },
  {
    id: "expand",
    label: "Utvid",
    icon: <Maximize2 className="w-4 h-4" />,
    description: "Legg til mer detaljer",
  },
  {
    id: "professional",
    label: "Profesjonell",
    icon: <MessageSquare className="w-4 h-4" />,
    description: "Formelt språk",
  },
  {
    id: "visualize",
    label: "Visuell",
    icon: <BarChart3 className="w-4 h-4" />,
    description: "Mer punkter og tall",
  },
  {
    id: "translate_en",
    label: "Engelsk",
    icon: <Globe className="w-4 h-4" />,
    description: "Oversett til engelsk",
  },
];

// ============================================================================
// Subcomponents
// ============================================================================

function StatusIndicator({ status }: { status: AIChatStatus }) {
  switch (status) {
    case "loading":
    case "streaming":
      return (
        <div className="flex items-center gap-2 text-emerald-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            {status === "loading" ? "Behandler..." : "Skriver..."}
          </span>
        </div>
      );
    case "success":
      return (
        <div className="flex items-center gap-2 text-emerald-600">
          <Check className="w-4 h-4" />
          <span className="text-sm">Fullført</span>
        </div>
      );
    case "error":
      return (
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Feil oppstod</span>
        </div>
      );
    default:
      return null;
  }
}

function ChatMessage({ message }: { message: AIChatMessage }) {
  const isUser = message.type === "user";
  const isError = message.type === "error";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
          isUser
            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
            : isError
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-[#f5f3f0] text-gray-700"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {message.result?.changes && message.result.changes.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-xs opacity-70">
              {message.result.changes.length} endring
              {message.result.changes.length !== 1 ? "er" : ""} gjort
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StreamingPreview({
  partialResult,
}: {
  partialResult: Partial<SlideTransformResult> | null;
}) {
  if (!partialResult) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700">AI skriver...</span>
      </div>
      {partialResult.explanation && (
        <p className="text-sm text-emerald-600/80">{partialResult.explanation}</p>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AIChat({
  isOpen,
  onClose,
  slide,
  slideIndex,
  deckId,
  onTransformComplete,
  deckTitle,
  pendingAction,
  onPendingActionConsumed,
}: AIChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingActionProcessedRef = useRef(false);

  const {
    status,
    messages,
    input,
    setInput,
    submit,
    applyQuickAction,
    generateImage,
    partialResult,
    error,
    clearHistory,
  } = useAIChat({
    slide,
    slideIndex,
    deckId,
    onTransformComplete,
    deckTitle,
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partialResult]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle pending action from command palette
  useEffect(() => {
    // Only process if panel is open, we have a pending action, slide exists, and we haven't processed it yet
    if (isOpen && pendingAction && slide && !pendingActionProcessedRef.current) {
      pendingActionProcessedRef.current = true;

      // Small delay to ensure UI is ready
      setTimeout(() => {
        if (pendingAction.type === "quick-action" && pendingAction.quickAction) {
          applyQuickAction(pendingAction.quickAction);
        } else if (pendingAction.type === "custom" && pendingAction.instruction) {
          // For custom instructions, set the input and submit
          setInput(pendingAction.instruction);
          // Need to submit after input is set
          setTimeout(() => {
            submit();
          }, 50);
        } else if (pendingAction.type === "generate-image") {
          // Trigger actual image generation via DALL-E/Gemini
          generateImage();
        }

        // Notify parent that action was consumed
        onPendingActionConsumed?.();
      }, 100);
    }

    // Reset the processed flag when pending action changes to null
    if (!pendingAction) {
      pendingActionProcessedRef.current = false;
    }
  }, [isOpen, pendingAction, slide, applyQuickAction, setInput, submit, generateImage, onPendingActionConsumed]);

  // Handle key events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit]
  );

  // Handle quick action click
  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      applyQuickAction(action.id);
    },
    [applyQuickAction]
  );

  if (!isOpen) return null;

  const isProcessing = status === "loading" || status === "streaming";
  const hasNoSlide = !slide;

  const content = (
    <div
      className="fixed right-4 top-20 bottom-4 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-300/50 border border-[#e5e2dd] flex flex-col z-40 animate-in slide-in-from-right-5 duration-200"
      role="dialog"
      aria-label="AI-assistent"
    >
      {/* Header - ARTI Premium */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e2dd]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-gray-800">AI-assistent</span>
        </div>
        <div className="flex items-center gap-0.5">
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-1.5 hover:bg-[#f0ede8] rounded-lg transition-colors"
              title="Tøm historikk"
            >
              <Trash2 className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#f0ede8] rounded-lg transition-colors"
            title="Lukk"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* No slide warning - ARTI Premium */}
      {hasNoSlide && (
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
          <p className="text-sm text-amber-700">
            Velg en slide for å bruke AI-assistenten.
          </p>
        </div>
      )}

      {/* Quick Actions - ARTI Premium */}
      <div className="px-4 py-3 border-b border-[#e5e2dd]">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2.5">
          Hurtigvalg
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              disabled={isProcessing || hasNoSlide}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-[#f5f3f0] border border-[#e5e2dd] hover:border-[#d5d2cd] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs text-gray-600 hover:text-gray-800 transition-all duration-200"
              title={action.description}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages - ARTI Premium */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && !partialResult && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Skriv en instruksjon for å transformere sliden
            </p>
            <p className="text-xs text-gray-400">
              F.eks. "Legg til tre fordeler" eller "Gjør kortere"
            </p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        <StreamingPreview partialResult={partialResult} />

        <div ref={messagesEndRef} />
      </div>

      {/* Status - ARTI Premium */}
      {status !== "idle" && (
        <div className="px-4 py-2 border-t border-[#e5e2dd]">
          <StatusIndicator status={status} />
        </div>
      )}

      {/* Input - ARTI Premium */}
      <div className="px-4 py-3 border-t border-[#e5e2dd] bg-[#faf8f5] rounded-b-2xl">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv instruksjon..."
            disabled={isProcessing || hasNoSlide}
            rows={1}
            className="flex-1 px-3 py-2 bg-white border border-[#e5e2dd] rounded-lg text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ minHeight: "38px", maxHeight: "100px" }}
          />
          <button
            onClick={submit}
            disabled={!input.trim() || isProcessing || hasNoSlide}
            className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg shadow-lg shadow-emerald-500/20 transition-all duration-200"
            title="Send"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Enter for å sende, Shift+Enter for ny linje
        </p>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
