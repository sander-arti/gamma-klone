import type { GenerationRequest } from "@/lib/schemas/deck";
import type { OutlineSlide, SlideType } from "@/lib/schemas/slide";
import { SLIDE_CONSTRAINTS } from "@/lib/validation/constraints";

/**
 * Get constraints description for a slide type
 */
function getConstraintsDescription(slideType: SlideType): string {
  const constraints = SLIDE_CONSTRAINTS[slideType];
  const parts: string[] = [];

  if (constraints.title) {
    parts.push(`- Title: max ${constraints.title.maxChars} characters`);
  }
  if (constraints.subtitle) {
    parts.push(`- Subtitle: max ${constraints.subtitle.maxChars} characters`);
  }
  if (constraints.text) {
    parts.push(`- Text: max ${constraints.text.maxChars} characters`);
  }
  if (constraints.bullets) {
    parts.push(
      `- Bullets: ${constraints.bullets.min}-${constraints.bullets.max} items, each max ${constraints.bullets.maxCharsPerBullet} characters`
    );
  }
  if (constraints.items) {
    parts.push(
      `- Items: ${constraints.items.min}-${constraints.items.max} items, each max ${constraints.items.maxCharsPerItem} characters`
    );
  }
  if (constraints.columns) {
    parts.push(`- Each column: max ${constraints.columns.maxCharsPerColumn} characters`);
  }
  if (constraints.table) {
    parts.push(
      `- Table: max ${constraints.table.maxRows} rows, ${constraints.table.maxColumns} columns`
    );
  }

  return parts.join("\n");
}

/**
 * Get slide-type specific writing guidance
 */
function getSlideTypeGuidance(slideType: SlideType): string {
  const guidance: Record<SlideType, string> = {
    cover: `- Title: Make it memorable, aim for 3-6 impactful words
- Subtitle: Include key context like date, company, or main takeaway
- Think: What's the ONE thing the audience should remember?`,
    agenda: `- Keep items parallel in structure (all verbs or all nouns)
- Be specific: "Budsjettgjennomgang Q4" not "Økonomi"
- 4-7 items is ideal for readability`,
    section_header: `- Title should signal a clear transition
- Subtitle can preview what's coming
- Make it punchy and memorable`,
    bullets: `- Each bullet should be actionable or informative, not just a noun
- Start with strong verbs or specific data
- Ensure logical ordering (priority, timeline, or category)
- WRONG: "Strategi" | RIGHT: "Øk markedsandel med 15% i Norden"`,
    two_column_text: `- Use for comparisons, pros/cons, or before/after
- Keep columns balanced in length
- Make the contrast or relationship clear`,
    text_plus_image: `- Text should complement, not repeat, what the image shows
- Alt text should describe a relevant professional image
- Keep text concise to give image visual weight`,
    decisions_list: `- Each decision should be clear and final (not a question)
- Include context: who decided, when, what impact
- Format: "Decision: [what] - [rationale/impact]"`,
    action_items_table: `- Each task needs: What, Who, When
- Tasks should be specific and measurable
- Use real-sounding names and realistic deadlines`,
    summary_next_steps: `- Summarize key takeaways, not just repeat slide titles
- Each step should have a clear owner or timeline
- End with the most important action`,
    quote_callout: `- Extract ACTUAL quotes from the input if available
- Never fabricate quotes - if none exist, use a key insight instead
- Attribution should be specific when possible`,
    timeline_roadmap: `- Each step should represent a distinct phase or milestone
- Use status to show progress: completed, current, upcoming
- Keep step titles short (e.g., "Q1 2025", "Fase 1: Planlegging")
- Descriptions should be concise and action-oriented`,
    numbered_grid: `- Use for ordered concepts, principles, or features
- Each card should have a clear, concise title (2-4 words)
- Descriptions MUST be 30-120 characters with real substance
- Don't just repeat the title - add specific details or benefits
- 2-4 cards is ideal for visual balance`,
    icon_cards_with_image: `- Choose icons that visually represent the concept (zap, shield, globe, target, heart, star, etc.)
- ALWAYS include bgColor for each icon_card - rotate through: pink, purple, blue, cyan, green, orange
- Keep card titles short and impactful (2-4 words)
- Descriptions MUST be 30-120 characters (1-2 sentences with real substance)
- Include specific benefits, outcomes, or quantifiable results
- Example: "Reduser møtetid med 40% gjennom smart automatisering"
- If including an image, write descriptive alt text for AI generation`,
    summary_with_stats: `- Use 2-4 stat_blocks for key metrics (NEVER more than 4 - causes overflow)
- Values should be short (e.g., "95%", "180", "1.2M NOK")
- Labels should clearly identify what's measured
- Text block should provide context for the statistics`,
    hero_stats: `- Hero image should be impactful and relevant to the content
- Use 2-4 stat_blocks for prominent key metrics (NEVER more than 4 - causes overflow)
- Values should be large, impressive numbers
- Great for opening slides showing company growth or achievements`,
    split_with_callouts: `- Image should be professional and relevant - write detailed alt text for AI generation
- Use icon_cards (not bullets) for callout content - they look much better
- ALWAYS include bgColor for each icon_card - use: pink, purple, cyan (rotate)
- Keep callout titles short (2-4 words)
- Descriptions MUST be 25-100 characters with specific benefits
- Great for showcasing 2-4 features, benefits, or key points alongside an image`,
    person_spotlight: `- Use for team introductions, quotes, or testimonials
- Include clear title/role and relevant details
- Bullets work great for bio points or achievements
- Image should be professional portrait (or descriptive alt for AI)`,
  };

  return guidance[slideType] ?? "- Be clear, specific, and engaging";
}

