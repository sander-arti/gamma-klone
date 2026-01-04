/**
 * Terms of Service Page
 *
 * ARTI Slides terms of service in Norwegian.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brukervilkår",
  description: "Les brukervilkårene for ARTI Slides. Vilkårene gjelder for all bruk av tjenesten.",
  openGraph: {
    title: "Brukervilkår | ARTI Slides",
    description: "Brukervilkår for ARTI Slides-tjenesten.",
    url: "https://artislides.no/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Brukervilkår</h1>
          <p className="text-gray-500 mb-8">Sist oppdatert: 1. januar 2024</p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Aksept av vilkår</h2>
            <p className="text-gray-600 mb-4">
              Ved å bruke ARTI Slides ("Tjenesten") godtar du disse brukervilkårene. Hvis du ikke
              godtar vilkårene, må du ikke bruke Tjenesten.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              2. Beskrivelse av tjenesten
            </h2>
            <p className="text-gray-600 mb-4">
              ARTI Slides er en AI-drevet tjeneste for å generere presentasjoner. Tjenesten lar deg
              opprette, redigere og eksportere presentasjoner basert på tekst og instruksjoner du
              oppgir.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Brukerkontoer</h2>
            <p className="text-gray-600 mb-4">
              For å bruke visse funksjoner i Tjenesten må du opprette en konto. Du er ansvarlig for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Å oppgi nøyaktig informasjon ved registrering</li>
              <li>Å holde passordet ditt konfidensielt</li>
              <li>All aktivitet som skjer under din konto</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Akseptabel bruk</h2>
            <p className="text-gray-600 mb-4">Du samtykker i å ikke:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Bruke Tjenesten til ulovlige formål</li>
              <li>Laste opp innhold som er skadevoldende, truende eller krenkende</li>
              <li>Forsøke å få uautorisert tilgang til systemene våre</li>
              <li>Bruke Tjenesten på en måte som kan skade andre brukere</li>
              <li>Bryte immaterielle rettigheter</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              5. Innhold og eierskap
            </h2>
            <p className="text-gray-600 mb-4">
              Du beholder alle rettigheter til innholdet du oppretter med Tjenesten. Ved å bruke
              Tjenesten gir du oss en begrenset lisens til å behandle innholdet ditt for å levere
              Tjenesten.
            </p>
            <p className="text-gray-600 mb-4">
              ARTI Slides og tilhørende varemerker, logoer og tjenestemerker tilhører oss og er
              beskyttet av opphavsrett og varemerkelovgivning.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              6. Betaling og abonnement
            </h2>
            <p className="text-gray-600 mb-4">
              Enkelte funksjoner krever betalt abonnement. Ved å abonnere godtar du:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Å betale gjeldende avgifter</li>
              <li>At abonnementet fornyes automatisk med mindre du sier opp</li>
              <li>At priser kan endres med 30 dagers varsel</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              7. Ansvarsfraskrivelse
            </h2>
            <p className="text-gray-600 mb-4">
              Tjenesten leveres "som den er" uten garantier av noe slag. Vi garanterer ikke at
              Tjenesten vil være uavbrutt, sikker eller feilfri.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Ansvarsbegrensning</h2>
            <p className="text-gray-600 mb-4">
              Vi er ikke ansvarlige for indirekte, tilfeldige eller følgetap som følge av din bruk
              av Tjenesten. Vårt samlede ansvar er begrenset til beløpet du har betalt for Tjenesten
              de siste 12 månedene.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Oppsigelse</h2>
            <p className="text-gray-600 mb-4">
              Vi kan suspendere eller avslutte tilgangen din til Tjenesten hvis du bryter disse
              vilkårene. Ved oppsigelse vil rettighetene dine under disse vilkårene umiddelbart
              opphøre.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              10. Endringer i vilkårene
            </h2>
            <p className="text-gray-600 mb-4">
              Vi kan oppdatere disse vilkårene fra tid til annen. Vi vil varsle deg om vesentlige
              endringer via e-post eller i Tjenesten. Fortsatt bruk av Tjenesten etter endringer
              utgjør aksept av de oppdaterte vilkårene.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Gjeldende lov</h2>
            <p className="text-gray-600 mb-4">
              Disse vilkårene er underlagt norsk lov. Eventuelle tvister skal løses ved Oslo
              tingrett.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Kontakt</h2>
            <p className="text-gray-600 mb-4">
              Hvis du har spørsmål om disse vilkårene, kan du kontakte oss på:
            </p>
            <p className="text-gray-600">
              E-post:{" "}
              <a href="mailto:support@artislides.no" className="text-emerald-600 hover:underline">
                support@artislides.no
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
