"use client";

/**
 * TemplateSelector Component
 *
 * Allows users to select a Golden Template for pixel-perfect generation.
 * When a template is selected, the outline step is skipped and
 * the AI generates content directly into the fixed template structure.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutTemplate,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  BarChart3,
  Target,
  Check,
} from "lucide-react";
import { getTemplateOptions, type GoldenTemplateId } from "@/lib/templates";

const TEMPLATE_ICONS: Record<GoldenTemplateId, typeof FileText> = {
  executive_brief: BarChart3,
  feature_showcase: Sparkles,
  project_update: Target,
};

const TEMPLATE_DESCRIPTIONS: Record<GoldenTemplateId, string> = {
  executive_brief: "5 slides: Cover, Stats, Content, Bullets, CTA",
  feature_showcase: "6 slides: Cover, Icons, Split, Timeline, Specs, CTA",
  project_update: "5 slides: Cover, Timeline, Decisions, Actions, Next",
};

interface TemplateSelectorProps {
  /** Currently selected template (null = dynamic mode) */
  selectedTemplate: GoldenTemplateId | null;
  /** Called when selection changes */
  onChange: (templateId: GoldenTemplateId | null) => void;
  /** Disabled state */
  disabled?: boolean;
}

export function TemplateSelector({
  selectedTemplate,
  onChange,
  disabled = false,
}: TemplateSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(selectedTemplate !== null);
  const templates = getTemplateOptions();

  const handleTemplateSelect = (templateId: GoldenTemplateId | null) => {
    onChange(templateId);
    if (templateId === null) {
      setIsExpanded(false);
    }
  };

  return (
    <section className="space-y-3">
      {/* Header with toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full py-2 text-sm font-medium
          text-gray-700 hover:text-gray-900 transition-colors
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-emerald-500" />
          <span>Golden Template</span>
          {selectedTemplate && (
            <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
              Aktiv
            </span>
          )}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-1">
              {/* Dynamic mode option */}
              <button
                type="button"
                onClick={() => handleTemplateSelect(null)}
                disabled={disabled}
                className={`
                  w-full p-3 rounded-xl border-2 text-left transition-all
                  ${selectedTemplate === null
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${selectedTemplate === null ? "bg-emerald-100" : "bg-gray-100"}
                  `}>
                    <Sparkles className={`w-4 h-4 ${selectedTemplate === null ? "text-emerald-600" : "text-gray-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${selectedTemplate === null ? "text-emerald-900" : "text-gray-900"}`}>
                        Dynamisk (Standard)
                      </span>
                      {selectedTemplate === null && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      AI velger optimal struktur basert på innholdet
                    </p>
                  </div>
                </div>
              </button>

              {/* Template options */}
              {templates.map((template) => {
                const Icon = TEMPLATE_ICONS[template.id];
                const isSelected = selectedTemplate === template.id;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template.id)}
                    disabled={disabled}
                    className={`
                      w-full p-3 rounded-xl border-2 text-left transition-all
                      ${isSelected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }
                      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                        ${isSelected ? "bg-emerald-100" : "bg-gray-100"}
                      `}>
                        <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-600" : "text-gray-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${isSelected ? "text-emerald-900" : "text-gray-900"}`}>
                            {template.name}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {template.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {TEMPLATE_DESCRIPTIONS[template.id]}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Info text */}
              <p className="text-xs text-gray-400 pt-2 px-1">
                Golden Templates har fast struktur. AI fyller kun innhold - gir premium kvalitet.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
