/**
 * HowItWorks Component
 *
 * Shows the 3-step process for creating presentations with ARTI Slides.
 * Visual step indicators with emerald accents.
 */

"use client";

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Beskriv",
    description:
      "Skriv hva presentasjonen skal handle om. Et emne, noen stikkord, eller lim inn møtenotater.",
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
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  {
    number: 2,
    title: "Generer",
    description:
      "AI-en lager et outline som du kan justere. Godkjenn, og få en komplett presentasjon på sekunder.",
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
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    number: 3,
    title: "Eksporter",
    description:
      "Last ned som PDF for deling, eller redigerbar PowerPoint for videre arbeid. Fungerer alltid.",
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
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-[#faf8f5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Så enkelt er det
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fra idé til ferdig presentasjon på under 2 minutter.
            Ingen designkunnskap nødvendig.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step Card */}
                <div className="text-center">
                  {/* Number Circle */}
                  <div className="relative inline-flex mb-6">
                    <div
                      className="
                        w-16 h-16 rounded-2xl
                        bg-gradient-to-br from-emerald-500 to-emerald-600
                        flex items-center justify-center
                        shadow-lg shadow-emerald-500/25
                        transform transition-transform duration-300 hover:scale-110
                      "
                    >
                      <span className="text-2xl font-bold text-white">
                        {step.number}
                      </span>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-xl -z-10" />
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    {step.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Mobile Arrow */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-6">
                    <svg
                      className="w-6 h-6 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stat */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-50 border border-emerald-200/60">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-emerald-700">
              Gjennomsnittlig tid: 47 sekunder til ferdig presentasjon
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
