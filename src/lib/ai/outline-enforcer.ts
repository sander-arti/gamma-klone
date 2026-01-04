/**
 * Outline Enforcer
 *
 * Post-processes AI-generated outlines to enforce slide type distribution rules.
 * Ensures Gamma-level quality by:
 * - Limiting "bullet-like" slides (bullets, agenda, decisions_list) to max 2
 * - Guaranteeing at least 1 premium visual slide in decks with 5+ slides
 * - Auto-upgrading excess bullets to premium types based on content analysis
 *
 * Phase 7 Sprint 4 (Layer 3.1): Enhanced with dynamic scoring context
 */

import type { Outline, OutlineSlide, SlideType } from "@/lib/schemas/slide";
import type { ContentAnalysis } from "./content-analysis";

/**
 * Phase 7 Sprint 4: Context for dynamic template scoring
 */
export interface ScoringContext {
  /** Slide position in deck (0-indexed) */
  slidePosition: number;
  /** Total slides in deck */
  totalSlides: number;
  /** Types already assigned (for diversity tracking) */
  usedTypes: Set<SlideType>;
  /** Recently used types (last 3) for stronger diversity */
  recentlyUsedTypes: SlideType[];
  /** Optional audience type for boost */
  audience?: "executives" | "technical" | "general";
}

/**
 * Slide types that are considered "bullet-like" and CAN be upgraded
 */
const UPGRADEABLE_BULLET_TYPES: SlideType[] = ["bullets", "agenda", "decisions_list"];

/**
 * ALL types that VISUALLY appear as bullet/list-heavy (for counting purposes)
 * Includes both upgradeable and protected types that look like lists
 */
const VISUAL_BULLET_TYPES: SlideType[] = [
  "bullets",
  "agenda",
  "decisions_list",
  "action_items_table", // Protected but looks like bullets
  "summary_next_steps", // Protected but looks like bullets
];

/**
 * Premium visual slide types that make presentations engaging
 */
const PREMIUM_TYPES: SlideType[] = [
  "icon_cards_with_image",
  "summary_with_stats",
  "timeline_roadmap",
  "hero_stats",
  "numbered_grid",
  "split_with_callouts",
  "person_spotlight",
  "text_plus_image",
];

/**
 * Types that should never be auto-upgraded (structural slides)
 */
const PROTECTED_TYPES: SlideType[] = [
  "cover",
  "section_header",
  "summary_next_steps",
  "quote_callout",
  "action_items_table",
];

/**
 * Count occurrences of each slide type in outline
 */
