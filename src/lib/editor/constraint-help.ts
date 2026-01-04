/**
 * Constraint Violation Help Text
 *
 * Context-aware help messages for constraint violations.
 * Provides explanations for why constraints exist and what users can do.
 */

import type { ConstraintViolation } from "./types";
import type { BlockKind } from "@/lib/schemas/block";

export interface ConstraintHelpText {
  /** Short explanation (tooltip-friendly) */
  explanation: string;
  /** Why this constraint exists */
  reason: string;
  /** Suggested actions */
  suggestions: string[];
}

/**
 * Get context-aware help text for a constraint violation.
 * Returns explanation of why constraint exists and how to fix it.
 */
export function getConstraintHelp(
  violation: ConstraintViolation,
  blockKind?: BlockKind
): ConstraintHelpText {
  const { type, current, max } = violation;

  // Generic help based on violation type
  switch (type) {
    case "max_chars":
      return {
        explanation: "Teksten er for lang til å vises pent på slide.",
        reason:
          "Lange tekster blir vanskelig å lese i presentasjoner og kan ikke vises fullstendig på skjermen.",
        suggestions: [
          "Bruk AI-knappen for å automatisk korte ned teksten",
          "Flytt noe innhold til en ny slide (del i to)",
          "Fjern mindre viktige detaljer manuelt",
        ],
      };

    case "max_items":
      return {
        explanation: `For mange punkter (${current}/${max}) – blir uleselig på slide.`,
        reason:
          "Slides med mange punkter blir rotete og vanskelig å fokusere på. Best praksis er maks 5-6 punkter per slide.",
        suggestions: [
          'Del punktene over flere slides (bruk "Del i to")',
          "Slå sammen relaterte punkter til færre, bredere punkter",
          "Flytt mindre viktige punkter til notater eller appendiks",
        ],
      };

    case "max_rows":
      return {
        explanation: `For mange rader (${current}/${max}) – tabellen blir for liten til å leses.`,
        reason: "Tabeller med mange rader må krympes så mye at teksten blir uleselig på skjerm.",
        suggestions: [
          "Del tabellen over flere slides",
          "Vis kun de viktigste radene (topp 5-10)",
          "Bruk et visuelt chart i stedet (f.eks. søylediagram)",
        ],
      };

    case "overflow":
      return {
        explanation: `Verdien (${current}) overskrider grensen (${max}).`,
        reason: "Denne verdien må holdes innenfor definerte grenser for å sikre korrekt visning.",
        suggestions: ["Reduser verdien til maks ${max}", "Sjekk om verdien er korrekt"],
      };

    default:
      return {
        explanation: "Innholdet bryter med slide-begrensninger.",
        reason:
          "For å sikre god lesbarhet og profesjonelt utseende må innholdet holdes innenfor visse grenser.",
        suggestions: ["Bruk AI-verktøyene for å automatisk fikse", "Rediger innholdet manuelt"],
      };
  }
}

/**
 * Get block-kind-specific help for "Hvorfor har denne sliden begrensninger?"
 */
export function getBlockKindHelp(kind: BlockKind): string {
  switch (kind) {
    case "title":
      return "Titler må være korte og konsise for å fungere som overskrifter. Lange titler mister impact og blir vanskelig å lese raskt.";

    case "text":
      return 'Tekstblokker begrenses for å unngå "wall of text" som er vanskelig å lese på skjerm. Bruk flere slides for lengre innhold.';

    case "callout":
      return "Callouts skal fremheve nøkkelpunkter kort og tydelig. Lange callouts mister sin effekt.";

    case "bullets":
      return "Punktlister fungerer best med 3-6 punkter. Flere punkter gjør slide rotete og publikum mister fokus.";

    case "table":
      return "Tabeller må være oversiktlige på skjerm. Store tabeller blir uleselige selv på stor skjerm – del dem heller opp.";

    case "image":
      return "Bilder skaleres automatisk for best visning på slide.";

    case "stat_block":
      return "Statistikk-kort skal vise nøkkeltall tydelig. Lange verdier eller etiketter blir vanskelig å skanne visuelt.";

    case "timeline_step":
      return "Timeline-steg må være konsise for å vise tydelig progresjon. Lange beskrivelser overvelder visualiseringen.";

    case "icon_card":
      return "Ikon-kort fungerer best med korte titler og beskrivelser for å holde layouten balansert.";

    case "numbered_card":
      return "Nummererte kort skal gi rask oversikt. Lange tekster bryter det visuelle hierarkiet.";

    default:
      return "Denne blokktypen har begrensninger for å sikre god lesbarhet på slide.";
  }
}

/**
 * Get quick action label based on violation severity.
 * Returns "Kort ned" or "Del i to" based on how severe the overflow is.
 */
export function getSuggestedAction(violation: ConstraintViolation): "shorten" | "split" | null {
  const { type, current, max } = violation;

  // Only suggest actions for text/item overflow
  if (type !== "max_chars" && type !== "max_items") {
    return null;
  }

  const overage = current - max;
  const overagePercent = overage / max;

  // If overage is more than 50% of max, suggest splitting
  if (overagePercent > 0.5) {
    return "split";
  }

  // Otherwise suggest shortening
  return "shorten";
}
