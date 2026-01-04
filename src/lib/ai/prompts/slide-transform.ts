/**
 * Slide Transform Prompts
 *
 * Prompts for AI-driven slide transformations.
 * Used by SlideTransformAgent for operations like simplify, expand, translate.
 */

import type { SlideType } from "@/lib/schemas/slide";
import { BLOCK_CONSTRAINTS } from "@/lib/editor/constraints";

// ============================================================================
// Constraint Formatting
// ============================================================================

/**
 * Get formatted constraints for a slide type
 */
export function getConstraintsForSlideType(slideType: SlideType): string {
  const constraints: string[] = [];

  // Common constraints
  constraints.push(`- Tittel: maks ${BLOCK_CONSTRAINTS.title.maxChars} tegn`);
  constraints.push(`- Tekst: maks ${BLOCK_CONSTRAINTS.text.maxChars} tegn`);
  constraints.push(
    `- Punktliste: ${BLOCK_CONSTRAINTS.bullets.minItems}-${BLOCK_CONSTRAINTS.bullets.maxItems} punkter, maks ${BLOCK_CONSTRAINTS.bullets.maxItemChars} tegn per punkt`
  );
  constraints.push(`- Callout: maks ${BLOCK_CONSTRAINTS.callout.maxChars} tegn`);
  constraints.push(
    `- Tabell: maks ${BLOCK_CONSTRAINTS.table.maxColumns} kolonner, ${BLOCK_CONSTRAINTS.table.maxRows} rader`
  );

  // Add type-specific constraints
  switch (slideType) {
    case "bullets":
      constraints.push(
        `\nDenne slide-typen fokuserer på punktlister. Hold punktene konsise.`
      );
      break;
    case "text_plus_image":
      constraints.push(
        `\nDenne slide-typen kombinerer tekst og bilde. Hold teksten kort og visuelt balansert.`
      );
      break;
    case "summary_with_stats":
      constraints.push(
        `\nDenne slide-typen bruker statistikk-blokker. Hold verdier under ${BLOCK_CONSTRAINTS.stat_block.maxValueChars} tegn.`
      );
      break;
    case "timeline_roadmap":
      constraints.push(
        `\nDenne slide-typen viser tidslinje. Hold steg-titler under ${BLOCK_CONSTRAINTS.timeline_step.maxTitleChars} tegn.`
      );
      break;
  }

  return constraints.join("\n");
}

// ============================================================================
// System Prompts
// ============================================================================

/**
 * Build system prompt for slide transformation
 */
export function buildTransformSystemPrompt(slideType: SlideType): string {
  return `Du er en ekspert på presentasjonsdesign og innholdsredigering.
Din oppgave er å transformere slides basert på brukerens instruksjoner.

VIKTIGE REGLER:
1. Behold slide-type: ${slideType} - IKKE endre typen
2. Respekter ALLE constraints for denne slide-typen
3. Returner kun gyldig JSON som matcher Slide-schema
4. Innholdsblokker (text, bullets, callout) KAN konverteres mellom hverandre hvis instruksjonen ber om det
5. Bruk norsk bokmål i alt innhold (med mindre oversettelse er bedt om)
6. Behold eksisterende bilder (image blocks) uendret
7. Behold block IDs hvis de finnes
8. Bruk KUN gyldige block "kind" verdier fra listen under
9. IKKE legg til eller fjern blokker - behold samme antall blokker

VIKTIG OM BLOCK KINDS:
- Innholdsblokker kan konverteres: "text" ↔ "bullets" ↔ "callout"
- Ved konvertering fra "text" til "bullets": Lag et items-array med 3-6 konsise punkter
- Ved konvertering fra "bullets" til "text": Kombiner items til sammenhengende tekst
- IKKE endre strukturelle blokker: "title", "image", "table", "stat_block", etc.

GYLDIGE BLOCK KINDS (bruk NØYAKTIG disse verdiene):
- "title": { kind: "title", text: string }
- "text": { kind: "text", text: string }
- "bullets": { kind: "bullets", items: string[] }
- "image": { kind: "image", url: string, alt: string, cropMode?: string }
- "table": { kind: "table", headers: string[], rows: string[][] }
- "callout": { kind: "callout", text: string, variant?: string }
- "stat_block": { kind: "stat_block", value: string, label: string, trend?: object }
- "timeline_step": { kind: "timeline_step", title: string, description: string }
- "icon_card": { kind: "icon_card", icon: string, title: string, description: string }
- "numbered_card": { kind: "numbered_card", number: number, title: string, description: string }

VIKTIG: Du kan IKKE finne på nye block kinds. Bruk KUN verdiene over.
Hvis du vil konvertere tekst til punkter, bruk "bullets" (ikke "bullet_list" eller lignende).
Hvis du vil legge til statistikk, bruk "stat_block" (ikke "stats" eller "statistic").

CONSTRAINTS FOR ${slideType.toUpperCase()}:
${getConstraintsForSlideType(slideType)}

OUTPUT FORMAT:
Returner et JSON-objekt med denne strukturen:
{
  "slide": { <transformert slide objekt> },
  "changes": [
    {
      "blockIndex": <nummer>,
      "field": "<felt som ble endret>",
      "oldValue": "<original verdi (forkortet)>",
      "newValue": "<ny verdi (forkortet)>"
    }
  ],
  "explanation": "<kort forklaring på norsk om hva som ble endret og hvorfor>"
}

VIKTIG: "slide" må være et komplett, gyldig Slide-objekt med type, layoutVariant (hvis den fantes), og blocks array.`;
}

