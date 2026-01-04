import type { Slide, SlideType } from "@/lib/schemas/slide";
import type { ConstraintViolation } from "@/lib/validation/constraints";
import { SLIDE_CONSTRAINTS } from "@/lib/validation/constraints";

/**
 * Get full constraint description for context
 */
function getFullConstraintSpec(slideType: SlideType, violations: ConstraintViolation[]): string {
  const constraints = SLIDE_CONSTRAINTS[slideType];
  const violatedFields = new Set(violations.map((v) => v.field));
  const lines: string[] = [];

  if (constraints.title) {
    const status = violatedFields.has("title") ? "VIOLATION" : "OK";
    lines.push(`- title: max ${constraints.title.maxChars} chars [${status}]`);
  }
  if (constraints.subtitle) {
    const status = violatedFields.has("subtitle") ? "VIOLATION" : "OK";
    lines.push(`- subtitle: max ${constraints.subtitle.maxChars} chars [${status}]`);
  }
  if (constraints.text) {
    const status = violatedFields.has("text") ? "VIOLATION" : "OK";
    lines.push(`- text: max ${constraints.text.maxChars} chars [${status}]`);
  }
  if (constraints.bullets) {
    const status = violations.some((v) => v.field.includes("bullet")) ? "VIOLATION" : "OK";
    lines.push(
      `- bullets: ${constraints.bullets.min}-${constraints.bullets.max} items, max ${constraints.bullets.maxCharsPerBullet} chars each [${status}]`
    );
  }
  if (constraints.items) {
    const status = violations.some((v) => v.field.includes("item")) ? "VIOLATION" : "OK";
    lines.push(
      `- items: ${constraints.items.min}-${constraints.items.max} items, max ${constraints.items.maxCharsPerItem} chars each [${status}]`
    );
  }
  if (constraints.columns) {
    const status = violations.some((v) => v.field.includes("column")) ? "VIOLATION" : "OK";
    lines.push(`- columns: max ${constraints.columns.maxCharsPerColumn} chars each [${status}]`);
  }
  if (constraints.table) {
    const status = violations.some((v) => v.field.includes("table")) ? "VIOLATION" : "OK";
    lines.push(
      `- table: max ${constraints.table.maxRows} rows, ${constraints.table.maxColumns} cols [${status}]`
    );
  }

  return lines.join("\n");
}

/**
 * Norwegian number words for title adjustment
 */
const NUMBER_TO_NORWEGIAN: Record<number, string> = {
  1: "Ett",
  2: "To",
  3: "Tre",
  4: "Fire",
  5: "Fem",
  6: "Seks",
  7: "Syv",
  8: "Åtte",
  9: "Ni",
  10: "Ti",
};

/**
 * Build system prompt for slide repair
 */
