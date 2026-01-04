"use client";

/**
 * Landing Page
 *
 * Premium SaaS landing page for ARTI Slides.
 * Features warm cream design, emerald accents, and elegant typography.
 * Comprehensive sections for conversion: Hero, Problem/Solution, Features,
 * How It Works, Use Cases, Testimonials, FAQ, and Final CTA.
 */

import Link from "next/link";
import {
  LandingHero,
  GenerateCard,
  PasteCard,
  ImportCard,
  ProblemSolution,
  HowItWorks,
  FeaturesSection,
  Testimonials,
  UseCases,
  FAQ,
  FinalCTA,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
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
            </div>
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/features"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Funksjoner
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Priser
              </Link>
              <Link
                href="/dashboard"
                className="
                  px-4 py-2 rounded-xl
                  bg-white/80 backdrop-blur-sm
                  border border-gray-200/60
                  text-sm font-medium text-gray-700
                  hover:bg-white hover:border-gray-300 hover:text-gray-900
                  transition-all duration-200
                  shadow-sm
                "
              >
                Mine presentasjoner
              </Link>
            </nav>
            <Link
              href="/dashboard"
              className="
                sm:hidden
                px-4 py-2 rounded-xl
                bg-white/80 backdrop-blur-sm
                border border-gray-200/60
                text-sm font-medium text-gray-700
                hover:bg-white hover:border-gray-300 hover:text-gray-900
                transition-all duration-200
                shadow-sm
              "
            >
              Logg inn
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - New messaging */}
      <LandingHero
        title="AI-presentasjoner som faktisk imponerer"
        subtitle="Sliter du med at AI lager kjedelige, teksttunge slides? ARTI Slides er bygget fra bunnen av for å skape presentasjoner som engasjerer - ikke bare informerer."
      >
        {/* CTA Buttons in Hero */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            href="/new"
            className="
              inline-flex items-center justify-center
              px-6 py-3 rounded-xl
              bg-gradient-to-r from-emerald-500 to-emerald-600
              text-white font-semibold
              shadow-lg shadow-emerald-500/25
              hover:from-emerald-600 hover:to-emerald-700 hover:scale-105
              transition-all duration-200
            "
          >
            Lag din første presentasjon gratis
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
          <Link
            href="#how-it-works"
            className="
              inline-flex items-center justify-center
              px-6 py-3 rounded-xl
              bg-white/80 backdrop-blur-sm
              border border-gray-200
              text-gray-700 font-medium
              hover:bg-white hover:border-gray-300
              transition-all duration-200
            "
          >
            Se hvordan det fungerer
          </Link>
        </div>
      </LandingHero>

      {/* Mode Selection Cards */}
      <section className="relative z-10 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Velg hvordan du vil starte
            </h2>
            <p className="text-gray-600">
              Tre måter å komme i gang på - velg den som passer best for deg.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GenerateCard />
            <PasteCard />
            <ImportCard />
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <ProblemSolution />

      {/* How It Works Section */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Features Section */}
      <FeaturesSection />

      {/* Use Cases Section */}
      <UseCases />

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQ />

      {/* Final CTA Section */}
      <FinalCTA />

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
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
                <span className="text-lg font-semibold text-white">
                  ARTI Slides
                </span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs">
                Norsk AI-presentasjonsplattform. Lag førsteklasses presentasjoner
                på minutter, ikke timer.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Produkt</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/features"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Funksjoner
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Priser
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Dokumentasjon
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Selskap</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Om oss
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Personvern
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Vilkår
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2024 ARTI Slides. Alle rettigheter reservert.
            </p>
            <p className="text-sm text-gray-500">
              Laget med kjærlighet i Norge
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
