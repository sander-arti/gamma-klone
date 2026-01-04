/**
 * Slide Type Selector (Sprint 5)
 *
 * Intelligent slide type selection based on content analysis.
 * Maps detected content patterns to appropriate slide types.
 */

import type { ContentAnalysis } from "./content-analysis";
import type { SlideType } from "@/lib/schemas/slide";

/**
 * Slide type recommendation with confidence level
 */
export interface SlideTypeRecommendation {
  type: SlideType;
  confidence: "high" | "medium" | "low";
  reason: string;
}

/**
 * Analyze content and recommend slide types
 *
 * Rules:
 * - Statistics (2+) → summary_with_stats
 * - Sequential steps (3+) or roadmap → timeline_roadmap
 * - Features (2+) → icon_cards_with_image
 * - Comparisons → two_column_text
 * - Decisions (2+) → decisions_list
 * - Action items (3+) → action_items_table
 * - Quotes → quote_callout
 */
export function recommendSlideTypes(analysis: ContentAnalysis): SlideTypeRecommendation[] {
  const recommendations: SlideTypeRecommendation[] = [];

  // Regel 1: Statistikk → summary_with_stats
  if (analysis.statistics.length >= 2) {
    recommendations.push({
      type: "summary_with_stats",
      confidence: analysis.statistics.length >= 4 ? "high" : "medium",
      reason: `Found ${analysis.statistics.length} statistics`,
    });
  }

  // Regel 2: Sekvensielle steg eller roadmap → timeline_roadmap
  if (analysis.sequentialProcess.length >= 3 || analysis.hasRoadmap) {
    recommendations.push({
      type: "timeline_roadmap",
      confidence: analysis.sequentialProcess.length >= 4 ? "high" : "medium",
      reason: analysis.hasRoadmap
        ? "Roadmap/timeline keywords detected"
        : `Found ${analysis.sequentialProcess.length} sequential steps`,
    });
  }

  // Regel 3: Features → icon_cards_with_image
  if (analysis.features.length >= 2) {
    recommendations.push({
      type: "icon_cards_with_image",
      confidence: analysis.features.length >= 3 ? "high" : "medium",
      reason: `Found ${analysis.features.length} feature descriptions`,
    });
  }

  // Regel 4: Sammenligninger → two_column_text
  if (analysis.comparisons.length >= 1) {
    recommendations.push({
      type: "two_column_text",
      confidence: "medium",
      reason: `Found ${analysis.comparisons.length} comparison(s)`,
    });
  }

  // Regel 5: Beslutninger → decisions_list
  if (analysis.decisions.length >= 2) {
    recommendations.push({
      type: "decisions_list",
      confidence: "high",
      reason: `Found ${analysis.decisions.length} decisions`,
    });
  }

  // Regel 6: Action items → action_items_table
  if (analysis.actionItems.length >= 3) {
    recommendations.push({
      type: "action_items_table",
      confidence: "high",
      reason: `Found ${analysis.actionItems.length} action items`,
    });
  }

  // Regel 7: Sitater → quote_callout
  if (analysis.quotes.length >= 1) {
    recommendations.push({
      type: "quote_callout",
      confidence: "medium",
      reason: `Found ${analysis.quotes.length} quote(s)`,
    });
  }

  // Regel 8: Nummererte konsepter (uten sekvensiell prosess) → numbered_grid
  // Hvis vi har korte, nummererte punkter som ikke er en prosess
  if (
    analysis.sequentialProcess.length >= 2 &&
    analysis.sequentialProcess.length <= 4 &&
    !analysis.hasRoadmap
  ) {
    // Sjekk om stegene er korte (mer som prinsipper enn prosess-steg)
    const avgLength =
      analysis.sequentialProcess.reduce((sum, s) => sum + s.text.length, 0) /
      analysis.sequentialProcess.length;
    if (avgLength < 60) {
      recommendations.push({
        type: "numbered_grid",
        confidence: "medium",
        reason: `Found ${analysis.sequentialProcess.length} short numbered concepts`,
      });
    }
  }

  return recommendations;
}

/**
 * Format recommendations for prompt injection
 */
export function formatRecommendationsForPrompt(recommendations: SlideTypeRecommendation[]): string {
  if (recommendations.length === 0) {
    return "";
  }

  const lines = recommendations
    .filter((r) => r.confidence !== "low")
    .map((r) => `- Consider "${r.type}": ${r.reason}`);

  if (lines.length === 0) {
    return "";
  }

  return `
CONTENT-BASED SLIDE SUGGESTIONS:
${lines.join("\n")}

Use these suggestions to improve slide type selection where appropriate.`;
}

/**
 * Get the highest confidence recommendation for a specific content type
 */
export function getTopRecommendation(
  recommendations: SlideTypeRecommendation[]
): SlideTypeRecommendation | null {
  const highConfidence = recommendations.filter((r) => r.confidence === "high");
  if (highConfidence.length > 0) {
    return highConfidence[0];
  }

  const mediumConfidence = recommendations.filter((r) => r.confidence === "medium");
  if (mediumConfidence.length > 0) {
    return mediumConfidence[0];
  }

  return recommendations[0] ?? null;
}

/**
 * Check if a specific slide type is recommended
 */
export function isSlideTypeRecommended(
  recommendations: SlideTypeRecommendation[],
  type: SlideType
): boolean {
  return recommendations.some((r) => r.type === type && r.confidence !== "low");
}
