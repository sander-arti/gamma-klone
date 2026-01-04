/**
 * Test Script for Sprint 4: Cards and New Slide Types
 *
 * Verifies:
 * - icon_card and numbered_card blocks render correctly
 * - numbered_grid, icon_cards_with_image, summary_with_stats slides work
 * - PPTX export generates valid files
 */

import { renderSlidesToPptx } from "@/lib/export/pptx-renderer";
import { writeFileSync } from "fs";
import type { Slide } from "@/lib/schemas/slide";

const testSlides: Slide[] = [
  // Slide 1: Cover
  {
    type: "cover",
    layoutVariant: "default",
    blocks: [
      { kind: "title", text: "Sprint 4: Cards Test" },
      { kind: "text", text: "Testing icon_card, numbered_card, and new slide types" },
    ],
  },

  // Slide 2: Numbered Grid (2x2)
  {
    type: "numbered_grid",
    layoutVariant: "2x2",
    blocks: [
      { kind: "title", text: "Our Core Principles" },
      { kind: "numbered_card", number: 1, text: "Customer First", description: "Every decision starts with customer impact" },
      { kind: "numbered_card", number: 2, text: "Move Fast", description: "Ship early, iterate often" },
      { kind: "numbered_card", number: 3, text: "Stay Lean", description: "Maximize value, minimize waste" },
      { kind: "numbered_card", number: 4, text: "Be Bold", description: "Take calculated risks for growth" },
    ],
  },

  // Slide 3: Numbered Grid (3x1)
  {
    type: "numbered_grid",
    layoutVariant: "3x1",
    blocks: [
      { kind: "title", text: "Three Simple Steps" },
      { kind: "numbered_card", number: 1, text: "Plan", description: "Define your goals and strategy" },
      { kind: "numbered_card", number: 2, text: "Execute", description: "Implement with focus and speed" },
      { kind: "numbered_card", number: 3, text: "Review", description: "Measure results and improve" },
    ],
  },

  // Slide 4: Icon Cards with Image
  {
    type: "icon_cards_with_image",
    layoutVariant: "cards_left",
    blocks: [
      { kind: "title", text: "Platform Features" },
      { kind: "icon_card", icon: "zap", text: "Lightning Fast", description: "Sub-100ms response times", bgColor: "blue" },
      { kind: "icon_card", icon: "shield", text: "Enterprise Security", description: "SOC2 certified", bgColor: "green" },
      { kind: "icon_card", icon: "globe", text: "Global Scale", description: "20+ data centers worldwide", bgColor: "purple" },
    ],
  },

  // Slide 5: Icon Cards (no image, row layout)
  {
    type: "icon_cards_with_image",
    layoutVariant: "cards_top",
    blocks: [
      { kind: "title", text: "Why Choose Us?" },
      { kind: "icon_card", icon: "heart", text: "Customer Love", description: "98% satisfaction rate", bgColor: "pink" },
      { kind: "icon_card", icon: "clock", text: "Always On", description: "99.9% uptime guarantee", bgColor: "cyan" },
      { kind: "icon_card", icon: "rocket", text: "Fast Growth", description: "3x year-over-year growth", bgColor: "orange" },
    ],
  },

  // Slide 6: Summary with Stats
  {
    type: "summary_with_stats",
    layoutVariant: "stats_bottom",
    blocks: [
      { kind: "title", text: "2024 Results Summary" },
      { kind: "text", text: "We exceeded all key targets this year with record growth across all segments. Our team delivered exceptional results while maintaining our commitment to quality and customer satisfaction." },
      { kind: "stat_block", value: "127%", label: "Revenue Growth", sublabel: "YoY" },
      { kind: "stat_block", value: "4.8M", label: "Active Users", sublabel: "+52% from 2023" },
      { kind: "stat_block", value: "98.5%", label: "Uptime", sublabel: "Platform reliability" },
    ],
  },

  // Slide 7: Summary with Stats (stats_inline)
  {
    type: "summary_with_stats",
    layoutVariant: "stats_inline",
    blocks: [
      { kind: "title", text: "Key Metrics" },
      { kind: "text", text: "Our performance metrics demonstrate strong execution across all business units." },
      { kind: "stat_block", value: "85", label: "NPS Score" },
      { kind: "stat_block", value: "12M", label: "ARR" },
    ],
  },
];

async function runTest() {
  console.log("=== Sprint 4: Cards Test ===\n");

  console.log("Generating PPTX with 7 test slides...");
  console.log("- 1x cover slide");
  console.log("- 2x numbered_grid slides (2x2 and 3x1 layouts)");
  console.log("- 2x icon_cards_with_image slides (with and without image)");
  console.log("- 2x summary_with_stats slides (stats_bottom and stats_inline)\n");

  try {
    const buffer = await renderSlidesToPptx(testSlides, "corporate_blue", undefined, "Sprint 4 Test");

    const outputPath = "/tmp/sprint4-cards-test.pptx";
    writeFileSync(outputPath, buffer);

    console.log(`✅ PPTX generated successfully!`);
    console.log(`   File: ${outputPath}`);
    console.log(`   Size: ${(buffer.length / 1024).toFixed(1)} KB`);
    console.log(`   Slides: ${testSlides.length}\n`);

    console.log("=== Test Complete ===");
    console.log("Open the PPTX file to verify:");
    console.log("- Numbered cards display with number badges");
    console.log("- Icon cards show colored backgrounds");
    console.log("- Summary with stats has large stat values");
    console.log("- Grid layouts are properly arranged\n");

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

runTest()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
