"use client";

/**
 * Inspector
 *
 * Right panel for editing slide/block properties.
 */

import { useEditor } from "./EditorProvider";
import type { ThemeId } from "@/lib/schemas/deck";

const THEMES: { id: ThemeId; name: string; description: string; gradient: string }[] = [
  {
    id: "nordic_minimalism",
    name: "Nordic Minimalism",
    description: "Moderne AI-estetikk",
    gradient: "linear-gradient(135deg, #0f0f10, #6366f1)",
  },
  {
    id: "nordic_light",
    name: "Nordic Light",
    description: "Lys og minimalistisk",
    gradient: "linear-gradient(135deg, #f8fafc, #64748b)",
  },
  {
    id: "nordic_dark",
    name: "Nordic Dark",
    description: "Mørkt og elegant",
    gradient: "linear-gradient(135deg, #1a1a2e, #16213e)",
  },
  {
    id: "corporate_blue",
    name: "Corporate Blue",
    description: "Profesjonell blå",
    gradient: "linear-gradient(135deg, #e8f0fe, #1a73e8)",
  },
  {
    id: "minimal_warm",
    name: "Minimal Warm",
    description: "Varm og behagelig",
    gradient: "linear-gradient(135deg, #fef7f0, #c7a17a)",
  },
  {
    id: "modern_contrast",
    name: "Modern Contrast",
    description: "Moderne kontrast",
    gradient: "linear-gradient(135deg, #fff, #111)",
  },
];

const SLIDE_TYPES = [
  { id: "cover", name: "Forside" },
  { id: "agenda", name: "Agenda" },
  { id: "section_header", name: "Seksjonstittel" },
  { id: "bullets", name: "Punktliste" },
  { id: "two_column_text", name: "To kolonner" },
  { id: "text_plus_image", name: "Tekst + bilde" },
  { id: "decisions_list", name: "Beslutninger" },
  { id: "action_items_table", name: "Handlinger" },
  { id: "summary_next_steps", name: "Oppsummering" },
  { id: "quote_callout", name: "Sitat" },
];

interface InspectorProps {
  className?: string;
}

export function Inspector({ className = "" }: InspectorProps) {
  const { state, actions } = useEditor();
  const currentSlide = state.deck.slides[state.selectedSlideIndex];

  return (
    <aside className={`bg-[#faf8f5] border-l border-[#e5e2dd] flex flex-col ${className}`}>
      {/* Header - ARTI Premium */}
      <div className="px-4 py-3 border-b border-[#e5e2dd]">
        <h3 className="text-sm font-medium text-gray-600">Egenskaper</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Deck properties */}
        <div className="p-4 border-b border-[#e5e2dd]">
          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Presentasjon
          </h4>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 mb-1.5">Tittel</label>
            <input
              type="text"
              value={state.deck.deck.title}
              onChange={(e) => actions.updateDeckMeta({ title: e.target.value })}
              className="w-full px-3 py-2 text-sm text-gray-800 bg-white border border-[#e5e2dd] rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder:text-gray-400 transition-all"
            />
          </div>

          {/* Theme */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 mb-1.5">Tema</label>
            <select
              value={state.deck.deck.themeId}
              onChange={(e) => actions.updateDeckMeta({ themeId: e.target.value })}
              className="w-full px-3 py-2 text-sm text-gray-800 bg-white border border-[#e5e2dd] rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            >
              {THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme preview - ARTI Premium grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => actions.updateDeckMeta({ themeId: theme.id })}
                className={`
                  aspect-square rounded-lg transition-all duration-200
                  ${
                    state.deck.deck.themeId === theme.id
                      ? "ring-2 ring-emerald-500/70 ring-offset-2 ring-offset-[#faf8f5]"
                      : "ring-1 ring-[#e5e2dd] hover:ring-gray-300"
                  }
                `}
                title={theme.name}
                style={{ background: theme.gradient }}
              />
            ))}
          </div>
        </div>

        {/* Slide properties */}
        {currentSlide && (
          <div className="p-4 border-b border-[#e5e2dd]">
            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Slide {state.selectedSlideIndex + 1}
            </h4>

            {/* Slide type */}
            <div className="mb-4">
              <label className="block text-xs text-gray-600 mb-1.5">Type</label>
              <select
                value={currentSlide.type}
                onChange={(e) =>
                  actions.updateSlide(state.selectedSlideIndex, {
                    type: e.target.value as typeof currentSlide.type,
                  })
                }
                className="w-full px-3 py-2 text-sm text-gray-800 bg-white border border-[#e5e2dd] rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              >
                {SLIDE_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Layout variant */}
            <div className="mb-4">
              <label className="block text-xs text-gray-600 mb-1.5">Layout</label>
              <select
                value={currentSlide.layoutVariant ?? "default"}
                onChange={(e) =>
                  actions.updateSlide(state.selectedSlideIndex, {
                    layoutVariant: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm text-gray-800 bg-white border border-[#e5e2dd] rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              >
                <option value="default">Standard</option>
                <option value="centered">Sentrert</option>
                <option value="left">Venstrejustert</option>
              </select>
            </div>

            {/* Blocks info */}
            <div>
              <label className="block text-xs text-gray-600 mb-1.5">
                Blokker ({currentSlide.blocks.length})
              </label>
              <div className="space-y-1">
                {currentSlide.blocks.map((block, index) => (
                  <div
                    key={index}
                    className="px-2.5 py-1.5 bg-white border border-[#e5e2dd] rounded-md text-xs text-gray-600"
                  >
                    {index + 1}. {block.kind}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick actions - ARTI Premium */}
        <div className="p-4">
          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Hurtighandlinger
          </h4>

          <div className="space-y-1.5">
            <button
              onClick={() => actions.duplicateSlide(state.selectedSlideIndex)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-[#f0ede8] rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Dupliser slide
            </button>

            <button
              onClick={() => {
                if (state.deck.slides.length > 1) {
                  actions.deleteSlide(state.selectedSlideIndex);
                }
              }}
              disabled={state.deck.slides.length <= 1}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500/80 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Slett slide
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