export function countSlideTypes(outline: Outline): Map<SlideType, number> {
  const counts = new Map<SlideType, number>();

  for (const slide of outline.slides) {
    const type = slide.suggestedType ?? "bullets";
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  return counts;
}

/**
 * Get indices of slides that VISUALLY look like bullet lists
 */
function getVisualBulletIndices(outline: Outline): number[] {
  return outline.slides
    .map((slide, index) => ({ slide, index }))
    .filter(({ slide }) => {
      const type = slide.suggestedType ?? "bullets";
      return VISUAL_BULLET_TYPES.includes(type);
    })
    .map(({ index }) => index);
}

/**
 * Get indices of bullet-like slides that CAN be upgraded (not protected)
 */
function getUpgradeableBulletIndices(outline: Outline): number[] {
  return outline.slides
    .map((slide, index) => ({ slide, index }))
    .filter(({ slide }) => {
      const type = slide.suggestedType ?? "bullets";
      return UPGRADEABLE_BULLET_TYPES.includes(type);
    })
    .map(({ index }) => index);
}

/**
 * Check if outline has at least one premium slide
 */
function hasPremiumSlide(outline: Outline): boolean {
  return outline.slides.some((slide) => {
    const type = slide.suggestedType ?? "bullets";
    return PREMIUM_TYPES.includes(type);
  });
}

/**
 * Phase 7 Sprint 4: Apply dynamic scoring modifiers
 * Returns a multiplier (0.0 - 1.5) to adjust base score
 */
function applyScoreModifiers(type: SlideType, baseScore: number, context?: ScoringContext): number {
  if (!context) {
    return baseScore;
  }

  let score = baseScore;

  // Diversity penalty: -20% if type was used in last 3 slides
  if (context.recentlyUsedTypes.includes(type)) {
    score *= 0.8;
  }

  // Position penalty: -30% for premium types in position 1-2 (right after cover)
  // Decks need variety before hitting premium
  if (context.slidePosition <= 2 && PREMIUM_TYPES.includes(type)) {
    score *= 0.7;
  }

  // Audience boosts
  if (context.audience === "executives") {
    // Executives prefer data-driven slides
    if (type === "summary_with_stats" || type === "hero_stats") {
      score *= 1.3;
    }
  } else if (context.audience === "technical") {
    // Technical audiences prefer process/timeline slides
    if (type === "timeline_roadmap" || type === "numbered_grid") {
      score *= 1.2;
    }
  }

  // Late-deck boost: premium slides work well toward the end
  if (context.slidePosition >= context.totalSlides - 3) {
    if (PREMIUM_TYPES.includes(type)) {
      score *= 1.1;
    }
  }

  return score;
}

/**
 * Select the best premium type based on content analysis
 * Phase 7 Sprint 4: Now uses dynamic scoring with context
 */
function selectPremiumType(
  analysis: ContentAnalysis,
  usedTypes: Set<SlideType>,
  context?: ScoringContext
): SlideType {
  // Priority order based on content signals
  const candidates: { type: SlideType; score: number }[] = [];

  // Statistics → summary_with_stats (highest priority)
  if (analysis.statistics.length >= 2 && !usedTypes.has("summary_with_stats")) {
    const baseScore = 100;
    const score = applyScoreModifiers("summary_with_stats", baseScore, context);
    candidates.push({ type: "summary_with_stats", score });
  }

  // Sequential process → timeline_roadmap
  if (analysis.sequentialProcess.length >= 3 && !usedTypes.has("timeline_roadmap")) {
    const baseScore = 90;
    const score = applyScoreModifiers("timeline_roadmap", baseScore, context);
    candidates.push({ type: "timeline_roadmap", score });
  }

  // Features → icon_cards_with_image
  if (analysis.features.length >= 2 && !usedTypes.has("icon_cards_with_image")) {
    const baseScore = 85;
    const score = applyScoreModifiers("icon_cards_with_image", baseScore, context);
    candidates.push({ type: "icon_cards_with_image", score });
  }

  // Comparisons → two_column_text (not premium but better than bullets)
  if (analysis.comparisons.length >= 1 && !usedTypes.has("two_column_text")) {
    const baseScore = 70;
    const score = applyScoreModifiers("two_column_text", baseScore, context);
    candidates.push({ type: "two_column_text", score });
  }

  // Quotes → quote_callout
  if (analysis.quotes.length >= 1 && !usedTypes.has("quote_callout")) {
    const baseScore = 60;
    const score = applyScoreModifiers("quote_callout", baseScore, context);
    candidates.push({ type: "quote_callout", score });
  }

  // Short numbered concepts → numbered_grid
  if (analysis.sequentialProcess.length >= 2 && analysis.sequentialProcess.length <= 4) {
    const avgLength =
      analysis.sequentialProcess.reduce((sum, s) => sum + s.text.length, 0) /
      analysis.sequentialProcess.length;
    if (avgLength < 60 && !usedTypes.has("numbered_grid")) {
      const baseScore = 75;
      const score = applyScoreModifiers("numbered_grid", baseScore, context);
      candidates.push({ type: "numbered_grid", score });
    }
  }

  // Sort by score and return best match
  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length > 0) {
    return candidates[0].type;
  }

  // Default fallbacks in priority order
  const defaultFallbacks: SlideType[] = [
    "text_plus_image",
    "numbered_grid",
    "icon_cards_with_image",
  ];

  for (const fallback of defaultFallbacks) {
    if (!usedTypes.has(fallback)) {
      return fallback;
    }
  }

  // Ultimate fallback
  return "text_plus_image";
}

/**
 * Upgrade a bullet-like slide to a premium type
 */
function upgradeSlide(slide: OutlineSlide, newType: SlideType): OutlineSlide {
  return {
    ...slide,
    suggestedType: newType,
    // Keep hints as they can still be useful for content generation
  };
}

/**
 * Main enforcement function
 *
 * Rules enforced:
 * 1. Max 2 "bullet-like" slides (bullets, agenda, decisions_list)
 * 2. Min 1 premium visual slide in decks with 5+ slides
 * 3. Auto-upgrade excess bullets based on content analysis
 *
 * Phase 7 Sprint 4: Now uses dynamic scoring context for better type selection
 */
