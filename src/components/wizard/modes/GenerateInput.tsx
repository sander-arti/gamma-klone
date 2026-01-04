"use client";

/**
 * GenerateInput
 *
 * Focused input for generating presentations from a topic/prompt.
 * Clean, minimal interface - settings are configured in PromptEditor (step 2).
 */

import { useState } from "react";
import { Button } from "@/components/ui";
import type { InputData } from "../InputStep";

interface GenerateInputProps {
  onNext: (data: InputData) => void;
  initialData?: Partial<InputData>;
}

const EXAMPLE_PROMPTS = [
  { text: "Kvartalsrapport Q4 2024", icon: "📊" },
  { text: "Pitch deck for oppstartsbedrift", icon: "🚀" },
  { text: "Onboarding av nye ansatte", icon: "👋" },
  { text: "Produktlansering og markedsstrategi", icon: "📱" },
  { text: "Årsmøte for styret", icon: "👔" },
  { text: "Prosjektplan og milepæler", icon: "📋" },
];

export function GenerateInput({ onNext, initialData }: GenerateInputProps) {
  const [inputText, setInputText] = useState(initialData?.inputText ?? "");

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    onNext({
      inputText,
      textMode: "generate",
      language: "no",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && inputText.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Main input area */}
      <div className="relative">
        {/* Decorative gradient ring */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 rounded-2xl opacity-15 blur-lg" />

        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Input */}
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Hva skal presentasjonen handle om?
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="F.eks: Kvartalsrapport Q4 2024, strategimøte for neste år, produktlansering av ny app..."
              className="
                w-full h-32
                text-lg text-gray-900 placeholder-gray-400
                border-0 focus:ring-0 resize-none
                bg-transparent
              "
              autoFocus
            />
          </div>

          {/* Submit button */}
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <Button
              onClick={handleSubmit}
              disabled={!inputText.trim()}
              className="
                w-full py-3
                bg-gradient-to-r from-emerald-600 to-emerald-700
                hover:from-emerald-700 hover:to-emerald-800
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

      {/* Hint text */}
      <p className="mt-4 text-center text-sm text-gray-500">
        Trykk Enter for å fortsette, eller klikk på knappen
      </p>

      {/* Example prompts */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-500">Eksempler</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt.text}
              type="button"
              onClick={() => setInputText(prompt.text)}
              className="
                group flex items-center gap-2 p-3
                bg-white rounded-xl border border-gray-200
                hover:border-emerald-300 hover:bg-emerald-50
                transition-all duration-200
                text-left
              "
            >
              <span className="text-lg">{prompt.icon}</span>
              <span className="text-sm text-gray-700 group-hover:text-emerald-700">
                {prompt.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
