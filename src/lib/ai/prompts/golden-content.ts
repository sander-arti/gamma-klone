/**
 * Golden Template Content Prompts
 *
 * AI prompts specifically for generating content within
 * golden template slots. Unlike standard prompts, these:
 * - Never ask AI to choose structure/layout
 * - Have strict character/item constraints per slot
 * - Focus on content quality within fixed boundaries
 */

import type { GoldenSlot, GoldenTemplate } from "@/lib/templates/types";
import type { GenerationRequest } from "@/lib/schemas/deck";

/**
 * Build system prompt for golden slot content generation
 */
export function buildGoldenSlotSystemPrompt(
  template: GoldenTemplate,
  slot: GoldenSlot,
  request: GenerationRequest
): string {
  const { constraints } = slot;
  const language = request.language === "no" ? "norsk" : "English";

  return `Du er en ekspert innholdsforfatter for profesjonelle presentasjoner.

KONTEKST:
- Du fyller slot ${slot.position} av ${template.slideCount} i "${template.name}" template
- Slide-type: ${slot.slideType}
- Formål: ${slot.purpose}

OPPGAVE:
Generer BARE innhold for denne spesifikke sliden. Du bestemmer ALDRI:
- Slide-type (allerede satt til "${slot.slideType}")
- Layout eller struktur (forhåndsdefinert)
- Antall slides (template har fast ${template.slideCount})

STRENGE BEGRENSNINGER:
${constraints.titleMaxChars ? `- Tittel: MAKS ${constraints.titleMaxChars} tegn` : ""}
${constraints.bodyMaxChars ? `- Brødtekst: MAKS ${constraints.bodyMaxChars} tegn` : ""}
${constraints.itemCount ? `- NØYAKTIG ${constraints.itemCount} elementer kreves` : ""}
${constraints.itemCountMin && constraints.itemCountMax ? `- Mellom ${constraints.itemCountMin} og ${constraints.itemCountMax} elementer` : ""}
${constraints.itemMaxChars ? `- Hvert element: MAKS ${constraints.itemMaxChars} tegn` : ""}

KVALITETSKRAV:
- Skriv på ${language}
- Vær konkret og handlingsrettet
- Unngå klisjéer og generiske fraser
- Tilpass til publikum: ${request.audience ?? "profesjonelle beslutningstakere"}
- Tone: ${request.tone ?? "profesjonell og engasjerende"}

${slot.example ? `
EKSEMPEL PÅ FORVENTET FORMAT:
${JSON.stringify(slot.example, null, 2)}
` : ""}

OUTPUT FORMAT:
Returner BARE JSON i følgende format (ingen markdown, ingen forklaringer):
{
  "title": "string",
  "body": "string" (hvis relevant),
  "items": [...] (hvis relevant, som array av objekter med text, value, label, etc.)
}`;
}

/**
 * Build user prompt for golden slot content generation
 */
export function buildGoldenSlotUserPrompt(
  slot: GoldenSlot,
  inputText: string
): string {
  return `BRUKERENS INNHOLD:
---
${inputText}
---

Generer innhold for "${slot.purpose}" basert på teksten over.
Følg begrensningene nøyaktig. Returner kun JSON.`;
}

/**
 * Build stats-specific prompt for GoldenStatsSlide
 */
export function buildGoldenStatsPrompt(
  inputText: string,
  language: string
): string {
  const lang = language === "no" ? "norsk" : "English";

  return `Analyser følgende tekst og trekk ut NØYAKTIG 3 nøkkeltall/statistikker.

TEKST:
---
${inputText}
---

KRAV:
- NØYAKTIG 3 statistikker (ikke 2, ikke 4)
- Hver stat har: value (tallet/prosent), label (kort beskrivelse)
- Verdier skal være konkrete (bruk tall fra teksten eller realistiske estimater)
- Labels på ${lang}, maks 30 tegn
- Vær spesifikk, ikke generell

OUTPUT FORMAT (kun JSON):
{
  "title": "Nøkkeltall",
  "body": "Kort intro på max 100 tegn",
  "items": [
    { "value": "24%", "label": "Økning i salg" },
    { "value": "1.2M", "label": "Aktive brukere" },
    { "value": "98%", "label": "Kundetilfredshet" }
  ]
}`;
}

