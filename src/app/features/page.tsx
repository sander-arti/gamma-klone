/**
 * Features Page
 *
 * Detailed showcase of all ARTI Slides features.
 * Organized by category with visual examples.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Funksjoner",
  description:
    "Utforsk alle funksjonene i ARTI Slides: 20+ slide-typer, premium temaer, AI-bilder, og eksport til PDF og PowerPoint.",
  openGraph: {
    title: "Funksjoner | ARTI Slides",
    description: "20+ slide-typer, premium temaer, AI-bilder, og eksport til PDF og PowerPoint.",
    url: "https://artislides.no/features",
  },
  alternates: {
    canonical: "/features",
  },
};

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const slideTypes: Feature[] = [
  {
    title: "Tittel-slides",
    description: "Imponerende åpningsslides med tittel, undertittel og visuell effekt.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 6h16M4 12h16M4 18h7"
        />
      </svg>
    ),
  },
  {
    title: "Innholdsslides",
    description: "Strukturerte slides med tittel, tekst og bullet points.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    title: "Sammenligning",
    description: "Side-ved-side sammenligning av to alternativer eller konsepter.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
        />
      </svg>
    ),
  },
  {
    title: "Tidslinje",
    description: "Visualiser prosesser, historikk eller fremdrift over tid.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Statistikk",
    description: "Vis tall og metrikker på en visuelt slående måte.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    title: "Sitat",
    description: "Fremhev viktige sitater eller testimonials med stil.",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
      </svg>
    ),
  },
];

const inputModes: Feature[] = [
  {
    title: "Generer fra prompt",
    description: "Beskriv temaet ditt, og AI-en lager en komplett presentasjon.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    title: "Kondenser notater",
    description: "Lim inn lange møtenotater, og AI-en trekker ut det viktigste.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    title: "Importer dokumenter",
    description: "Last opp PDF, Word eller tekstfil og konverter til presentasjon.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
    ),
  },
];

const exportOptions: Feature[] = [
  {
    title: "PDF-eksport",
    description: "Last ned som PDF for deling, utskrift eller arkivering.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "PowerPoint (PPTX)",
    description: "Eksporter til redigerbar PowerPoint for videre arbeid.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
        />
      </svg>
    ),
  },
  {
    title: "Delbar lenke",
    description: "Del presentasjonen med en enkel lenke - ingen nedlasting nødvendig.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
    ),
  },
];

function FeatureCard({ feature, color }: { feature: Feature; color: string }) {
  const colorClasses: Record<string, { bg: string; icon: string }> = {
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600" },
    sky: { bg: "bg-sky-50", icon: "text-sky-600" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600" },
  };
  const colors = colorClasses[color] || colorClasses.emerald;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.icon} flex items-center justify-center mb-4`}
      >
        {feature.icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
      <p className="text-sm text-gray-600">{feature.description}</p>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">ARTI Slides</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-6">
              <Link href="/features" className="text-sm font-medium text-emerald-600">
                Funksjoner
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Priser
              </Link>
              <Link
                href="/new"
                className="
                  px-4 py-2 rounded-xl
                  bg-emerald-600 text-white
                  text-sm font-medium
                  hover:bg-emerald-700
                  transition-all duration-200
                  shadow-sm
                "
              >
                Kom i gang
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 mb-6">
            <span className="text-sm font-medium text-emerald-700">20+ slide-typer</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Alt du trenger for førsteklasses presentasjoner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Spesialbygde funksjoner for å lage presentasjoner som imponerer. Ingen unødvendige
            funksjoner - bare det du faktisk trenger.
          </p>
        </div>
      </section>

      {/* Slide Types */}
      <section className="py-16 bg-white/60 border-y border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Intelligente slide-typer</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Over 20 spesialiserte layouts designet for ulike typer innhold. Ikke bare bullet
              points.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {slideTypes.map((feature, index) => (
              <FeatureCard key={index} feature={feature} color="emerald" />
            ))}
          </div>
          <p className="text-center text-gray-500 mt-8 text-sm">
            + 14 flere slide-typer tilgjengelig
          </p>
        </div>
      </section>

      {/* Input Modes */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fleksibel input</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start fra der du er. Tre måter å komme i gang på.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {inputModes.map((feature, index) => (
              <FeatureCard key={index} feature={feature} color="sky" />
            ))}
          </div>
        </div>
      </section>

      {/* Export Options */}
      <section className="py-16 bg-white/60 border-y border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Eksport som faktisk fungerer</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Last ned i formatet du trenger. PPTX-eksport er fullt redigerbar.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exportOptions.map((feature, index) => (
              <FeatureCard key={index} feature={feature} color="amber" />
            ))}
          </div>
        </div>
      </section>

      {/* AI Images */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200/60 mb-6">
                <span className="text-sm font-medium text-violet-700">Pro-funksjon</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-genererte bilder</h2>
              <p className="text-lg text-gray-600 mb-6">
                Hver slide kan få et unikt, AI-generert bilde som passer innholdet. Ingen
                stockfoto-jakt - bildene lages automatisk.
              </p>
              <ul className="space-y-3">
                {[
                  "Tilpasset hvert slide-tema",
                  "Profesjonell kvalitet",
                  "Konsistent stil gjennom presentasjonen",
                  "Ingen ekstra kostnad med Pro",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-emerald-500"
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
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-violet-100 to-violet-50 rounded-2xl border border-violet-200/60 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-violet-600 font-medium">AI-generert bilde</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-emerald-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Klar til å prøve?</h2>
          <p className="text-lg text-emerald-100 mb-8">
            Lag din første presentasjon gratis på under 2 minutter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/new"
              className="
                inline-flex items-center justify-center
                px-8 py-4 rounded-xl
                bg-white text-emerald-600
                font-semibold text-lg
                shadow-lg shadow-emerald-700/25
                hover:bg-emerald-50 hover:scale-105
                transition-all duration-200
              "
            >
              Kom i gang gratis
            </Link>
            <Link
              href="/pricing"
              className="
                inline-flex items-center justify-center
                px-6 py-4 rounded-xl
                bg-emerald-700/50 backdrop-blur-sm
                border border-white/30
                text-white font-medium
                hover:bg-emerald-700/70
                transition-all duration-200
              "
            >
              Se priser
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-400">ARTI Slides</span>
            </div>
            <p className="text-sm text-gray-500">© 2024 ARTI Slides. Alle rettigheter reservert.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
