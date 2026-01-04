/**
 * Preview Page
 *
 * Visual verification page for testing all slide types and themes.
 * Allows switching between themes and viewing example slides.
 */

"use client";

import { useState } from "react";
import type { Deck } from "@/lib/schemas/deck";
import type { ThemeId } from "@/lib/themes";
import { DeckViewer } from "@/components/viewer";

// Example deck with all 10 slide types
const exampleDeck: Deck = {
  deck: {
    title: "ARTI Decks Demo Presentasjon",
    language: "no",
    themeId: "nordic_light",
  },
  slides: [
    // 1. Cover slide
    {
      type: "cover",
      layoutVariant: "centered",
      blocks: [
        { kind: "title", text: "ARTI Decks" },
        { kind: "text", text: "Norsk AI-presentasjonsplattform" },
      ],
    },
    // 2. Agenda slide
    {
      type: "agenda",
      layoutVariant: "numbered",
      blocks: [
        { kind: "title", text: "Agenda" },
        {
          kind: "bullets",
          items: [
            "Introduksjon til plattformen",
            "Hovedfunksjoner",
            "Teknisk arkitektur",
            "Demo av temaer",
            "Neste steg",
          ],
        },
      ],
    },
    // 3. Section header slide
    {
      type: "section_header",
      layoutVariant: "large",
      blocks: [
        { kind: "title", text: "Del 1" },
        { kind: "text", text: "Introduksjon" },
      ],
    },
    // 4. Bullets slide
    {
      type: "bullets",
      layoutVariant: "default",
      blocks: [
        { kind: "title", text: "Hovedfunksjoner" },
        {
          kind: "bullets",
          items: [
            "AI-genererte presentasjoner fra tekst eller notater",
            "Profesjonelle temaer med premium design",
            "Eksport til PDF og redigerbar PPTX",
            "API-first arkitektur for integrasjoner",
            "Norsk språkstøtte og lokalisering",
          ],
        },
      ],
    },
    // 5. Two column text slide
    {
      type: "two_column_text",
      layoutVariant: "equal",
      blocks: [
        { kind: "title", text: "Sammenligning" },
        {
          kind: "text",
          text: "Tradisjonelle verktøy krever manuelt arbeid med design, layout og formatering. Dette tar ofte flere timer.",
        },
        {
          kind: "text",
          text: "ARTI Decks genererer profesjonelle presentasjoner automatisk på sekunder med AI-drevet innholdsproduksjon.",
        },
      ],
    },
    // 6. Text plus image slide
    {
      type: "text_plus_image",
      layoutVariant: "image_right",
      blocks: [
        { kind: "title", text: "Sømløs arbeidsflyt" },
        {
          kind: "text",
          text: "Last opp møtenotater eller skriv en kort beskrivelse, og la AI-en gjøre resten. Vår outline-first tilnærming sikrer at strukturen er riktig før innholdet genereres.",
        },
        {
          kind: "image",
          url: "https://placehold.co/800x600/1e40af/ffffff?text=Workflow",
          alt: "Workflow illustration",
          cropMode: "cover",
        },
      ],
    },
    // 7. Decisions list slide
    {
      type: "decisions_list",
      layoutVariant: "numbered",
      blocks: [
        { kind: "title", text: "Viktige beslutninger" },
        {
          kind: "bullets",
          items: [
            "Next.js 14+ som fullstack-rammeverk",
            "PostgreSQL for persistent lagring",
            "Redis/BullMQ for asynkron jobbhåndtering",
            "Playwright for PDF-rendering",
            "PptxGenJS for PPTX-eksport",
          ],
        },
      ],
    },
    // 8. Action items table slide
    {
      type: "action_items_table",
      layoutVariant: "default",
      blocks: [
        { kind: "title", text: "Handlingspunkter" },
        {
          kind: "table",
          columns: ["Oppgave", "Ansvarlig", "Frist"],
          rows: [
            ["Ferdigstille API-dokumentasjon", "Backend-team", "Uke 2"],
            ["Implementere eksport-moduler", "Frontend-team", "Uke 3"],
            ["Sette opp CI/CD pipeline", "DevOps", "Uke 2"],
            ["Bruker-testing", "QA-team", "Uke 4"],
          ],
        },
      ],
    },
    // 9. Summary next steps slide
    {
      type: "summary_next_steps",
      layoutVariant: "timeline",
      blocks: [
        { kind: "title", text: "Neste steg" },
        {
          kind: "bullets",
          items: [
            "Ferdigstille MVP med alle slide-typer",
            "Implementere PDF og PPTX eksport",
            "Bygge webapp UI for brukere",
            "Beta-testing med utvalgte kunder",
            "Produksjonslansering",
          ],
        },
      ],
    },
    // 10. Quote callout slide
    {
      type: "quote_callout",
      layoutVariant: "centered",
      blocks: [
        {
          kind: "callout",
          text: "God design er ikke bare hvordan det ser ut, men hvordan det fungerer.",
          style: "quote",
        },
        { kind: "text", text: "Steve Jobs" },
      ],
    },
  ],
};

const themes: { id: ThemeId; name: string }[] = [
  { id: "nordic_light", name: "Nordic Light" },
  { id: "nordic_dark", name: "Nordic Dark" },
  { id: "corporate_blue", name: "Corporate Blue" },
  { id: "minimal_warm", name: "Minimal Warm" },
  { id: "modern_contrast", name: "Modern Contrast" },
];

export default function PreviewPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("nordic_light");
  const [useBrandKit, setUseBrandKit] = useState(false);

  const brandKit = useBrandKit
    ? { primaryColor: "#059669", secondaryColor: "#f59e0b" }
    : undefined;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-white text-lg font-semibold">
            ARTI Decks — Preview
          </h1>

          <div className="flex items-center gap-4">
            {/* Theme selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="theme" className="text-gray-300 text-sm">
                Tema:
              </label>
              <select
                id="theme"
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value as ThemeId)}
                className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand kit toggle */}
            <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={useBrandKit}
                onChange={(e) => setUseBrandKit(e.target.checked)}
                className="rounded"
              />
              Brand Kit Override
            </label>
          </div>
        </div>
      </header>

      {/* Deck viewer */}
      <main className="flex-1 min-h-0">
        <DeckViewer
          deck={exampleDeck}
          themeId={selectedTheme}
          brandKit={brandKit}
          showThumbnails={true}
          showNavigation={true}
          className="h-full"
        />
      </main>
    </div>
  );
}
