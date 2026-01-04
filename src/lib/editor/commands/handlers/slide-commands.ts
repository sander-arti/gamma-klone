/**
 * Slide Commands
 *
 * Commands for slide management: add, change type, change theme.
 */

import {
  Plus,
  LayoutGrid,
  Palette,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { CommandDefinition } from "../types";

/**
 * Add slide command
 */
export const addSlideCommand: CommandDefinition = {
  id: "slide.add",
  label: "Legg til slide",
  description: "Legg til en ny slide",
  icon: Plus,
  category: "slide",
  execute: async (_ctx) => {
    // TODO: Open slide type selector modal
    console.log("[Slide] Open add slide modal");
  },
};

/**
 * Change slide type command
 */
export const changeSlideTypeCommand: CommandDefinition = {
  id: "slide.change-type",
  label: "Endre slide-type",
  description: "Endre layout for valgt slide",
  icon: LayoutGrid,
  category: "slide",
  when: (ctx) => ctx.currentSlide !== null,
  execute: async (_ctx) => {
    // TODO: Open slide type selector for current slide
    console.log("[Slide] Open change type modal");
  },
};

/**
 * Change theme command
 */
export const changeThemeCommand: CommandDefinition = {
  id: "slide.change-theme",
  label: "Endre tema",
  description: "Endre presentasjonens tema",
  icon: Palette,
  category: "slide",
  execute: async (_ctx) => {
    // TODO: Open theme selector modal
    console.log("[Slide] Open theme selector");
  },
};

/**
 * Move slide up command
 */
export const moveSlideUpCommand: CommandDefinition = {
  id: "slide.move-up",
  label: "Flytt slide opp",
  description: "Flytt valgt slide én posisjon opp",
  icon: ChevronUp,
  category: "slide",
  when: (ctx) => ctx.currentSlide !== null && ctx.selectedSlideIndex > 0,
  execute: (ctx) => {
    ctx.actions.reorderSlides(ctx.selectedSlideIndex, ctx.selectedSlideIndex - 1);
  },
};

/**
 * Move slide down command
 */
export const moveSlideDownCommand: CommandDefinition = {
  id: "slide.move-down",
  label: "Flytt slide ned",
  description: "Flytt valgt slide én posisjon ned",
  icon: ChevronDown,
  category: "slide",
  when: (ctx) =>
    ctx.currentSlide !== null &&
    ctx.selectedSlideIndex < ctx.state.deck.slides.length - 1,
  execute: (ctx) => {
    ctx.actions.reorderSlides(ctx.selectedSlideIndex, ctx.selectedSlideIndex + 1);
  },
};

/**
 * Navigate to previous slide command
 */
export const navigatePrevSlideCommand: CommandDefinition = {
  id: "slide.navigate-prev",
  label: "Forrige slide",
  description: "Gå til forrige slide",
  icon: ArrowUp,
  shortcut: "↑",
  category: "slide",
  when: (ctx) => ctx.selectedSlideIndex > 0,
  execute: (ctx) => {
    ctx.actions.selectSlide(ctx.selectedSlideIndex - 1);
  },
};

/**
 * Navigate to next slide command
 */
export const navigateNextSlideCommand: CommandDefinition = {
  id: "slide.navigate-next",
  label: "Neste slide",
  description: "Gå til neste slide",
  icon: ArrowDown,
  shortcut: "↓",
  category: "slide",
  when: (ctx) => ctx.selectedSlideIndex < ctx.state.deck.slides.length - 1,
  execute: (ctx) => {
    ctx.actions.selectSlide(ctx.selectedSlideIndex + 1);
  },
};

/**
 * All slide commands
 */
export const slideCommands: CommandDefinition[] = [
  addSlideCommand,
  changeSlideTypeCommand,
  changeThemeCommand,
  moveSlideUpCommand,
  moveSlideDownCommand,
  navigatePrevSlideCommand,
  navigateNextSlideCommand,
];
