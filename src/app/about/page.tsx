/**
 * About Page
 *
 * Company mission, vision, and contact information.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Om oss",
  description:
    "ARTI Slides er bygget for å løse ett problem: AI-presentasjoner som faktisk imponerer. Les om vår misjon og verdier.",
  openGraph: {
    title: "Om oss | ARTI Slides",
    description: "Vi bygger fremtidens presentasjoner. Les om vår misjon og verdier.",
    url: "https://artislides.no/about",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Vi bygger fremtidens presentasjoner
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            ARTI Slides er skapt for å løse ett problem: AI-presentasjoner som faktisk imponerer.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vår misjon</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Vi tror at gode presentasjoner skal være tilgjengelige for alle. Ikke bare de som har
              tid til å bruke timer i PowerPoint, eller budsjett til å hyre designere.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              ARTI Slides er bygget fra bunnen av med én misjon: å gjøre det enkelt å lage
              presentasjoner som engasjerer, overbeviser og inspirerer - på minutter, ikke timer.
            </p>
          </div>
        </section>

        {/* Why we exist */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Hvorfor vi finnes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-emerald-600"
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
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Spar tid</h3>
              <p className="text-gray-600 text-sm">
                Fra idé til ferdig presentasjon på minutter, ikke timer
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Profesjonelt design</h3>
              <p className="text-gray-600 text-sm">
                Premium temaer og layouts som ser bra ut med én gang
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Norsk og trygt</h3>
              <p className="text-gray-600 text-sm">
                Bygget i Norge med fokus på personvern og sikkerhet
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Våre verdier</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Kvalitet over kvantitet</h3>
                <p className="text-gray-600">
                  Vi fokuserer på å gjøre én ting skikkelig bra: AI-genererte presentasjoner som
                  faktisk fungerer.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Brukeren først</h3>
                <p className="text-gray-600">
                  Hver funksjon vi bygger starter med spørsmålet: Hjelper dette brukeren å lage
                  bedre presentasjoner?
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Åpenhet og ærlighet</h3>
                <p className="text-gray-600">
                  Vi er tydelige på hva produktet kan og ikke kan. Ingen skjulte kostnader, ingen
                  villedende markedsføring.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 sm:p-12 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Ta kontakt</h2>
            <p className="text-emerald-100 mb-6">
              Har du spørsmål, tilbakemeldinger eller bare vil si hei?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors"
              >
                Send oss en melding
              </Link>
              <a
                href="mailto:hei@artislides.no"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-400/20 text-white font-semibold hover:bg-emerald-400/30 transition-colors"
              >
                hei@artislides.no
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Tilbake til forsiden
          </Link>
        </div>
      </footer>
    </div>
  );
}
