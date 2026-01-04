/**
 * Privacy Policy Page
 *
 * ARTI Slides privacy policy in Norwegian.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Personvernerklæring",
  description:
    "Les om hvordan ARTI Slides samler inn, bruker og beskytter personopplysningene dine.",
  openGraph: {
    title: "Personvernerklæring | ARTI Slides",
    description: "Hvordan vi beskytter personopplysningene dine.",
    url: "https://artislides.no/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Personvernerklæring</h1>
          <p className="text-gray-500 mb-8">Sist oppdatert: 1. januar 2024</p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Introduksjon</h2>
            <p className="text-gray-600 mb-4">
              ARTI Slides ("vi", "oss" eller "vår") er forpliktet til å beskytte personvernet ditt.
              Denne personvernerklæringen forklarer hvordan vi samler inn, bruker og beskytter
              informasjonen din når du bruker vår tjeneste.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              2. Informasjon vi samler inn
            </h2>
            <p className="text-gray-600 mb-4">Vi samler inn følgende typer informasjon:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>
                <strong>Kontoinformasjon:</strong> Navn, e-postadresse og passord når du oppretter
                en konto.
              </li>
              <li>
                <strong>Innhold:</strong> Tekst og data du oppgir for å generere presentasjoner.
              </li>
              <li>
                <strong>Bruksdata:</strong> Informasjon om hvordan du bruker tjenesten, inkludert
                funksjoner du bruker og tid brukt.
              </li>
              <li>
                <strong>Teknisk informasjon:</strong> IP-adresse, nettlesertype og
                enhetsinformasjon.
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              3. Hvordan vi bruker informasjonen
            </h2>
            <p className="text-gray-600 mb-4">Vi bruker informasjonen til å:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Levere og forbedre tjenesten</li>
              <li>Generere presentasjoner basert på dine inndata</li>
              <li>Kommunisere med deg om tjenesten</li>
              <li>Analysere bruksmønstre for å forbedre brukeropplevelsen</li>
              <li>Beskytte mot misbruk og svindel</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              4. Deling av informasjon
            </h2>
            <p className="text-gray-600 mb-4">
              Vi deler ikke personopplysningene dine med tredjeparter, bortsett fra:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Med ditt samtykke</li>
              <li>For å oppfylle juridiske forpliktelser</li>
              <li>
                Med tjenesteleverandorer som hjelper oss å drive tjenesten (under strenge
                databehandleravtaler)
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              5. Datalagring og sikkerhet
            </h2>
            <p className="text-gray-600 mb-4">
              Vi lagrer dataene dine på sikre servere i EU. Vi bruker bransjestandard
              sikkerhetstiltak for å beskytte informasjonen din, inkludert kryptering av data i
              transitt og i hvile.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Dine rettigheter</h2>
            <p className="text-gray-600 mb-4">Du har rett til å:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Få tilgang til dataene dine</li>
              <li>Rette unøyaktige data</li>
              <li>Slette dataene dine</li>
              <li>Eksportere dataene dine</li>
              <li>Trekke tilbake samtykke</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              7. Informasjonskapsler
            </h2>
            <p className="text-gray-600 mb-4">
              Vi bruker nødvendige informasjonskapsler for å få tjenesten til å fungere. Vi bruker
              også analyseinformasjonskapsler for å forstå hvordan tjenesten brukes. Du kan
              administrere informasjonskapsler i nettleserinnstillingene dine.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Kontakt oss</h2>
            <p className="text-gray-600 mb-4">
              Hvis du har spørsmål om denne personvernerklæringen, kan du kontakte oss på:
            </p>
            <p className="text-gray-600">
              E-post:{" "}
              <a href="mailto:privacy@artislides.no" className="text-emerald-600 hover:underline">
                privacy@artislides.no
              </a>
            </p>
          </div>
        </article>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Tilbake til forsiden
          </Link>
        </div>
      </main>
    </div>
  );
}
