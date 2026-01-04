"use client";

/**
 * AdditionalInstructions Component
 *
 * Right panel in Prompt Editor for extra AI instructions.
 * Includes helpful tips and character count.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Sparkles, AlertCircle } from "lucide-react";

const MAX_CHARS = 1000;

// Contextual tips based on content
const TIPS = [
  {
    icon: Sparkles,
    title: "Vær spesifikk",
    description: "Beskriv nøyaktig hva du ønsker, f.eks. 'Fokuser på ROI og kostnadssparing'",
  },
  {
    icon: Lightbulb,
    title: "Definer målgruppe",
    description: "F.eks. 'For tekniske ledere' eller 'For nye ansatte'",
  },
  {
    icon: AlertCircle,
    title: "Angi begrensninger",
    description: "F.eks. 'Unngå teknisk sjargong' eller 'Maks 5 bullets per slide'",
  },
];

// Example prompts for inspiration
const EXAMPLES = [
  "Legg vekt på bærekraft og miljøhensyn",
  "Inkluder konkrete tall og statistikk der mulig",
  "Hold tonen uformell og engasjerende",
  "Fokuser på praktiske handlingspunkter",
  "Bruk norske eksempler der mulig",
];

interface AdditionalInstructionsProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AdditionalInstructions({
  value,
  onChange,
  disabled = false,
}: AdditionalInstructionsProps) {
  const [isFocused, setIsFocused] = useState(false);
  const charCount = value.length;
  const isNearLimit = charCount > MAX_CHARS * 0.8;
  const isOverLimit = charCount > MAX_CHARS;

  const handleExampleClick = (example: string) => {
    if (disabled) return;
    // Append to existing value with newline if not empty
    const newValue = value ? `${value}\n${example}` : example;
    if (newValue.length <= MAX_CHARS) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">
          Tilleggsinstruksjoner
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Gi AI ekstra veiledning for presentasjonen
        </p>
      </div>

      {/* Textarea */}
      <div>
        <div
          className={`
            relative rounded-lg border-2 transition-all
            ${isFocused
              ? "border-emerald-400 ring-2 ring-emerald-100"
              : "border-gray-200"
            }
            ${disabled ? "bg-gray-50" : "bg-white"}
          `}
        >
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder="F.eks: 'Fokuser på praktiske eksempler og hold språket enkelt...'"
            className={`
              w-full h-32 p-3 text-sm resize-none rounded-lg
              placeholder:text-gray-400
              focus:outline-none
              ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-transparent"}
            `}
            maxLength={MAX_CHARS}
          />

          {/* Character count */}
          <div className="absolute bottom-2 right-2">
            <span
              className={`
                text-xs font-mono
                ${isOverLimit
                  ? "text-red-500"
                  : isNearLimit
                  ? "text-amber-500"
                  : "text-gray-400"
                }
              `}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Quick examples */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Klikk for å legge til:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.slice(0, 3).map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                disabled={disabled || isOverLimit}
                className={`
                  px-2.5 py-1 text-xs rounded-full border transition-all
                  ${disabled
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600 cursor-pointer"
                  }
                `}
              >
                + {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tips section */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-700 mb-3">Tips</p>
        <div className="space-y-3">
          {TIPS.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-2"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {tip.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tip.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