export function buildRepairSystemPrompt(
  violations: ConstraintViolation[],
  slideType?: SlideType
): string {
  const violationDescriptions = violations
    .map((v) => `- ${v.field}: ${v.message} (current: ${v.current}, limit: ${v.limit})`)
    .join("\n");

  const hasShorten = violations.some((v) => v.action === "shorten");
  const hasSplit = violations.some((v) => v.action === "split");
  const hasAdjustTitle = violations.some((v) => v.action === "adjust_title");
  const hasExpand = violations.some((v) => v.action === "expand");

  // Include full constraint spec for context
  const constraintSpec = slideType
    ? `\nALL CONSTRAINTS FOR ${slideType.toUpperCase()}:\n${getFullConstraintSpec(slideType, violations)}`
    : "";

  let actionInstructions = "";

  // Handle title-count mismatch first (highest priority)
  if (hasAdjustTitle) {
    const titleViolation = violations.find((v) => v.action === "adjust_title");
    const actualCount = titleViolation?.current ?? 0;
    const norwegianNumber = NUMBER_TO_NORWEGIAN[actualCount] ?? actualCount.toString();

    actionInstructions += `
ACTION REQUIRED: ADJUST TITLE
The title mentions a specific number that doesn't match the actual item count.
- Actual items in slide: ${actualCount}
- Norwegian word for ${actualCount}: "${norwegianNumber}"

Fix options (choose ONE):
1. PREFERRED: Change the number in the title to match actual items
   - Replace number word with "${norwegianNumber}" or "${actualCount}"
   - Example: "Fire USP-er" → "${norwegianNumber} USP-er" (if ${actualCount} items)
2. ALTERNATIVE: Remove the number from the title entirely
   - Example: "Fire USP-er" → "Våre USP-er" or "Viktige USP-er"

DO NOT add or remove items - only fix the title text.
`;
  }

  // Handle expand action (for cards/items that are too short)
  if (hasExpand) {
    const expandViolations = violations.filter((v) => v.action === "expand");
    const minRequired = expandViolations[0]?.limit ?? 30;

    actionInstructions += `
ACTION REQUIRED: EXPAND CONTENT
Some card descriptions are too short and look empty/unprofessional.
- Minimum required: ${minRequired} characters per item
- Add specific benefits, outcomes, or details
- Don't just pad with filler words - add real value

Techniques to expand meaningfully:
- Add quantifiable outcomes ("Reduser møtetid med 40%")
- Include specific benefits ("Spar 4-6 timer ukentlig")
- Add action verbs ("Automatiserer", "Integrerer", "Forenkler")
- Mention concrete features or capabilities
`;
  }

  if (hasShorten && hasSplit) {
    actionInstructions += `
ACTION REQUIRED:
1. SHORTEN the content to fit within limits
2. Keep the core meaning - compress, don't delete important info
3. Use abbreviations, simpler words, or restructure sentences`;
  } else if (hasShorten) {
    actionInstructions += `
ACTION REQUIRED: SHORTEN
Techniques to reduce length while keeping meaning:
- Remove filler words ("faktisk", "egentlig", "veldig")
- Use shorter synonyms
- Combine related points
- Cut redundant context
- Use active voice (shorter than passive)`;
  } else if (hasSplit) {
    actionInstructions += `
ACTION REQUIRED: Consider restructuring
- The content may be too dense for one slide
- Focus on the most important points
- Remove less critical information`;
  }

  return `You are a presentation slide repair assistant.

TASK: Fix constraint violations in a slide without losing essential meaning.

VIOLATIONS TO FIX:
${violationDescriptions}
${constraintSpec}
${actionInstructions}

REPAIR STRATEGY:
1. Read the violation details carefully
2. Identify what needs to be shortened
3. Preserve the KEY information, not just truncate
4. Test mentally if the result still makes sense
5. Verify ALL constraints are now satisfied

RULES:
- Return the SAME slide structure (type, layoutVariant)
- Only modify the blocks that have violations
- Keep as much original content as possible
- Ensure all constraints are satisfied after repair
- Never add new content, only fix existing issues
- Maintain professional Norwegian language

NORSK GRAMMATIKK - KAPITALISERING (KRITISK):
- Bruk SENTENCE CASE for alle titler og overskrifter
- Kun første ord skal ha stor bokstav, IKKE hvert ord
- FEIL: "Fem Viktige Punkter" → RIKTIG: "Fem viktige punkter"
- Unntak: Egennavn (Norge, Microsoft) og forkortelser (AI, GDPR, KS)

OUTPUT FORMAT:
Return ONLY valid JSON with the repaired slide:
{
  "type": "...",
  "layoutVariant": "...",
  "blocks": [...]
}`;
}

/**
 * Build user prompt for slide repair
 */
export function buildRepairUserPrompt(slide: Slide): string {
  return `Please repair this slide:
${JSON.stringify(slide, null, 2)}`;
}

/**
 * Build system prompt for splitting a slide
 *
 * Phase 7 Sprint 4: Improved to generate unique, meaningful titles
 * instead of mechanical "(fortsettelse)" suffixes.
 */