/**
 * Get block structure for a slide type
 */
function getBlockStructure(slideType: SlideType): string {
  // NOTE: All examples use Norwegian to guide AI towards Norwegian output
  const structures: Record<SlideType, string> = {
    cover: `[
  { "kind": "title", "text": "Hovedtittel" },
  { "kind": "text", "text": "Undertittel eller dato" }
]`,
    agenda: `[
  { "kind": "title", "text": "Agenda" },
  { "kind": "bullets", "items": ["Punkt 1", "Punkt 2", ...] }
]`,
    section_header: `[
  { "kind": "title", "text": "Seksjonstittel" },
  { "kind": "text", "text": "Valgfri undertittel" }
]`,
    bullets: `[
  { "kind": "title", "text": "Slidetittel" },
  { "kind": "bullets", "items": ["Punkt 1", "Punkt 2", "Punkt 3", ...] }
]`,
    two_column_text: `[
  { "kind": "title", "text": "Slidetittel" },
  { "kind": "text", "text": "Venstre kolonne innhold" },
  { "kind": "text", "text": "Høyre kolonne innhold" }
]`,
    text_plus_image: `[
  { "kind": "title", "text": "Slidetittel" },
  { "kind": "text", "text": "Hovedtekstinnhold" },
  { "kind": "image", "url": "", "alt": "Bildebeskrivelse for AI-generering" }
]`,
    decisions_list: `[
  { "kind": "title", "text": "Beslutninger" },
  { "kind": "bullets", "items": ["Beslutning 1: ...", "Beslutning 2: ...", ...] }
]`,
    action_items_table: `[
  { "kind": "title", "text": "Oppgaveliste" },
  { "kind": "table", "columns": ["Oppgave", "Ansvarlig", "Frist"], "rows": [["Oppgave 1", "Person", "Dato"], ...] }
]`,
    summary_next_steps: `[
  { "kind": "title", "text": "Neste steg" },
  { "kind": "bullets", "items": ["Steg 1", "Steg 2", ...] }
]`,
    quote_callout: `[
  { "kind": "callout", "text": "Sitat eller viktig budskap", "style": "quote" },
  { "kind": "text", "text": "Kilde eller referanse" }
]`,
    timeline_roadmap: `[
  { "kind": "title", "text": "Prosjektplan" },
  { "kind": "timeline_step", "step": 1, "text": "Fase 1: Planlegging", "description": "Kartlegging og forberedelser", "status": "completed" },
  { "kind": "timeline_step", "step": 2, "text": "Fase 2: Utvikling", "description": "Implementering av løsningen", "status": "current" },
  { "kind": "timeline_step", "step": 3, "text": "Fase 3: Utrulling", "description": "Lansering og oppfølging", "status": "upcoming" }
]`,
    numbered_grid: `[
  { "kind": "title", "text": "Våre kjerneverdier" },
  { "kind": "numbered_card", "number": 1, "text": "Første konsept", "description": "Beskrivelse av første konsept" },
  { "kind": "numbered_card", "number": 2, "text": "Andre konsept", "description": "Beskrivelse av andre konsept" },
  { "kind": "numbered_card", "number": 3, "text": "Tredje konsept", "description": "Beskrivelse av tredje konsept" }
]`,
    icon_cards_with_image: `[
  { "kind": "title", "text": "Plattformfunksjoner" },
  { "kind": "icon_card", "icon": "zap", "text": "Lynrask", "description": "Under 100ms responstid", "bgColor": "pink" },
  { "kind": "icon_card", "icon": "shield", "text": "Sikkerhet", "description": "SOC2-sertifisert", "bgColor": "purple" },
  { "kind": "icon_card", "icon": "globe", "text": "Global skala", "description": "20+ datasentre verden over", "bgColor": "blue" },
  { "kind": "image", "url": "", "alt": "Plattform-dashboard forhåndsvisning" }
]`,
    summary_with_stats: `[
  { "kind": "title", "text": "Resultater 2024" },
  { "kind": "text", "text": "Vi overgikk alle nøkkelmål i år med rekordvekst på tvers av alle segmenter." },
  { "kind": "stat_block", "value": "127%", "label": "Omsetningsvekst", "sublabel": "År over år" },
  { "kind": "stat_block", "value": "4,8M", "label": "Aktive brukere", "sublabel": "+52% fra 2023" },
  { "kind": "stat_block", "value": "98,5%", "label": "Oppetid", "sublabel": "Plattformstabilitet" }
]`,
    hero_stats: `[
  { "kind": "image", "url": "", "alt": "Heltebilde for AI-generering" },
  { "kind": "title", "text": "Vår veksthistorie" },
  { "kind": "stat_block", "value": "250%", "label": "Omsetningsvekst" },
  { "kind": "stat_block", "value": "50M+", "label": "Brukere globalt" },
  { "kind": "stat_block", "value": "45", "label": "Land" }
]`,
    split_with_callouts: `[
  { "kind": "title", "text": "Hvorfor velge oss" },
  { "kind": "image", "url": "", "alt": "Profesjonelt bilde av produkt eller team" },
  { "kind": "icon_card", "icon": "zap", "text": "Lynrask", "description": "Under ett sekunds responstid", "bgColor": "pink" },
  { "kind": "icon_card", "icon": "shield", "text": "Sikkerhet", "description": "SOC2 Type II-sertifisert", "bgColor": "purple" },
  { "kind": "icon_card", "icon": "heart", "text": "Kundefokus", "description": "24/7 dedikert support", "bgColor": "cyan" }
]`,
    person_spotlight: `[
  { "kind": "title", "text": "Møt vår leder" },
  { "kind": "image", "url": "", "alt": "Profesjonelt portrett av person" },
  { "kind": "text", "text": "Ola Nordmann, CEO og medgründer" },
  { "kind": "bullets", "items": ["15+ års erfaring i tech-ledelse", "Tidligere VP hos Google", "Kåret til en av Norges fremste ledere"] }
]`,
  };

  return structures[slideType];
}

