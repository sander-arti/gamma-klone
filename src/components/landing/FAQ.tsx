/**
 * FAQ Component
 *
 * Frequently asked questions with expandable answers.
 * Accordion-style interaction with smooth animations.
 */

"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Hvordan skiller ARTI Slides seg fra ChatGPT?",
    answer:
      "ChatGPT er en generell AI som kan litt om alt. ARTI Slides er bygget fra bunnen av for én ting: presentasjoner. Vi har 20+ spesialiserte slide-typer, profesjonelle designtemaer, og eksport som faktisk fungerer. ChatGPT gir deg tekst - vi gir deg ferdige presentasjoner.",
  },
  {
    question: "Kan jeg redigere presentasjonene etterpå?",
    answer:
      "Absolutt! Du kan redigere direkte i ARTI Slides, eller eksportere til redigerbar PowerPoint (PPTX) og fortsette i Microsoft PowerPoint eller Google Slides. Alt innhold er fullt redigerbart.",
  },
  {
    question: "Hvilke formater kan jeg eksportere til?",
    answer:
      "Du kan eksportere til PDF for deling og utskrift, eller til PPTX (PowerPoint) for videre redigering. PPTX-eksporten vår er designet for å beholde all formatering og være fullt redigerbar - noe mange andre AI-verktøy sliter med.",
  },
  {
    question: "Er dataene mine trygge?",
    answer:
      "Ja. Vi lagrer ikke innholdet ditt lenger enn nødvendig for å generere presentasjonen. Vi deler aldri data med tredjeparter, og all kommunikasjon er kryptert. Du kan slette presentasjonene dine når som helst.",
  },
  {
    question: "Fungerer det på norsk?",
    answer:
      "ARTI Slides er utviklet i Norge og forstår norsk kontekst og språk. AI-en vår er trent på å generere naturlig norsk tekst, og brukergrensesnittet er på norsk. Vi støtter også engelsk og andre språk.",
  },
  {
    question: "Hva koster det?",
    answer:
      "Vi har en gratis plan der du kan lage 3 presentasjoner per måned. Pro-planen til 199 kr/mnd gir ubegrenset tilgang, alle temaer, AI-genererte bilder, og full eksportfunksjonalitet. For team har vi egne planer med delt bibliotek og brand kit.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-[#faf8f5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ofte stilte spørsmål
          </h2>
          <p className="text-lg text-gray-600">
            Har du flere spørsmål? Ta kontakt på support@artislides.no
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="
                bg-white rounded-xl
                border border-gray-200/80
                overflow-hidden
                transition-all duration-200
                hover:border-gray-300/80
              "
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="
                  w-full px-6 py-5
                  flex items-center justify-between
                  text-left
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-inset
                "
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <span
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-full
                    bg-emerald-50 text-emerald-600
                    flex items-center justify-center
                    transition-transform duration-200
                    ${openIndex === index ? "rotate-180" : ""}
                  `}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>

              {/* Answer */}
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${openIndex === index ? "max-h-96" : "max-h-0"}
                `}
              >
                <div className="px-6 pb-5 pt-0">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