export function buildSplitSystemPrompt(originalTitle: string): string {
  return `You are an expert presentation designer who excels at organizing content.

TASK: Transform one overloaded slide into 2-3 focused, standalone slides.

ORIGINAL TOPIC: "${originalTitle}"

CRITICAL - UNIQUE TITLES FOR EACH SLIDE:
Each slide MUST have its own unique, descriptive title that reflects its specific content.

FORBIDDEN:
- "${originalTitle} (fortsettelse)"
- "${originalTitle} (del 2)"
- "${originalTitle} - fortsatt"
- Any repetition of the original title with suffixes

REQUIRED:
- Analyze the content of each new slide
- Create a title that describes WHAT that specific slide covers
- Titles should be thematically related but clearly differentiated

EXAMPLE TRANSFORMATIONS:
Original: "Implementering av ny strategi"
Split into:
1. "Nøkkelfaser i implementeringen" (covers the phases/steps)
2. "Ressurser og ansvar" (covers who does what)
3. "Tidsplan og milepæler" (covers timeline)

Original: "Markedsanalyse og konkurrenter"
Split into:
1. "Markedstrender og muligheter" (market analysis)
2. "Konkurranselandskapet" (competitor overview)
3. "Vår posisjonering" (our positioning)

SLIDE TYPE FLEXIBILITY:
- You MAY use different slide types for each split if it fits the content better
- A bullets slide can become: text_plus_image, icon_cards_with_image, numbered_grid
- Choose types that best represent each content segment

CONTENT DISTRIBUTION:
- Each slide should be self-contained and valuable on its own
- Don't just cut content in half - reorganize by theme/topic
- Aim for roughly equal visual weight on each slide

NORSK GRAMMATIKK - KAPITALISERING:
- Bruk SENTENCE CASE: kun første ord har stor bokstav
- FEIL: "Markedstrender Og Muligheter" → RIKTIG: "Markedstrender og muligheter"
- Unntak: Egennavn og forkortelser (AI, CRM, HubSpot)

OUTPUT FORMAT:
Return ONLY valid JSON with an array of slides:
{
  "slides": [
    { "type": "...", "layoutVariant": "...", "blocks": [...] },
    { "type": "...", "layoutVariant": "...", "blocks": [...] }
  ]
}`;
}

/**
 * Build user prompt for splitting a slide
 *
 * Phase 7 Sprint 4: Enhanced to extract key themes for better title generation.
 */
export function buildSplitUserPrompt(slide: Slide, violations: ConstraintViolation[]): string {
  const violationSummary = violations
    .map((v) => `${v.field}: ${v.current} chars (limit: ${v.limit})`)
    .join(", ");

  // Extract key content themes for better context
  const titleBlock = slide.blocks.find((b) => b.kind === "title");
  const textBlocks = slide.blocks.filter((b) => b.kind === "text" || b.kind === "callout");
  const bulletBlock = slide.blocks.find((b) => b.kind === "bullets");

  const themes: string[] = [];
  if (titleBlock && "text" in titleBlock && titleBlock.text) {
    themes.push(`Main topic: ${titleBlock.text}`);
  }
  if (textBlocks.length > 0) {
    const textContent = textBlocks
      .map((b) => ("text" in b ? b.text : ""))
      .filter(Boolean)
      .join(" ")
      .slice(0, 200);
    if (textContent) themes.push(`Key content: ${textContent}...`);
  }
  if (bulletBlock && "items" in bulletBlock && bulletBlock.items && bulletBlock.items.length > 0) {
    themes.push(
      `Bullet points cover: ${bulletBlock.items.slice(0, 3).join(", ")}${bulletBlock.items.length > 3 ? "..." : ""}`
    );
  }

  const themeContext =
    themes.length > 0 ? `\n\nCONTENT THEMES TO CONSIDER FOR TITLES:\n${themes.join("\n")}\n` : "";

  return `This slide has content that exceeds limits: ${violationSummary}
${themeContext}
IMPORTANT: Create UNIQUE, DESCRIPTIVE titles for each new slide based on what that slide specifically covers. Do NOT use "(fortsettelse)" or similar suffixes.

Original slide to split:
${JSON.stringify(slide, null, 2)}`;
}
