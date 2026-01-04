/**
 * Test script for stat_block functionality
 *
 * Creates a deck with stat blocks and exports to PPTX to verify
 * that the new block type renders correctly.
 */

import { renderDeckToPptx } from "@/lib/export/pptx-renderer";
import { writeFileSync } from "fs";
import type { Deck } from "@/lib/schemas/deck";

const testDeck: Deck = {
  deck: {
    title: "Statistikk Demo",
    language: "nb",
    themeId: "nordic_light",
  },
  slides: [
    {
      type: "cover",
      layoutVariant: "centered",
      blocks: [
        { kind: "title", text: "Statistikk Demo" },
        { kind: "text", text: "Testing av stat_block" },
      ],
    },
    {
      type: "bullets",
      layoutVariant: "left",
      blocks: [
        { kind: "title", text: "Nøkkeltall for Q4 2024" },
        {
          kind: "stat_block",
          value: "95%",
          label: "Kundetilfredshet",
          sublabel: "Opp fra 87% i 2023",
        },
        {
          kind: "stat_block",
          value: "180",
          label: "Ansatte",
          sublabel: "20% vekst siste år",
        },
        {
          kind: "stat_block",
          value: "12.4M",
          label: "Omsetning (NOK)",
          sublabel: "Beste kvartal noensinne",
        },
        {
          kind: "bullets",
          items: [
            "Sterk vekst i alle segmenter",
            "Ekspansjon til nye markeder",
            "Investering i teknologi",
          ],
        },
      ],
    },
    {
      type: "bullets",
      layoutVariant: "left",
      blocks: [
        { kind: "title", text: "Enkeltstående Statistikk" },
        {
          kind: "stat_block",
          value: "42",
          label: "Svaret på alt",
        },
      ],
    },
  ],
};

async function main() {
  console.log("Generating PPTX with stat_blocks...");

  const buffer = await renderDeckToPptx(testDeck, "nordic_light");

  const outputPath = "/tmp/stat-blocks-test.pptx";
  writeFileSync(outputPath, buffer);

  console.log(`PPTX saved to: ${outputPath}`);
  console.log(`File size: ${buffer.length} bytes`);
  console.log("\nTest completed successfully!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