/**
 * Build system prompt for slide content generation
 */
export function buildContentSystemPrompt(
  outlineSlide: OutlineSlide,
  request: GenerationRequest,
  slideIndex: number,
  totalSlides: number
): string {
  const slideType = outlineSlide.suggestedType ?? "bullets";
  const { textMode, tone, language, additionalInstructions } = request;

  const modeInstructions = {
    generate: "Create engaging, original content that fits the slide theme.",
    condense: "Extract and summarize the most relevant information for this slide.",
    preserve: "Use the original text as much as possible. Only restructure, do not rewrite.",
  };

  const toneInstruction = tone ? `Tone: ${tone}` : "";

  return `You are a presentation slide content generator.

TASK: Generate content for slide ${slideIndex + 1} of ${totalSlides}.

SLIDE INFO:
- Title: "${outlineSlide.title}"
- Type: ${slideType}
- Hints: ${outlineSlide.hints?.join(", ") || "None"}

INSTRUCTIONS:
- ${modeInstructions[textMode]}
- ${toneInstruction}
- Language: ${language === "no" ? "Norwegian (Bokmål)" : language}

CONSTRAINTS FOR ${slideType.toUpperCase()}:
${getConstraintsDescription(slideType)}

REQUIRED BLOCK STRUCTURE:
${getBlockStructure(slideType)}

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure:
{
  "type": "${slideType}",
  "layoutVariant": "default",
  "blocks": [... blocks according to structure above ...]
}

QUALITY REQUIREMENTS:
- Write engaging headlines, not generic titles like "Oversikt" or "Hovedpunkter"
- Use specific numbers, facts, and data from the input when available
- Vary sentence structure for better readability
- Make each point substantial and informative, not vague
- Avoid filler phrases like "Det er viktig å..." or "Vi må fokusere på..."

SLIDE-TYPE SPECIFIC GUIDANCE:
${getSlideTypeGuidance(slideType)}

CRITICAL RULES:
- Stay within character limits - this is absolutely critical
- Actually USE the hints provided - they contain key information to include
- For images, write detailed, descriptive alt text that an AI image generator could use
- Never use placeholder text like "Lorem ipsum", "TODO", or "[SETT INN]"
- Be specific and actionable - avoid generic corporate speak

NORSK GRAMMATIKK - KAPITALISERING (KRITISK):
- Bruk SENTENCE CASE (setningskapitalisering) for ALLE titler og overskrifter
- Kun første ord i setningen skal ha stor bokstav, IKKE hvert ord
- FEIL: "Fem Viktige Punkter For Suksess" (Title Case - engelsk stil)
- RIKTIG: "Fem viktige punkter for suksess" (Sentence case - norsk stil)
- FEIL: "Våre Viktigste Konkurransefortrinn"
- RIKTIG: "Våre viktigste konkurransefortrinn"
- Unntak som SKAL ha stor bokstav: Egennavn (Norge, Microsoft, Oslo), forkortelser (AI, GDPR, KS)
- Dette gjelder titler, undertitler, bullet points, card-titler og alle andre tekstfelt

VISUAL STYLING RULES (IMPORTANT):
- For icon_card blocks, ALWAYS include "bgColor" property
- Available bgColor values: "pink", "purple", "blue", "cyan", "green", "orange"
- Rotate colors for visual variety - don't use the same color twice in a row
- Example: first card "pink", second "purple", third "blue"
- This makes the presentation look premium and professional${
    additionalInstructions
      ? `

USER'S ADDITIONAL INSTRUCTIONS (MUST FOLLOW):
${additionalInstructions}

Apply these instructions to the slide content. They override defaults.`
      : ""
  }`;
}

/**
 * Build user prompt for slide content generation
 */
export function buildContentUserPrompt(
  outlineSlide: OutlineSlide,
  request: GenerationRequest,
  context: string
): string {
  return `Original input/context:
${context}

Generate content for this slide:
Title: ${outlineSlide.title}
${outlineSlide.hints ? `Key points to include: ${outlineSlide.hints.join(", ")}` : ""}`;
}
