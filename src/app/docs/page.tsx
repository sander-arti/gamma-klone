/**
 * Documentation / Help Page
 *
 * Getting started guide, FAQ, and support links.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hjelp og dokumentasjon",
  description:
    "Alt du trenger for å komme i gang med ARTI Slides. Steg-for-steg guide, FAQ, og kontaktinformasjon.",
  openGraph: {
    title: "Hjelp og dokumentasjon | ARTI Slides",
    description:
      "Steg-for-steg guide, FAQ, og kontaktinformasjon for ARTI Slides.",
    url: "https://artislides.no/docs",
  },
  alternates: {
    canonical: "/docs",
  },
};

const gettingStartedSteps = [
  {
    step: 1,
    title: "Opprett en konto",
    description:
      "Registrer deg gratis med e-post eller logg inn med Google/Microsoft. Du trenger ikke kredittkort for å komme i gang.",
  },
  {
    step: 2,
    title: "Beskriv presentasjonen din",
    description:
      "Fortell oss hva presentasjonen skal handle om. Du kan skrive en kort beskrivelse, lime inn møtenotater, eller laste opp et dokument.",
  },
  {
    step: 3,
    title: "Velg tema og stil",
    description:
      "Velg blant våre profesjonelle temaer. Hver mal er optimalisert for lesbarhet og visuell appell.",
  },
  {
    step: 4,
    title: "Generer og rediger",
    description:
      "AI-en lager først en outline du kan justere. Når du er fornøyd, genereres hele presentasjonen. Du kan redigere alt etterpå.",
  },
  {
    step: 5,
    title: "Eksporter og presenter",
    description:
      "Last ned som PDF for deling eller redigerbar PowerPoint for videre tilpasning. Klar til bruk!",
  },
];

const faqs = [
  {
    question: "Hvordan skiller ARTI Slides seg fra ChatGPT?",
    answer:
      "ChatGPT er en generell AI som prøver å gjøre alt. ARTI Slides er bygget fra bunnen av kun for presentasjoner - med spesialiserte slide-typer, profesjonelle temaer, og eksport som faktisk fungerer. Resultatet er presentasjoner som ser profesjonelle ut med én gang.",
  },
  {
    question: "Kan jeg redigere presentasjonene etterpå?",
    answer:
      "Ja! Du kan redigere alt i vår editor - tekst, layout, rekkefølge på slides. Og når du eksporterer til PowerPoint, er filen fullt redigerbar i Microsoft PowerPoint.",
  },
  {
    question: "Hvilke formater kan jeg eksportere til?",
    answer:
      "Du kan eksportere til PDF (perfekt for deling og arkivering) og PowerPoint/PPTX (for videre redigering). Begge formatene bevarer design og layout.",
  },
  {
    question: "Fungerer det på norsk?",
    answer:
      "Ja! ARTI Slides er bygget for det norske markedet og fungerer utmerket på norsk. AI-en forstår norsk kontekst og genererer naturlig norsk tekst.",
  },
  {
    question: "Er dataene mine trygge?",
    answer:
      "Absolutt. Vi lagrer data på sikre servere i EU, bruker kryptering, og deler aldri innholdet ditt med tredjeparter. Se vår personvernerklæring for detaljer.",
  },
  {
    question: "Hva er forskjellen på planene?",
    answer:
      "Gratis-planen gir deg 3 presentasjoner per måned med standard temaer. Pro gir ubegrenset tilgang, alle temaer, og AI-genererte bilder. Team legger til samarbeidsfunksjoner og delt bibliotek.",
  },
  {
    question: "Kan jeg prøve før jeg betaler?",
    answer:
      "Ja! Gratis-planen lar deg lage 3 presentasjoner per måned uten å oppgi betalingsinformasjon. Perfekt for å teste om ARTI Slides passer for deg.",
  },
  {
    question: "Hvordan avslutter jeg abonnementet?",
    answer:
      "Du kan når som helst avslutte abonnementet fra kontoinnstillingene. Abonnementet forblir aktivt ut perioden du har betalt for.",
  },
];

export default function DocsPage() {
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
            <span className="text-xl font-semibold text-gray-900">
              ARTI Slides
            </span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-gray-200/60 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Hjelp og dokumentasjon
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Alt du trenger for å komme i gang med ARTI Slides og få mest mulig
            ut av plattformen.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <Link
            href="#kom-i-gang"
            className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Kom i gang</h3>
            <p className="text-sm text-gray-600 mt-1">Steg-for-steg guide</p>
          </Link>

          <Link
            href="#faq"
            className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">FAQ</h3>
            <p className="text-sm text-gray-600 mt-1">Vanlige spørsmål</p>
          </Link>

          <Link
            href="/contact"
            className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
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
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Kontakt support</h3>
            <p className="text-sm text-gray-600 mt-1">Vi hjelper deg</p>
          </Link>
        </div>

        {/* Getting started */}
        <section id="kom-i-gang" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Kom i gang</h2>
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            {gettingStartedSteps.map((item, index) => (
              <div
                key={item.step}
                className={`p-6 ${
                  index !== gettingStartedSteps.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm">
                      {item.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/new"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
            >
              Lag din første presentasjon
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Ofte stilte spørsmål
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white rounded-xl border border-gray-200/80 shadow-sm"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Still need help */}
        <section className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Finner du ikke svaret?</h2>
          <p className="text-emerald-100 mb-6 max-w-lg mx-auto">
            Vårt supportteam er klare til å hjelpe deg. Send oss en melding, så
            svarer vi så raskt vi kan.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors"
          >
            Kontakt support
          </Link>
        </section>

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Tilbake til forsiden
          </Link>
        </div>
      </main>
    </div>
  );
}
