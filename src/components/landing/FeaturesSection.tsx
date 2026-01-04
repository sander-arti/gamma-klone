/**
 * FeaturesSection Component
 *
 * Showcases the three main feature categories of ARTI Slides:
 * 1. Intelligent slide types
 * 2. Premium design
 * 3. Flexible input
 *
 * Premium warm cream design with emerald accents.
 */

"use client";

interface Feature {
  title: string;
  description: string;
  highlights: string[];
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
}

const features: Feature[] = [
  {
    title: "Intelligente slide-typer",
    description:
      "Ikke bare bullet points. 20+ spesialiserte layouts designet for ulike typer innhold.",
    highlights: [
      "Tittel og intro-slides",
      "Sammenligningstabeller",
      "Tidslinjer og prosesser",
      "Sitater og testimonials",
      "Team-presentasjoner",
      "Statistikk og tall",
    ],
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
    gradient: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    title: "Premium design",
    description:
      "Profesjonelle temaer designet av nordmenn. Konsistent typografi og fargepalett gjennom hele presentasjonen.",
    highlights: [
      "6 profesjonelle temaer",
      "Automatisk fargeharmoni",
      "Balansert whitespace",
      "Responsivt og skalerbart",
      "Konsistent typografi",
      "Tilpasset brand kit",
    ],
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
    gradient: "from-sky-500 to-sky-600",
    iconBg: "bg-sky-50",
  },
  {
    title: "Fleksibel input",
    description:
      "Start fra der du er. Beskriv et emne, lim inn notater, eller last opp eksisterende dokumenter.",
    highlights: [
      "Generer fra prompt",
      "Kondenser møtenotater",
      "Importer dokumenter",
      "Outline-først tilnærming",
      "Juster før du genererer",
      "Norsk språkforståelse",
    ],
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
    ),
    gradient: "from-amber-500 to-amber-600",
    iconBg: "bg-amber-50",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white/60 border-y border-gray-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Bygget for presentasjoner
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Alt du trenger for å lage presentasjoner som imponerer.
            Ingenting du ikke trenger.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                group relative
                bg-white rounded-2xl p-8
                border border-gray-200/80
                shadow-sm
                transition-all duration-300
                hover:shadow-lg hover:shadow-gray-200/50
                hover:border-gray-300/80
              "
            >
              {/* Icon */}
              <div
                className={`
                  w-14 h-14 rounded-xl mb-6
                  bg-gradient-to-br ${feature.gradient}
                  flex items-center justify-center
                  text-white
                  shadow-lg shadow-${feature.gradient.split("-")[1]}-500/25
                  group-hover:scale-110
                  transition-transform duration-300
                `}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>

              {/* Highlights List */}
              <ul className="space-y-2">
                {feature.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-emerald-500 flex-shrink-0"
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
                    <span className="text-gray-600">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200">
            <svg
              className="w-4 h-4 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-gray-600">PDF-eksport</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200">
            <svg
              className="w-4 h-4 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-gray-600">Redigerbar PPTX</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200">
            <svg
              className="w-4 h-4 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-gray-600">AI-genererte bilder</span>
          </div>
        </div>
      </div>
    </section>
  );
}
