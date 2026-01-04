/**
 * UseCases Component
 *
 * Shows different target audiences and how they use ARTI Slides.
 * Visual cards with icons and descriptions.
 */

"use client";

interface UseCase {
  title: string;
  description: string;
  examples: string[];
  icon: React.ReactNode;
  color: string;
}

const useCases: UseCase[] = [
  {
    title: "Konsulenter",
    description: "Imponerende presentasjoner til kunder uten å bruke hele natten.",
    examples: [
      "Statusrapporter",
      "Prosjektoppdateringer",
      "Strategidokumenter",
    ],
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    color: "emerald",
  },
  {
    title: "Salgsteam",
    description: "Pitch decks og produktpresentasjoner som overbeviser.",
    examples: [
      "Pitch decks",
      "Produktdemoer",
      "Kundeforslag",
    ],
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
    color: "sky",
  },
  {
    title: "Ledere",
    description: "Profesjonelle presentasjoner til styre og ledergruppe.",
    examples: [
      "Styremøtepresentasjoner",
      "Kvartalsrapporter",
      "All-hands møter",
    ],
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    color: "violet",
  },
  {
    title: "Markedsforere",
    description: "Kampanjepresentasjoner og strategidokumenter på minutter.",
    examples: [
      "Kampanjeplaner",
      "Markedsstrategier",
      "Agenturpresentasjoner",
    ],
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
        />
      </svg>
    ),
    color: "amber",
  },
];

const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
  emerald: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    border: "border-emerald-200/60",
  },
  sky: {
    bg: "bg-sky-50",
    icon: "text-sky-600",
    border: "border-sky-200/60",
  },
  violet: {
    bg: "bg-violet-50",
    icon: "text-violet-600",
    border: "border-violet-200/60",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    border: "border-amber-200/60",
  },
};

export function UseCases() {
  return (
    <section className="py-20 bg-white/60 border-y border-gray-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            For profesjonelle som trenger resultater
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Uansett rolle - ARTI Slides hjelper deg å kommunisere mer effektivt.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => {
            const colors = colorClasses[useCase.color];
            return (
              <div
                key={index}
                className="
                  bg-white rounded-2xl p-6
                  border border-gray-200/80
                  shadow-sm
                  transition-all duration-300
                  hover:shadow-md
                  hover:border-gray-300/80
                "
              >
                {/* Icon */}
                <div
                  className={`
                    w-12 h-12 rounded-xl mb-4
                    ${colors.bg} ${colors.icon}
                    flex items-center justify-center
                  `}
                >
                  {useCase.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {useCase.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {useCase.description}
                </p>

                {/* Examples */}
                <div className="space-y-1.5">
                  {useCase.examples.map((example, idx) => (
                    <div
                      key={idx}
                      className={`
                        text-xs px-2.5 py-1 rounded-lg
                        ${colors.bg} ${colors.border} border
                        text-gray-700
                      `}
                    >
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