/**
 * Build user prompt for slide transformation
 */
export function buildTransformUserPrompt(
  slide: unknown,
  instruction: string
): string {
  return `Slide å transformere:
\`\`\`json
${JSON.stringify(slide, null, 2)}
\`\`\`

Instruksjon: ${instruction}

Transform sliden i henhold til instruksjonen. Husk å respektere alle constraints.`;
}

// ============================================================================
// Predefined Transformations
// ============================================================================

/**
 * Instructions for predefined transformations
 */
export const TRANSFORM_INSTRUCTIONS = {
  simplify: `Forenkle innholdet:
- Gjør teksten kortere og mer konsis
- Fjern unødvendige ord og fyllord
- Behold hovedpoengene og kjerneinformasjonen
- Bruk enklere setningsstrukturer
- Mål: Reduser lengden med 20-40% uten å miste meningsinnhold`,

  expand: `Utvid innholdet med mer detaljer:
- Legg til mer kontekst og utdyp eksisterende poenger
- Legg til eksempler der det passer
- KRITISK: RESPEKTER ALLTID MAKS-GRENSENE FOR HVER BLOKK-TYPE:
  * text: maks 500 tegn
  * bullets: maks 150 tegn per punkt
  * callout: maks 300 tegn
  * numbered_card description: maks 150 tegn
  * icon_card description: maks 150 tegn
  * stat_block label: maks 50 tegn
- Hvis innholdet allerede er nær grensen, IKKE utvid mer
- Mål: Utvid KUN hvis det er plass innenfor constraints
- Prioriter kvalitet over kvantitet - bedre å være konsis enn å overskride grenser`,

  professional: `Gjør språket mer profesjonelt:
- Bruk formelt, profesjonelt språk
- Erstatt uformelle uttrykk med fagspråk
- Skriv i tredjeperson der det passer
- Behold presis, klar kommunikasjon
- Unngå slang og dagligtale`,

  casual: `Gjør språket mer uformelt:
- Bruk hverdagslig, tilgjengelig språk
- Gjør teksten mer personlig og vennlig
- Forenkle komplekse uttrykk
- Behold klar kommunikasjon
- Unngå for mye fagsjargong`,

  visualize: `Gjør innholdet mer visuelt og skannbart:
- SPESIELL REGEL: For "visualize" KAN du konvertere "text" blokker til "bullets" blokker
- Konverter lange tekstavsnitt til punktlister med 3-6 konsise punkter
- Trekk ut nøkkelinformasjon og presenter som tydelige bullet points
- Behold tittelblokker og bildeblokker uendret
- Prioriter skannbarhet og lesbarhet
- Hvert punkt bør være kort (under 100 tegn) og innholdsrikt
- Bruk KUN gyldige block kinds: "text", "bullets", "callout"
- IKKE bruk markdown-formatering (* eller **) i teksten
- VIKTIG: Returner items som string[] array for bullets-blokker`,

  translate_en: `Oversett alt innhold til engelsk:
- Oversett all tekst fra norsk til engelsk
- Behold samme struktur og formatering
- Bruk naturlig, idiomatisk engelsk
- Behold fagtermer der de er universelle
- Mål: Profesjonell, flytende engelsk oversettelse`,

  translate_no: `Oversett alt innhold til norsk:
- Oversett all tekst fra engelsk til norsk bokmål
- Behold samme struktur og formatering
- Bruk naturlig, idiomatisk norsk
- Oversett fagtermer der norske alternativer finnes
- Mål: Profesjonell, flytende norsk oversettelse`,
} as const;

export type TransformationType = keyof typeof TRANSFORM_INSTRUCTIONS;

/**
 * Get instruction for a predefined transformation type
 */
export function getTransformInstruction(type: TransformationType): string {
  return TRANSFORM_INSTRUCTIONS[type];
}
