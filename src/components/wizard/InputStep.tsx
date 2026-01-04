"use client";

/**
 * InputStep
 *
 * First step in the wizard - enter text/topic for the presentation.
 */

import { useState } from "react";
import { Button } from "@/components/ui";

interface InputStepProps {
  onNext: (data: InputData) => void;
  initialData?: Partial<InputData>;
}

export interface InputData {
  inputText: string;
  textMode: "generate" | "condense" | "preserve";
  language: string;
  /** Optional - set in PromptEditor (step 2) */
  themeId?: string;
  /** Optional - set in PromptEditor (step 2) */
  amount?: "brief" | "medium" | "detailed";
}

const TEXT_MODES = [
  {
    id: "generate" as const,
    title: "Generer fra emne",
    description: "Skriv inn et emne eller tema, så genererer AI-en innholdet",
    placeholder: "F.eks: Kvartalsrapport Q4 2024, strategimøte, produktlansering...",
  },
  {
    id: "condense" as const,
    title: "Kondenser notater",
    description: "Lim inn møtenotater eller tekst, så komprimeres det til slides",
    placeholder: "Lim inn dine møtenotater her...",
  },
  {
    id: "preserve" as const,
    title: "Bevar struktur",
    description: "Behold eksisterende punkter og beslutninger fra teksten",
    placeholder: "Lim inn tekst med eksisterende struktur...",
  },
];

const THEMES = [
  { id: "nordic_light", name: "Nordic Light" },
  { id: "nordic_dark", name: "Nordic Dark" },
  { id: "corporate_blue", name: "Corporate Blue" },
  { id: "minimal_warm", name: "Minimal Warm" },
  { id: "modern_contrast", name: "Modern Contrast" },
];

const AMOUNTS = [
  { id: "brief" as const, name: "Kort", slides: "5-8 slides" },
  { id: "medium" as const, name: "Medium", slides: "10-15 slides" },
  { id: "detailed" as const, name: "Detaljert", slides: "15-25 slides" },
];

export function InputStep({ onNext, initialData }: InputStepProps) {
  const [inputText, setInputText] = useState(initialData?.inputText ?? "");
  const [textMode, setTextMode] = useState<InputData["textMode"]>(
    initialData?.textMode ?? "generate"
  );
  const [language] = useState(initialData?.language ?? "no");
  const [themeId, setThemeId] = useState(initialData?.themeId ?? "nordic_light");
  const [amount, setAmount] = useState<InputData["amount"]>(
    initialData?.amount ?? "medium"
  );

  const selectedMode = TEXT_MODES.find((m) => m.id === textMode)!;

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    onNext({ inputText, textMode, language, themeId, amount });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Text mode selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hvordan vil du lage presentasjonen?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TEXT_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setTextMode(mode.id)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                textMode === mode.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h3 className="font-medium text-gray-900">{mode.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{mode.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input text */}
      <div>
        <label
          htmlFor="inputText"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {textMode === "generate" ? "Emne eller tema" : "Din tekst"}
        </label>
        <textarea
          id="inputText"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={selectedMode.placeholder}
          className="w-full h-48 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <p className="mt-2 text-sm text-gray-500">
          {inputText.length.toLocaleString()} tegn
        </p>
      </div>

      {/* Options row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tema
          </label>
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {THEMES.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lengde
          </label>
          <div className="flex gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAmount(a.id)}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  amount === a.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium text-sm">{a.name}</div>
                <div className="text-xs text-gray-500">{a.slides}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!inputText.trim()}
          className="px-8"
        >
          Neste: Se outline
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
