"use client";

/**
 * StyleKeywordsInput Component
 *
 * Tag-based input for image style keywords.
 * Includes suggested keywords and custom input.
 */

import { useState, useCallback, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";

// Suggested keywords per category
const SUGGESTED_KEYWORDS = {
  lighting: [
    "cinematisk belysning",
    "naturlig lys",
    "golden hour",
    "studiobelysning",
    "dramatisk lys",
    "soft light",
  ],
  style: [
    "hyperrealistisk",
    "minimalistisk",
    "retro",
    "futuristisk",
    "vintage",
    "moderne",
  ],
  mood: [
    "profesjonell",
    "leken",
    "seriøs",
    "varm",
    "kald",
    "energisk",
  ],
  composition: [
    "symmetrisk",
    "sentrert",
    "close-up",
    "wide shot",
    "bird's eye",
    "rule of thirds",
  ],
};

const ALL_SUGGESTIONS = Object.values(SUGGESTED_KEYWORDS).flat();

interface StyleKeywordsInputProps {
  value: string[];
  onChange: (keywords: string[]) => void;
  maxKeywords?: number;
  disabled?: boolean;
}

export function StyleKeywordsInput({
  value,
  onChange,
  maxKeywords = 10,
  disabled = false,
}: StyleKeywordsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const addKeyword = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim().toLowerCase();
      if (
        trimmed &&
        !value.includes(trimmed) &&
        value.length < maxKeywords
      ) {
        onChange([...value, trimmed]);
        setInputValue("");
      }
    },
    [value, onChange, maxKeywords]
  );

  const removeKeyword = useCallback(
    (keyword: string) => {
      onChange(value.filter((k) => k !== keyword));
    },
    [value, onChange]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeKeyword(value[value.length - 1]);
    }
  };

  // Filter suggestions based on what's not already added
  const availableSuggestions = ALL_SUGGESTIONS.filter(
    (s) => !value.includes(s.toLowerCase())
  ).slice(0, 6);

  return (
    <div className="space-y-3">
      {/* Input area with tags */}
      <div
        className={`
          min-h-[80px] p-3 rounded-lg border-2 transition-all
          ${isFocused
            ? "border-emerald-400 ring-2 ring-emerald-100"
            : "border-gray-200"
          }
          ${disabled ? "bg-gray-50 opacity-50" : "bg-white"}
        `}
      >
        <div className="flex flex-wrap gap-2">
          {/* Existing keywords */}
          <AnimatePresence>
            {value.map((keyword) => (
              <motion.span
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
              >
                {keyword}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="p-0.5 hover:bg-emerald-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Input */}
          {value.length < maxKeywords && !disabled && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                if (inputValue.trim()) {
                  addKeyword(inputValue);
                }
              }}
              placeholder={value.length === 0 ? "Skriv nøkkelord..." : ""}
              className="flex-1 min-w-[120px] px-1 py-1 text-sm bg-transparent focus:outline-none"
            />
          )}
        </div>
      </div>

      {/* Suggestions */}
      {!disabled && availableSuggestions.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Foreslåtte nøkkelord:</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addKeyword(suggestion)}
                disabled={value.length >= maxKeywords}
                className={`
                  inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs
                  border border-gray-200 text-gray-600
                  hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50
                  transition-colors
                  ${value.length >= maxKeywords ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <Plus className="w-3 h-3" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Counter */}
      <p className="text-xs text-gray-400 text-right">
        {value.length}/{maxKeywords} nøkkelord
      </p>
    </div>
  );
}
