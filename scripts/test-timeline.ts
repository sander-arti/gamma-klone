/**
 * Test script for timeline_roadmap functionality (Phase 7 Sprint 3)
 *
 * Creates a deck with timeline_roadmap slides and exports to PPTX
 * to verify the new slide type renders correctly.
 */

import { renderDeckToPptx } from "@/lib/export/pptx-renderer";
import { writeFileSync } from "fs";
import type { Deck } from "@/lib/schemas/deck";

const testDeck: Deck = {
  deck: {
    title: "Prosjekt Roadmap Demo",
    language: "nb",
    themeId: "nordic_light",
  },
  slides: [
    {
      type: "cover",
      layoutVariant: "centered",
      blocks: [
        { kind: "title", text: "Prosjekt Roadmap Demo" },
        { kind: "text", text: "Testing av timeline_roadmap slide type" },
      ],
    },
    {
      type: "timeline_roadmap",
      layoutVariant: "vertical",
      blocks: [
        { kind: "title", text: "Prosjektfaser 2025" },
        {
          kind: "timeline_step",
          step: 1,
          text: "Q1: Planlegging",
          description: "Definere scope, samle krav, og etablere team",
          status: "completed",
        },
        {
          kind: "timeline_step",
          step: 2,
          text: "Q2: Utvikling",
          description: "Implementere kjernefunksjonalitet og MVP",
          status: "current",
        },
        {
          kind: "timeline_step",
          step: 3,
          text: "Q3: Testing",
          description: "Kvalitetssikring og brukerakseptansetest",
          status: "upcoming",
        },
        {
          kind: "timeline_step",
          step: 4,
          text: "Q4: Lansering",
          description: "Go-live og opplæring av brukere",
          status: "upcoming",
        },
      ],
    },
    {
      type: "timeline_roadmap",
      layoutVariant: "vertical",
      blocks: [
        { kind: "title", text: "Produktutvikling Milepæler" },
        {
          kind: "timeline_step",
          step: 1,
          text: "Alpha Release",
          description: "Intern testing starter",
          status: "completed",
        },
        {
          kind: "timeline_step",
          step: 2,
          text: "Beta Release",
          description: "Begrenset ekstern testing",
          status: "completed",
        },
        {
          kind: "timeline_step",
          step: 3,
          text: "Release Candidate",
          description: "Siste finpussing og bugfixes",
          status: "current",
        },
        {
          kind: "timeline_step",
          step: 4,
          text: "General Availability",
          status: "upcoming",
        },
      ],
    },
    {
      type: "bullets",
      layoutVariant: "default",
      blocks: [
        { kind: "title", text: "Oppsummering" },
        {
          kind: "bullets",
          items: [
            "Timeline slides viser prosjektfremgang visuelt",
            "Status-indikatorer: completed (grønn), current (blå), upcoming (grå)",
            "Støtter tittel og valgfri beskrivelse per steg",
            "Eksporteres korrekt til PPTX",
          ],
        },
      ],
    },
  ],
};

async function main() {
  console.log("Generating PPTX with timeline_roadmap slides...");

  const buffer = await renderDeckToPptx(testDeck, "nordic_light");

  const outputPath = "/tmp/timeline-test.pptx";
  writeFileSync(outputPath, buffer);

  console.log(`PPTX saved to: ${outputPath}`);
  console.log(`File size: ${buffer.length} bytes`);
  console.log("\nTest completed successfully!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
