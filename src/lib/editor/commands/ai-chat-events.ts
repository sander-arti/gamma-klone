/**
 * AI Chat Events
 *
 * Simple event system to communicate between Command Palette
 * and AIChat component without tight coupling.
 */

import type { TransformationType } from "@/lib/ai/prompts/slide-transform";

// ============================================================================
// Types
// ============================================================================

export interface AIChatEvent {
  /** Type of event */
  type: "open" | "quick-action" | "custom" | "generate-image";
  /** Quick action type (for quick-action events) */
  quickAction?: TransformationType;
  /** Custom instruction (for custom events) */
  instruction?: string;
}

type AIChatEventListener = (event: AIChatEvent) => void;

// ============================================================================
// Event Emitter
// ============================================================================

const listeners = new Set<AIChatEventListener>();

/**
 * Subscribe to AI Chat events
 */
export function onAIChatEvent(listener: AIChatEventListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Emit an AI Chat event
 */
export function emitAIChatEvent(event: AIChatEvent): void {
  listeners.forEach((listener) => listener(event));
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Open AI Chat panel
 */
export function openAIChat(): void {
  emitAIChatEvent({ type: "open" });
}

/**
 * Trigger a quick action in AI Chat
 */
export function triggerQuickAction(action: TransformationType): void {
  emitAIChatEvent({ type: "quick-action", quickAction: action });
}

/**
 * Send a custom instruction to AI Chat
 */
export function sendCustomInstruction(instruction: string): void {
  emitAIChatEvent({ type: "custom", instruction });
}

/**
 * Trigger image generation for current slide
 */
export function triggerImageGeneration(): void {
  emitAIChatEvent({ type: "generate-image" });
}