export function enforceSlideDistribution(
  outline: Outline,
  analysis: ContentAnalysis,
  audience?: "executives" | "technical" | "general"
): Outline {
  // Skip enforcement for very short decks
  if (outline.slides.length < 4) {
    console.log("[outline-enforcer] Skipping enforcement for short deck");
    return outline;
  }

  let modifiedSlides = [...outline.slides];
  const usedTypes = new Set<SlideType>();
  const recentlyUsedTypes: SlideType[] = [];
  let changes: string[] = [];

  // Track what types are already used
  for (const slide of modifiedSlides) {
    const type = slide.suggestedType ?? "bullets";
    usedTypes.add(type);
    recentlyUsedTypes.push(type);
  }

  // Phase 7 Sprint 4: Helper to create scoring context for a given position
  const createContext = (slidePosition: number): ScoringContext => ({
    slidePosition,
    totalSlides: modifiedSlides.length,
    usedTypes,
    recentlyUsedTypes: recentlyUsedTypes.slice(-3), // Last 3 types
    audience,
  });

  // Rule 1: Limit VISUAL bullet-like slides to max 2
  // Count all slides that LOOK like bullet lists (including protected ones)
  const visualBulletIndices = getVisualBulletIndices({ ...outline, slides: modifiedSlides });
  const upgradeableBulletIndices = getUpgradeableBulletIndices({
    ...outline,
    slides: modifiedSlides,
  });

  const excessBullets = visualBulletIndices.length - 2;

  if (excessBullets > 0) {
    console.log(
      `[outline-enforcer] Found ${visualBulletIndices.length} visual bullet-like slides (max 2), need to upgrade ${excessBullets}`
    );

    // Get upgradeable indices, excluding first slide (cover)
    const candidatesForUpgrade = upgradeableBulletIndices.filter((idx) => idx !== 0); // Never upgrade first slide

    // Upgrade as many as needed, starting from the last ones
    const indicesToUpgrade = candidatesForUpgrade.slice(-excessBullets);

    for (const idx of indicesToUpgrade) {
      const slide = modifiedSlides[idx];
      const currentType = slide.suggestedType ?? "bullets";

      // Phase 7 Sprint 4: Pass context for dynamic scoring
      const context = createContext(idx);
      const newType = selectPremiumType(analysis, usedTypes, context);
      modifiedSlides[idx] = upgradeSlide(slide, newType);
      usedTypes.add(newType);
      recentlyUsedTypes.push(newType);
      changes.push(`Slide ${idx + 1}: ${currentType} → ${newType}`);
    }

    // If we couldn't upgrade enough (too many protected), log warning
    const remainingVisualBullets = getVisualBulletIndices({
      ...outline,
      slides: modifiedSlides,
    }).length;
    if (remainingVisualBullets > 2) {
      console.log(
        `[outline-enforcer] WARNING: Still have ${remainingVisualBullets} visual bullet-like slides (${remainingVisualBullets - 2} are protected)`
      );
    }
  }

  // Rule 2: Ensure at least one premium slide in decks with 5+ slides
  if (modifiedSlides.length >= 5 && !hasPremiumSlide({ ...outline, slides: modifiedSlides })) {
    console.log("[outline-enforcer] No premium slides found, injecting one");

    // Find best candidate to upgrade (prefer middle slides)
    const middleIndex = Math.floor(modifiedSlides.length / 2);
    const candidateIndices = [middleIndex, middleIndex - 1, middleIndex + 1].filter(
      (idx) => idx > 0 && idx < modifiedSlides.length - 1
    ); // Exclude first and last

    for (const idx of candidateIndices) {
      const slide = modifiedSlides[idx];
      const currentType = slide.suggestedType ?? "bullets";

      if (!PROTECTED_TYPES.includes(currentType) && !PREMIUM_TYPES.includes(currentType)) {
        // Phase 7 Sprint 4: Pass context for dynamic scoring
        const context = createContext(idx);
        const newType = selectPremiumType(analysis, usedTypes, context);
        modifiedSlides[idx] = upgradeSlide(slide, newType);
        usedTypes.add(newType);
        changes.push(`Slide ${idx + 1}: ${currentType} → ${newType} (premium injection)`);
        break;
      }
    }
  }

  // Log changes
  if (changes.length > 0) {
    console.log("[outline-enforcer] Changes made:");
    changes.forEach((change) => console.log(`  - ${change}`));
  } else {
    console.log("[outline-enforcer] No changes needed");
  }

  return {
    ...outline,
    slides: modifiedSlides,
  };
}

/**
 * Get statistics about slide type distribution
 */
export function getDistributionStats(outline: Outline): {
  totalSlides: number;
  bulletLikeCount: number;
  premiumCount: number;
  uniqueTypes: number;
} {
  const counts = countSlideTypes(outline);

  let bulletLikeCount = 0;
  let premiumCount = 0;

  for (const [type, count] of counts) {
    // Count ALL visual bullet-like types for accurate reporting
    if (VISUAL_BULLET_TYPES.includes(type)) {
      bulletLikeCount += count;
    }
    if (PREMIUM_TYPES.includes(type)) {
      premiumCount += count;
    }
  }

  return {
    totalSlides: outline.slides.length,
    bulletLikeCount,
    premiumCount,
    uniqueTypes: counts.size,
  };
}
