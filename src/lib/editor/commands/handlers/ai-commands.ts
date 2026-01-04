/**
 * AI Commands
 *
 * Commands for AI-powered slide transformations.
 * Uses event system to communicate with AIChat component.
 */

import { Sparkles, Minimize2, Maximize2, RefreshCw, Image, Languages, Wand2 } from "lucide-react";
import type { CommandDefinition } from "../types";
import {
  openAIChat,
  triggerQuickAction,
  sendCustomInstruction,
  triggerImageGeneration,
} from "../ai-chat-events";

/**
 * Simplify content command
 */
export const simplifyCommand: CommandDefinition = {
  id: "ai.simplify",
  label: "Forenkle innhold",
  description: "Gjør teksten kortere og mer konsis",
  icon: Minimize2,
  category: "ai",
  when: (ctx) => ctx.currentSlide !== null,
  execute: async () => {
    triggerQuickAction("simplify");
  },
};

/**
 * Expand content command
 */
export const expandCommand: CommandDefinition = {
  id: "ai.expand",
  label: "Utvid innhold",
  description: "Legg til mer detaljer og kontekst",
  icon: Maximize2,
  category: "ai",
  when: (ctx) => ctx.currentSlide !== null,
  execute: async () => {
    triggerQuickAction("expand");
  },
};

/**
 * Rewrite content command
 */
export const rewriteCommand: CommandDefinition = {
  id: "ai.rewrite",
  label: "Skriv om",
  description: "Skriv om innholdet med ny formulering",
  icon: RefreshCw,
  category: "ai",
  when: (ctx) => ctx.currentSlide !== null,
  execute: async () => {
    // Open AI Chat for custom rewrite instruction
    sendCustomInstruction("Skriv om innholdet med ny formulering");
  },
};

/**
 * Generate new image command
 */
export const generateImageCommand: CommandDefinition = {
  id: "ai.generate-image",
  label: "Generer nytt bilde",
  description: "Lag et nytt AI-generert bilde for sliden",
  icon: Image,
  category: "ai",
  when: (ctx) => {
    // Only show when slide has an image block
    if (!ctx.currentSlide) return false;
    return ctx.currentSlide.blocks.some((b) => b.kind === "image");
  },
  execute: async () => {
    // Trigger actual image generation via DALL-E/Gemini
    triggerImageGeneration();
  },
};

/**
 * Translate command
 */
export const translateCommand: CommandDefinition = {
  id: "ai.translate",
  label: "Oversett til engelsk",
  description: "Oversett innholdet til engelsk",
  icon: Languages,
  category: "ai",
  when: (ctx) => ctx.currentSlide !== null,
  execute: async () => {
    triggerQuickAction("translate_en");
  },
};

/**
 * Make more visual command
 */
export const makeVisualCommand: CommandDefinition = {
  id: "ai.make-visual",
  label: "Mer visuell",
  description: "Konverter tekst til bullet points eller statistikk",
  icon: Sparkles,
  category: "ai",
  when: (ctx) => ctx.currentSlide !== null,
  execute: async () => {
    triggerQuickAction("visualize");
  },
};

/**
 * Open AI Chat command
 */
export const openAIChatCommand: CommandDefinition = {
  id: "ai.chat",
  label: "Åpne AI-assistent",
  description: "Endre sliden med naturlig språk",
  icon: Wand2,
  category: "ai",
  when: (ctx) => ctx.currentSlide !== null,
  execute: async () => {
    openAIChat();
  },
};

/**
 * All AI commands
 */
export const aiCommands: CommandDefinition[] = [
  simplifyCommand,
  expandCommand,
  rewriteCommand,
  generateImageCommand,
  translateCommand,
  makeVisualCommand,
  openAIChatCommand,
];