/**
 * Build bullets-specific prompt for GoldenBulletsSlide
 */
export function buildGoldenBulletsPrompt(
  inputText: string,
  language: string,
  minItems: number = 4,
  maxItems: number = 5
): string {
  const lang = language === "no" ? "norsk" : "English";

  return `Oppsummer følgende tekst i ${minItems}-${maxItems} konsise punkter.

TEKST:
---
${inputText}
---

KRAV:
- Mellom ${minItems} og ${maxItems} punkter
- Hvert punkt maks 80 tegn
- Start hvert punkt med et handlingsverb når mulig
- Vær konkret og spesifikk
- Skriv på ${lang}

OUTPUT FORMAT (kun JSON):
{
  "title": "Viktige funn",
  "items": [
    { "text": "Punkt 1 her" },
    { "text": "Punkt 2 her" },
    { "text": "Punkt 3 her" },
    { "text": "Punkt 4 her" }
  ]
}`;
}

/**
 * Build cover-specific prompt for GoldenCoverSlide
 */
export function buildGoldenCoverPrompt(
  inputText: string,
  language: string
): string {
  const lang = language === "no" ? "norsk" : "English";

  return `Lag en kraftfull presentasjonstittel basert på følgende innhold.

TEKST:
---
${inputText}
---

KRAV:
- Tittel: maks 60 tegn, engasjerende og profesjonell
- Undertittel: maks 120 tegn, utdyp hovedpoenget
- Skriv på ${lang}
- Unngå klisjéer som "Den ultimate guiden" eller lignende

OUTPUT FORMAT (kun JSON):
{
  "title": "Kraftfull tittel her",
  "body": "Kort undertittel som fanger essensen"
}`;
}

/**
 * Build CTA-specific prompt for GoldenCTASlide
 */
export function buildGoldenCTAPrompt(
  inputText: string,
  language: string
): string {
  const lang = language === "no" ? "norsk" : "English";

  return `Lag en avsluttende "call to action" slide basert på innholdet.

TEKST:
---
${inputText}
---

KRAV:
- Tittel: maks 40 tegn, handlingsrettet
- Undertittel: maks 200 tegn, oppsummer neste steg
- 2-3 konkrete handlingspunkter
- Hvert punkt maks 60 tegn
- Skriv på ${lang}

OUTPUT FORMAT (kun JSON):
{
  "title": "Neste steg",
  "body": "La oss ta dette videre sammen",
  "items": [
    { "text": "Godkjenn strategiplan innen fredag" },
    { "text": "Planlegg oppfølgingsmøte" }
  ]
}`;
}

/**
 * Build content-specific prompt for GoldenContentSlide (60/40 split)
 */
export function buildGoldenContentPrompt(
  inputText: string,
  language: string,
  purpose: string
): string {
  const lang = language === "no" ? "norsk" : "English";

  return `Lag hovedinnhold for en split-slide (tekst + bilde).

FORMÅL: ${purpose}

TEKST:
---
${inputText}
---

KRAV:
- Tittel: maks 50 tegn
- Brødtekst: maks 300 tegn, et sammenhengende avsnitt
- Skriv på ${lang}
- Fokuser på hovedbudskapet
- Beskriv også hvilket bilde som passer (for AI-generering)

OUTPUT FORMAT (kun JSON):
{
  "title": "Hovedoverskrift",
  "body": "Brødtekst som forklarer hovedpoenget på en engasjerende måte...",
  "imageDescription": "Profesjonelt bilde av teamarbeid i moderne kontor"
}`;
}
