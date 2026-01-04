/**
 * Executive Brief Golden Template
 *
 * 5-slide template for status updates, quarterly presentations,
 * and executive summaries.
 *
 * Structure:
 * 1. COVER - Title + date + background image
 * 2. STATS - 3 key metrics horizontal + intro
 * 3. CONTENT - Main message + image (60/40 split)
 * 4. BULLETS - 4-5 key findings
 * 5. CTA - Next steps + contact info
 */

import type { GoldenTemplate } from "./types";

export const executiveBriefTemplate: GoldenTemplate = {
  id: "executive_brief",
  name: "Executive Brief",
  description: "Konsis oppsummering for ledelse og beslutningstakere",
  useCases: [
    "Statusoppdateringer",
    "Kvartalspresentasjoner",
    "Prosjektsammendrag",
    "Styremøter",
  ],
  slideCount: 5,
  defaultTheme: "golden",
  slots: [
    // Slide 1: Cover
    {
      position: 1,
      slideType: "cover",
      layoutVariant: "centered",
      purpose:
        "Fang oppmerksomhet med kraftig tittel og profesjonelt bakgrunnsbilde",
      constraints: {
        titleMaxChars: 60,
        bodyMaxChars: 120,
        requiresImage: true,
        imageAspect: "16:9",
        imageStyle: "professional, corporate, abstract, modern office",
      },
      example: {
        title: "Q4 2024 Statusrapport",
        body: "Strategisk gjennomgang og veien videre",
      },
    },

    // Slide 2: Stats
    {
      position: 2,
      slideType: "stats",
      layoutVariant: "horizontal",
      purpose: "Presenter 3 nøkkeltall som gir umiddelbar innsikt",
      constraints: {
        titleMaxChars: 50,
        bodyMaxChars: 150,
        itemCount: 3, // Exactly 3 stats
        itemMaxChars: 30,
      },
      example: {
        title: "Nøkkeltall",
        body: "Resultater fra siste kvartal viser solid fremgang",
        items: [
          "24% vekst",
          "1.2M brukere",
          "98% tilfredshet",
        ],
      },
    },

    // Slide 3: Content (60/40 split)
    {
      position: 3,
      slideType: "content",
      layoutVariant: "text_left",
      purpose: "Hovedbudskap med støttende visualisering",
      constraints: {
        titleMaxChars: 50,
        bodyMaxChars: 300,
        requiresImage: true,
        imageAspect: "4:3",
        imageStyle: "business illustration, data visualization, teamwork",
      },
      example: {
        title: "Strategisk retning",
        body: "Vi fortsetter å investere i kjerneteknologi samtidig som vi utvider markedsposisjonen. Fokus på bærekraftige løsninger og kundetilfredshet driver alle beslutninger.",
      },
    },

    // Slide 4: Bullets
    {
      position: 4,
      slideType: "bullets",
      layoutVariant: "default",
      purpose: "Oppsummer 4-5 viktige funn eller konklusjoner",
      constraints: {
        titleMaxChars: 50,
        itemCountMin: 4,
        itemCountMax: 5,
        itemMaxChars: 80,
      },
      example: {
        title: "Viktige funn",
        items: [
          "Markedsandelen økte med 3 prosentpoeng",
          "Kundetilfredsheten er på rekordnivå",
          "Nye produkter utgjør 40% av omsetningen",
          "Kostnadene er redusert med 15%",
        ],
      },
    },

    // Slide 5: CTA
    {
      position: 5,
      slideType: "cta",
      layoutVariant: "centered",
      purpose: "Avslutt med klare neste steg og handlingspunkter",
      constraints: {
        titleMaxChars: 40,
        bodyMaxChars: 200,
        itemCountMin: 2,
        itemCountMax: 3,
        itemMaxChars: 60,
      },
      example: {
        title: "Neste steg",
        body: "Vi inviterer til videre dialog og samarbeid",
        items: [
          "Godkjenn strategiplan innen 15. januar",
          "Planlegg oppfølgingsmøte Q1",
        ],
      },
    },
  ],
};
