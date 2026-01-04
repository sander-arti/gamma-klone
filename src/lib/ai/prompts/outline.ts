import type { GenerationRequest } from "@/lib/schemas/deck";
import type { SlideType } from "@/lib/schemas/slide";
import type { ContentAnalysis } from "../content-analysis";
import { formatAnalysisForPrompt } from "../content-analysis";
import { recommendSlideTypes, formatRecommendationsForPrompt } from "../slide-type-selector";

/**
 * Available slide types for outline generation
 * Organized by category for AI guidance
 */
const SLIDE_TYPES: SlideType[] = [
  // Structure slides
  "cover",
  "agenda",
  "section_header",
  // Basic content
  "bullets",
  "two_column_text",
  "text_plus_image",
  "decisions_list",
  "action_items_table",
  "summary_next_steps",
  "quote_callout",
  // Premium visual slides (PRIORITIZE THESE)
  "timeline_roadmap",
  "numbered_grid",
  "icon_cards_with_image",
  "summary_with_stats",
  "hero_stats",
  "split_with_callouts",
  "person_spotlight",
];

/**
 * Build system prompt for outline generation
 * @param request - The generation request
 * @param analysis - Optional pre-computed content analysis
 */
export function buildOutlineSystemPrompt(
  request: GenerationRequest,
  analysis?: ContentAnalysis
): string {
  const { textMode, tone, audience, amount, numSlides, language, additionalInstructions } = request;

  // "Compose First, Count Once" - ask LLM for approximate content slides
  // Structural slides (cover, agenda, summary) are added/ensured automatically
  // The exact count is enforced AFTER composition
  const slideCountGuidance = numSlides
    ? `Target approximately ${Math.max(numSlides - 3, 3)}-${Math.max(numSlides - 2, 4)} content slides. Structural slides (cover, agenda, summary) will be added automatically if missing. Final deck will have exactly ${numSlides} slides after composition.`
    : amount === "brief"
      ? "Create 3-5 content slides for a concise presentation."
      : amount === "detailed"
        ? "Create 8-12 content slides for a comprehensive presentation."
        : "Create 5-8 content slides for a balanced presentation.";

  const modeInstructions = {
    generate: "Create original, engaging content based on the topic provided.",
    condense:
      "Summarize and structure the provided notes into clear, digestible slides. Extract key points and organize logically.",
    preserve:
      "Structure the provided content into slides while preserving the original phrasing as much as possible. Do not rewrite or paraphrase significantly.",
  };

  const toneInstruction = tone ? `Use a ${tone} tone throughout.` : "";
  const audienceInstruction = audience ? `The target audience is: ${audience}.` : "";

  return `You are a presentation outline generator for a Norwegian AI presentation platform.

TASK: Generate a presentation outline in JSON format.

INSTRUCTIONS:
- ${modeInstructions[textMode]}
- ${slideCountGuidance}
- ${toneInstruction}
- ${audienceInstruction}
- Language: ${language === "no" ? "Norwegian (Bokmål)" : language}

AVAILABLE SLIDE TYPES:
${SLIDE_TYPES.map((t) => `- ${t}`).join("\n")}

SLIDE TYPE GUIDELINES:
**Structure slides:**
- cover: Title slide (ALWAYS first) - gets a large hero image
- agenda: Overview slide - use ONLY if deck has 6+ slides
- section_header: Section divider - use between major topic changes

**Basic content (USE SPARINGLY - max 2-3 per deck):**
- bullets: Simple bullet lists (ONLY when nothing else fits)
- two_column_text: Side-by-side comparisons
- decisions_list: List of decisions made
- action_items_table: Tasks with owner and deadline

**PREMIUM VISUAL SLIDES (PRIORITIZE THESE):**
- text_plus_image: 50/50 split with large image - USE for main content slides
- icon_cards_with_image: Feature cards with icons + optional image - USE for features/benefits
- summary_with_stats: Large statistics display - USE when numbers are mentioned
- hero_stats: Full hero image with prominent stats - USE for impressive numbers
- timeline_roadmap: Visual timeline - USE for sequential steps/phases/roadmaps
- numbered_grid: Numbered concept cards - USE for 3-4 key points
- split_with_callouts: Image with callout boxes - USE for detailed explanations
- person_spotlight: Person profile with image - USE when people are mentioned by name
- quote_callout: Highlighted quote - USE for memorable statements
- summary_next_steps: Conclusion slide (often last)

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure:
{
  "title": "Presentation title (max 100 chars)",
  "slides": [
    {
      "title": "Slide title (max 100 chars)",
      "suggestedType": "one of the slide types above",
      "hints": ["hint 1", "hint 2", "hint 3"]
    }
  ]
}

VALIDATION CONSTRAINTS:
- title: max 100 characters
- hints: MAXIMUM 3 items per slide, each max 100 characters
- Violating these limits will cause errors - stay within them!

STRUCTURE RULES (structural slides are added automatically if missing):
1. You MAY include a "cover" slide - if not, one will be added automatically
2. You MAY include an "agenda" slide - if not, one will be added for decks >5 slides
3. Insert "section_header" slides between major topic changes or themes
4. You MAY end with "summary_next_steps" - if not, one will be added automatically
5. Use "quote_callout" to highlight memorable statements from the input
NOTE: Focus on creating good CONTENT slides. The system ensures proper structure.

CONTENT ANALYSIS - Look for and use:
- Key messages and statistics (use in cover subtitle and bullet points)
- Quotes or memorable phrases (use "quote_callout" slide)
- Decisions made (use "decisions_list" slide)
- Action items or tasks (use "action_items_table" slide)
- Comparisons or alternatives (use "two_column_text" slide)

HINTS - Be Specific (MAXIMUM 3 PER SLIDE):
- CRITICAL: Each slide can have AT MOST 3 hints. Never exceed this.
- Extract actual data points: "20% vekst i Q4", "500 MNOK omsetning"
- Include key names/terms: "SmartBot-lansering", "CEO Ola Nordmann"
- Reference specific sections: "Fra strategiplan", "Jf. budsjett 2025"
- Each hint should be actionable, not generic like "diskusjonspunkter"
- If you have more than 3 points, combine or prioritize the most important ones

**CRITICAL SLIDE TYPE DISTRIBUTION RULES (MUST FOLLOW):**
1. NEVER use "bullets" more than TWICE in any deck
2. NEVER use "agenda" more than ONCE
3. NEVER use the same slide type more than 2 times consecutively
4. Every deck with 5+ slides MUST include at least ONE of: icon_cards_with_image, summary_with_stats, timeline_roadmap, or split_with_callouts
5. If the content mentions ANY numbers/statistics → MUST use summary_with_stats or hero_stats
6. If the content mentions ANY person by name → MUST use person_spotlight
7. If the content has 3+ sequential steps/phases → MUST use timeline_roadmap
8. If the content lists 3-4 features/benefits → MUST use icon_cards_with_image or numbered_grid
9. Prefer text_plus_image over bullets for main content - images make presentations engaging

GENERAL RULES:
- Keep titles concise, engaging, and descriptive (not generic)
- Ensure logical flow from introduction to conclusion
- Never include placeholder text like "TODO" or "TBD"
- For Norwegian presentations, use Norwegian titles and hints
- ALWAYS prefer visual slide types over plain text slides${
    analysis
      ? `

PRE-EXTRACTED CONTENT ANALYSIS:
${formatAnalysisForPrompt(analysis, 500, !!numSlides)}

USE THIS ANALYSIS (REQUIRED):
- If statistics are found → MUST use summary_with_stats or hero_stats slide
- If quotes are found → MUST use quote_callout slide
- If decisions are found → MUST use decisions_list slide
- If action items are found → MUST use action_items_table slide
- If persons are named → MUST use person_spotlight slide
- If sequential steps are found → MUST use timeline_roadmap slide
- Focus on CONTENT quality - the final slide count will be adjusted automatically
${formatRecommendationsForPrompt(recommendSlideTypes(analysis))}`
      : ""
  }${
    additionalInstructions
      ? `

USER'S ADDITIONAL INSTRUCTIONS (MUST FOLLOW):
${additionalInstructions}

These instructions override defaults. Apply them to the outline structure and content.`
      : ""
  }`;
}

/**
 * Build user prompt for outline generation
 */
export function buildOutlineUserPrompt(request: GenerationRequest): string {
  return request.inputText;
}
