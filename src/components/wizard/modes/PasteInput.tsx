"use client";

/**
 * PasteInput
 *
 * Input for creating presentations from pasted text/notes.
 * Supports condense and preserve modes. Theme/length configured in PromptEditor (step 2).
 */

import { useState } from "react";
import { Button } from "@/components/ui";
import type { InputData } from "../InputStep";

interface PasteInputProps {
  onNext: (data: InputData) => void;
  initialData?: Partial<InputData>;
}

const MAX_CHARS = 50000;

const PASTE_MODES = [
  {
    id: "condense" as const,
    title: "Forkort",
    description: "Komprimer teksten til konsise slides",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
  },
  {
    id: "preserve" as const,
    title: "Behold ordlyd",
    description: "Bevar eksisterende punkter og struktur",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export function PasteInput({ onNext, initialData }: PasteInputProps) {
  const [inputText, setInputText] = useState(initialData?.inputText ?? "");
  const [textMode, setTextMode] = useState<"condense" | "preserve">(
    (initialData?.textMode as "condense" | "preserve") ?? "condense"
  );
  const [showSeparatorHint, setShowSeparatorHint] = useState(false);

  const charCount = inputText.length;
  const charPercentage = Math.min((charCount / MAX_CHARS) * 100, 100);
  const isOverLimit = charCount > MAX_CHARS;

  const handleSubmit = () => {
    if (!inputText.trim() || isOverLimit) return;
    onNext({
      inputText,
      textMode,
      language: "no",
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Mode selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hvordan skal teksten behandles?
        </label>
        <div className="grid grid-cols-2 gap-4">
          {PASTE_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setTextMode(mode.id)}
              className={`
                p-4 rounded-xl border-2 text-left transition-all
                ${textMode === mode.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${textMode === mode.id
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-gray-100 text-gray-500"
                  }
                `}>
                  {mode.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{mode.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{mode.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Text input */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 rounded-2xl opacity-10 blur-lg" />

        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Lim inn tekst eller notater
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Lim inn møtenotater, dokumenter, outline, eller annen tekst her..."
              className={`
                w-full h-64
                text-base text-gray-900 placeholder-gray-400
                border-0 focus:ring-0 resize-none
                bg-transparent
                ${isOverLimit ? "text-red-600" : ""}
              `}
              autoFocus
            />
          </div>

          {/* Character counter */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between text-sm">
              <span className={isOverLimit ? "text-red-600 font-medium" : "text-gray-500"}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} tegn
              </span>
              {isOverLimit && (
                <span className="text-red-600">
                  For mye tekst - vennligst forkort
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOverLimit
                    ? "bg-red-500"
                    : charPercentage > 80
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500"
                }`}
                style={{ width: `${charPercentage}%` }}
              />
            </div>

            {/* Separator hint */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowSeparatorHint(!showSeparatorHint)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Tips: Kontroller slide-inndeling</span>
                <svg
                  className={`w-3 h-3 transition-transform ${showSeparatorHint ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showSeparatorHint && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-800 mb-2">
                    Bruk <code className="px-1 py-0.5 bg-blue-100 rounded font-mono">---</code> for å definere hvor en ny slide skal starte:
                  </p>
                  <div className="text-xs text-blue-700 font-mono bg-white p-2 rounded border border-blue-100 space-y-1">
                    <div>Introduksjon til strategien</div>
                    <div className="text-blue-400">---</div>
                    <div>Nøkkelmetrikker fra Q1</div>
                    <div className="text-blue-400">---</div>
                    <div>Neste steg og ansvar</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <Button
              onClick={handleSubmit}
              disabled={!inputText.trim() || isOverLimit}
              className="
                w-full py-3
                bg-gradient-to-r from-blue-600 to-cyan-600
                hover:from-blue-700 hover:to-cyan-700
                disabled:from-gray-400 disabled:to-gray-400
              "
              size="lg"
            >
              Fortsett
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
