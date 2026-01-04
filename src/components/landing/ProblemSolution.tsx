/**
 * ProblemSolution Component
 *
 * Highlights the pain points of using generic AI tools for presentations
 * and shows how ARTI Slides solves each problem.
 * Side-by-side comparison layout with warm cream design.
 */

"use client";

interface ProblemItem {
  problem: string;
  solution: string;
}

const problems: ProblemItem[] = [
  {
    problem: "ChatGPT gir meg vegg-av-tekst slides",
    solution: "Visuelt hierarki med balansert innhold",
  },
  {
    problem: "Ma redesigne alt manuelt etterpå",
    solution: "Klart for presentasjon med en gang",
  },
  {
    problem: "Ingen støtte for bilder eller grafikk",
    solution: "AI-genererte bilder som passer innholdet",
  },
  {
    problem: "Export til PowerPoint er odelagt",
    solution: "Redigerbar PPTX som faktisk fungerer",
  },
];

export function ProblemSolution() {
  return (
    <section className="py-20 bg-white/60 border-y border-gray-200/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200/60 mb-6">
            <span className="text-sm font-medium text-red-700">
              Kjenner du deg igjen?
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Generell AI lager darlige presentasjoner
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ChatGPT og andre verktøy er gode på mye, men presentasjoner?
            Ikke sa mye. ARTI Slides er bygget for en ting: presentasjoner som imponerer.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Problem Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Problemet</h3>
            </div>

            {problems.map((item, index) => (
              <div
                key={index}
                className="
                  p-4 rounded-xl
                  bg-red-50/50 border border-red-200/40
                  transition-all duration-200
                "
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-red-600">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    "{item.problem}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Solution Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                ARTI Slides
              </h3>
            </div>

            {problems.map((item, index) => (
              <div
                key={index}
                className="
                  p-4 rounded-xl
                  bg-emerald-50/50 border border-emerald-200/40
                  transition-all duration-200
                "
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {item.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Designet av nordmenn, for nordmenn. Forstar norsk kontekst og sprak.
          </p>
        </div>
      </div>
    </section>
  );
}
