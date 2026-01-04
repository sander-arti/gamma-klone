/**
 * Test Script for Sprint 5: Intelligent Layout
 *
 * Verifies:
 * - Content analysis extracts new patterns (sequentialProcess, comparisons, features, hasRoadmap)
 * - Slide type selector recommends correct slide types based on content
 * - Recommendations are properly formatted for prompt injection
 */

import { analyzeContent } from "@/lib/ai/content-analysis";
import {
  recommendSlideTypes,
  formatRecommendationsForPrompt,
  getTopRecommendation,
  isSlideTypeRecommended,
} from "@/lib/ai/slide-type-selector";

// Test 1: Statistics content → summary_with_stats
const statisticsText = `
Årsrapport 2024

Omsetningen økte med 45% til 120 MNOK. Vi har nå 850 ansatte,
opp fra 520 i fjor. Kundetilfredsheten ligger på 94%.
Markedsandelen i Norge er 28%, en økning på 12 prosentpoeng.
`;

// Test 2: Sequential process → timeline_roadmap
const processText = `
Prosjektplan for SmartBot-lansering

1. Kravspesifikasjon: Samle inn og dokumentere alle krav fra stakeholders
2. Design: Utvikle brukergrensesnitt og systemarkitektur
3. Utvikling: Implementere kjernefunksjonalitet
4. Testing: Gjennomføre QA og brukerakseptansetest
5. Lansering: Go-live med full markedsføringsstøtte
`;

// Test 3: Features → icon_cards_with_image
const featuresText = `
Plattformens hovedfunksjoner:

- Sanntidsanalyse: Prosesser millioner av datapunkter per sekund
- AI-drevet innsikt: Automatiske anbefalinger basert på mønstergjenkjenning
- Skybasert: Kjører sømløst på AWS, Azure eller GCP
- Enterprise-sikkerhet: SOC2-sertifisert med full kryptering
`;

// Test 4: Roadmap keywords → timeline_roadmap
const roadmapText = `
Produktroadmap 2025

Q1 2025: MVP-lansering med kjernefunksjoner
Q2 2025: Integrasjon med tredjepartsystemer
Q3 2025: Enterprise-versjon med avansert sikkerhet
Q4 2025: Global utrulling
`;

// Test 5: Decisions → decisions_list
const decisionsText = `
Styremøte 2024-12-15

Besluttet å øke markedsbudsjettet med 25%.
Vedtatt ny strategi for nordisk ekspansjon.
Godkjent investering i AI-plattform på 5 MNOK.
`;

// Test 6: Comparisons → two_column_text
const comparisonText = `
Vårt produkt vs konkurrenten:

Vårt produkt har 99.9% oppetid, mens konkurrenten bare har 95%.
Vi tilbyr ubegrenset lagring kontra deres 10GB grense.
`;

function runTest(name: string, text: string, expectedType: string): boolean {
  console.log(`\n=== ${name} ===`);

  const analysis = analyzeContent(text);
  const recommendations = recommendSlideTypes(analysis);

  console.log("\nContent Analysis:");
  console.log(`  - Statistics: ${analysis.statistics.length}`);
  console.log(`  - Sequential Process: ${analysis.sequentialProcess.length}`);
  console.log(`  - Features: ${analysis.features.length}`);
  console.log(`  - Comparisons: ${analysis.comparisons.length}`);
  console.log(`  - Decisions: ${analysis.decisions.length}`);
  console.log(`  - Has Roadmap: ${analysis.hasRoadmap}`);

  console.log("\nRecommendations:");
  for (const rec of recommendations) {
    console.log(`  - ${rec.type} (${rec.confidence}): ${rec.reason}`);
  }

  const topRec = getTopRecommendation(recommendations);
  const isCorrect = isSlideTypeRecommended(recommendations, expectedType as never);

  console.log(`\nTop Recommendation: ${topRec?.type ?? "none"}`);
  console.log(`Expected: ${expectedType}`);
  console.log(`Match: ${isCorrect ? "✅ PASS" : "❌ FAIL"}`);

  return isCorrect;
}

function testPromptFormatting(): boolean {
  console.log("\n=== Prompt Formatting Test ===");

  const analysis = analyzeContent(statisticsText + processText);
  const recommendations = recommendSlideTypes(analysis);
  const formatted = formatRecommendationsForPrompt(recommendations);

  console.log("\nFormatted for prompt:");
  console.log(formatted);

  const hasHeader = formatted.includes("CONTENT-BASED SLIDE SUGGESTIONS:");
  const hasConsider = formatted.includes("Consider");

  console.log(`\nHas header: ${hasHeader ? "✅" : "❌"}`);
  console.log(`Has recommendations: ${hasConsider ? "✅" : "❌"}`);

  return hasHeader && hasConsider;
}

async function runAllTests() {
  console.log("=== Sprint 5: Intelligent Layout Tests ===");
  console.log("Testing content analysis and slide type recommendations\n");

  const results: boolean[] = [];

  // Run all tests
  results.push(runTest("Statistics → summary_with_stats", statisticsText, "summary_with_stats"));
  results.push(runTest("Sequential Process → timeline_roadmap", processText, "timeline_roadmap"));
  results.push(runTest("Features → icon_cards_with_image", featuresText, "icon_cards_with_image"));
  results.push(runTest("Roadmap Keywords → timeline_roadmap", roadmapText, "timeline_roadmap"));
  results.push(runTest("Decisions → decisions_list", decisionsText, "decisions_list"));
  results.push(runTest("Comparisons → two_column_text", comparisonText, "two_column_text"));
  results.push(testPromptFormatting());

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("SUMMARY");
  console.log("=".repeat(50));

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\nTests passed: ${passed}/${total}`);

  if (passed === total) {
    console.log("\n✅ All tests passed! Sprint 5 is complete.");
    return true;
  } else {
    console.log("\n❌ Some tests failed. Review above for details.");
    return false;
  }
}

runAllTests()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
