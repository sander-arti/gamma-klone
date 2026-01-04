/**
 * Pricing Page
 *
 * Displays pricing tiers and feature comparison for ARTI Slides.
 * Premium warm cream design with emerald accents.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Priser og planer",
  description:
    "Velg den planen som passer best for deg. Fra gratis til enterprise - ARTI Slides har en løsning for alle behov.",
  openGraph: {
    title: "Priser og planer | ARTI Slides",
    description:
      "Velg den planen som passer best for deg. Fra gratis til enterprise.",
    url: "https://artislides.no/pricing",
  },
  alternates: {
    canonical: "/pricing",
  },
};
import { PricingCard, FeatureComparison, type PricingTier } from "@/components/pricing";
import { FAQ } from "@/components/landing";

const tiers: PricingTier[] = [
  {
    name: "Gratis",
    price: "0 kr",
    period: "/mnd",
    description: "Perfekt for å prøve ARTI Slides og lage enkle presentasjoner.",
    features: [
      "3 presentasjoner per maned",
      "Grunnleggende slide-typer",
      "2 designtemaer",
      "PDF-eksport",
      "ARTI Slides vannmerke",
    ],
    cta: "Kom i gang gratis",
    ctaHref: "/new",
  },
  {
    name: "Pro",
    price: "199 kr",
    period: "/mnd",
    description: "For profesjonelle som trenger ubegrenset tilgang og premium funksjoner.",
    features: [
      "Ubegrenset antall presentasjoner",
      "Alle 20+ slide-typer",
      "Alle 6 designtemaer",
      "PDF og PPTX-eksport",
      "AI-genererte bilder",
      "Ingen vannmerke",
      "Prioritert support",
    ],
    cta: "Start Pro-abonnement",
    ctaHref: "/new?plan=pro",
    popular: true,
  },
  {
    name: "Team",
    price: "499 kr",
    period: "/mnd",
    description: "For team som vil samarbeide og dele presentasjoner.",
    features: [
      "Alt i Pro",
      "5 teammedlemmer",
      "Delt presentasjonsbibliotek",
      "Brand Kit (logo, farger, fonter)",
      "Team-administrasjon",
      "Prioritert support",
    ],
    cta: "Start Team-abonnement",
    ctaHref: "/new?plan=team",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For store organisasjoner med spesielle behov.",
    features: [
      "Alt i Team",
      "Ubegrenset antall brukere",
      "SSO-integrasjon",
      "API-tilgang",
      "Custom integrasjoner",
      "Dedikert kundesuksess-manager",
      "SLA-garanti",
    ],
    cta: "Kontakt salg",
    ctaHref: "/contact?plan=enterprise",
    enterprise: true,
  },
];

export default function PricingPage() {
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
              <span className="text-xl font-semibold text-gray-900">
                ARTI Slides
              </span>
            </Link>
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/features"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Funksjoner
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-emerald-600"
              >
                Priser
              </Link>
              <Link
                href="/dashboard"
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
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Enkel og transparent prising
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Velg planen som passer for deg. Oppgrader, nedgrader eller avbryt
            nar som helst.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {tiers.map((tier, index) => (
              <PricingCard key={index} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-white/60 border-y border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Sammenlign alle funksjoner
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <FeatureComparison />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-emerald-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Klar til å komme i gang?
          </h2>
          <p className="text-lg text-emerald-100 mb-8">
            Prove gratis i dag - ingen kredittkort nødvendig.
          </p>
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
            Lag din første presentasjon
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
          </Link>
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
              <span className="text-sm font-medium text-gray-400">
                ARTI Slides
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Personvern
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Vilkar
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
