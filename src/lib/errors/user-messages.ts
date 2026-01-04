/**
 * User-Friendly Error Messages (Norwegian)
 *
 * Maps technical error codes to user-friendly Norwegian messages
 * with recovery instructions.
 */

import type { ApiErrorCode } from "@/lib/api/errors";

/**
 * User-friendly error message with recovery actions
 */
export interface UserFriendlyError {
  /** Short, clear title in Norwegian */
  title: string;
  /** Detailed explanation of what went wrong */
  message: string;
  /** Suggested recovery actions (optional) */
  recovery?: string[];
  /** Whether the error is likely temporary */
  isTemporary: boolean;
  /** Whether user action can resolve this */
  isUserActionable: boolean;
}

/**
 * API Error Code Mappings
 */
export const API_ERROR_MESSAGES: Record<ApiErrorCode, UserFriendlyError> = {
  INVALID_REQUEST: {
    title: "Ugyldig forespørsel",
    message:
      "Noe gikk galt med forespørselen din. Dette kan skyldes manglende eller ugyldige innstillinger.",
    recovery: [
      "Sjekk at alle obligatoriske felt er fylt ut",
      "Prøv å redusere lengden på teksten",
      "Kontakt support hvis problemet vedvarer",
    ],
    isTemporary: false,
    isUserActionable: true,
  },

  UNAUTHORIZED: {
    title: "Manglende tilgang",
    message:
      "Du mangler tilgang til denne ressursen. API-nøkkelen din kan være ugyldig eller utløpt.",
    recovery: [
      "Sjekk at du er logget inn",
      "Verifiser at API-nøkkelen er korrekt",
      "Kontakt administrator for tilgang",
    ],
    isTemporary: false,
    isUserActionable: true,
  },

  FORBIDDEN: {
    title: "Ingen tilgang",
    message: "Du har ikke tillatelse til å utføre denne handlingen.",
    recovery: ["Sjekk at du har riktige tilganger", "Kontakt workspace-administrator"],
    isTemporary: false,
    isUserActionable: false,
  },

  NOT_FOUND: {
    title: "Fant ikke ressursen",
    message: "Den forespurte ressursen finnes ikke eller har blitt slettet.",
    recovery: [
      "Sjekk at lenken er korrekt",
      "Gå tilbake til startsiden",
      "Kontakt support hvis du mener dette er en feil",
    ],
    isTemporary: false,
    isUserActionable: false,
  },

  RATE_LIMITED: {
    title: "For mange forespørsler",
    message: "Du har sendt for mange forespørsler på kort tid. Vent litt før du prøver igjen.",
    recovery: [
      "Vent 1-2 minutter før du prøver igjen",
      "Oppgrader til høyere plan for flere forespørsler",
    ],
    isTemporary: true,
    isUserActionable: true,
  },

  MODEL_ERROR: {
    title: "AI-tjenesten er midlertidig utilgjengelig",
    message: "AI-tjenesten opplevde en feil under generering. Dette er som regel midlertidig.",
    recovery: [
      "Prøv igjen om noen sekunder",
      "Forenkle eller kort ned teksten",
      "Kontakt support hvis problemet vedvarer",
    ],
    isTemporary: true,
    isUserActionable: true,
  },

  INTERNAL_ERROR: {
    title: "Noe gikk galt",
    message:
      "En uventet feil oppstod på serveren. Teamet vårt er varslet og jobber med å løse problemet.",
    recovery: [
      "Prøv igjen om noen minutter",
      "Last siden på nytt",
      "Kontakt support hvis problemet vedvarer",
    ],
    isTemporary: true,
    isUserActionable: true,
  },
};

/**
 * Pipeline Error Code Mappings
 */
type PipelineErrorCode =
  | "OUTLINE_FAILED"
  | "CONTENT_FAILED"
  | "VALIDATION_FAILED"
  | "REPAIR_FAILED"
  | "MAX_RETRIES"
  | "TEMPLATE_NOT_FOUND"
  | "TEMPLATE_GENERATION_FAILED";

export const PIPELINE_ERROR_MESSAGES: Record<PipelineErrorCode, UserFriendlyError> = {
  OUTLINE_FAILED: {
    title: "Kunne ikke lage outline",
    message:
      "AI-en klarte ikke å lage en outline basert på teksten din. Prøv å omformulere eller forenkle.",
    recovery: [
      "Forenkle eller kort ned teksten",
      "Vær mer spesifikk om hva presentasjonen skal handle om",
      "Prøv igjen med færre slides",
    ],
    isTemporary: false,
    isUserActionable: true,
  },

  CONTENT_FAILED: {
    title: "Kunne ikke generere innhold",
    message:
      "AI-en klarte ikke å generere innhold for én eller flere slides. Dette kan skyldes kompleks tekst eller manglende informasjon.",
    recovery: [
      "Prøv igjen med enklere tekst",
      "Legg til mer kontekst i teksten",
      "Reduser antall slides",
    ],
    isTemporary: false,
    isUserActionable: true,
  },

  VALIDATION_FAILED: {
    title: "Valideringsfeil",
    message:
      "Det genererte innholdet oppfyller ikke kvalitetskravene. Dette kan skyldes for mye eller for lite innhold.",
    recovery: [
      "Prøv igjen – AI-en kan gi bedre resultat ved neste forsøk",
      "Juster tekstmengden i innstillingene",
    ],
    isTemporary: true,
    isUserActionable: true,
  },

  REPAIR_FAILED: {
    title: "Kunne ikke reparere innhold",
    message:
      "AI-en klarte ikke å tilpasse innholdet til slide-formatene. Teksten kan være for lang eller kompleks.",
    recovery: [
      "Kort ned teksten før generering",
      "Øk antall slides for å spre innholdet",
      "Prøv igjen med enklere språk",
    ],
    isTemporary: false,
    isUserActionable: true,
  },

  MAX_RETRIES: {
    title: "For mange forsøk",
    message:
      "Systemet har prøvd flere ganger uten å lykkes. Dette kan skyldes kompleks tekst eller midlertidig ustabilitet i AI-tjenesten.",
    recovery: [
      "Vent 1-2 minutter før du prøver igjen",
      "Forenkle eller kort ned teksten",
      "Kontakt support hvis problemet vedvarer",
    ],
    isTemporary: true,
    isUserActionable: true,
  },

  TEMPLATE_NOT_FOUND: {
    title: "Mal ikke funnet",
    message: "Den valgte malen finnes ikke eller er ugyldig.",
    recovery: ["Velg en annen mal", "Last siden på nytt"],
    isTemporary: false,
    isUserActionable: true,
  },

  TEMPLATE_GENERATION_FAILED: {
    title: "Kunne ikke generere fra mal",
    message: "AI-en klarte ikke å generere innhold basert på den valgte malen.",
    recovery: [
      "Prøv en annen mal",
      "Legg til mer kontekst i teksten",
      "Prøv igjen om noen sekunder",
    ],
    isTemporary: true,
    isUserActionable: true,
  },
};

/**
 * LLM Error Code Mappings
 */
type LLMErrorCode = "MODEL_ERROR" | "INVALID_RESPONSE" | "RATE_LIMITED" | "PARSE_ERROR";

export const LLM_ERROR_MESSAGES: Record<LLMErrorCode, UserFriendlyError> = {
  MODEL_ERROR: {
    title: "AI-modellen er utilgjengelig",
    message:
      "AI-modellen opplevde en feil. Dette er som regel midlertidig og løser seg innen kort tid.",
    recovery: ["Prøv igjen om 30 sekunder", "Kontakt support hvis problemet vedvarer"],
    isTemporary: true,
    isUserActionable: true,
  },

  INVALID_RESPONSE: {
    title: "Ugyldig svar fra AI",
    message:
      "AI-en returnerte et svar som ikke kunne tolkes. Dette kan skyldes ustabilitet i AI-tjenesten.",
    recovery: [
      "Prøv igjen – neste forsøk vil trolig lykkes",
      "Forenkle teksten hvis problemet vedvarer",
    ],
    isTemporary: true,
    isUserActionable: true,
  },

  RATE_LIMITED: {
    title: "Rate limit nådd",
    message: "Du har sendt for mange forespørsler til AI-tjenesten. Vent litt før du prøver igjen.",
    recovery: ["Vent 1-2 minutter før du prøver igjen"],
    isTemporary: true,
    isUserActionable: true,
  },

  PARSE_ERROR: {
    title: "Kunne ikke tolke AI-svar",
    message:
      "Svaret fra AI-en kunne ikke tolkes. Dette skyldes som regel en midlertidig feil i AI-tjenesten.",
    recovery: ["Prøv igjen om noen sekunder", "Kontakt support hvis problemet vedvarer"],
    isTemporary: true,
    isUserActionable: true,
  },
};

/**
 * Get user-friendly error message for any error code
 */
export function getUserFriendlyError(
  code: ApiErrorCode | PipelineErrorCode | LLMErrorCode
): UserFriendlyError {
  // Check API errors first
  if (code in API_ERROR_MESSAGES) {
    return API_ERROR_MESSAGES[code as ApiErrorCode];
  }

  // Check pipeline errors
  if (code in PIPELINE_ERROR_MESSAGES) {
    return PIPELINE_ERROR_MESSAGES[code as PipelineErrorCode];
  }

  // Check LLM errors
  if (code in LLM_ERROR_MESSAGES) {
    return LLM_ERROR_MESSAGES[code as LLMErrorCode];
  }

  // Fallback for unknown errors
  return {
    title: "Noe gikk galt",
    message: "En uventet feil oppstod. Vennligst prøv igjen eller kontakt support.",
    recovery: ["Prøv igjen", "Last siden på nytt", "Kontakt support"],
    isTemporary: true,
    isUserActionable: true,
  };
}

/**
 * Check if error code indicates a temporary issue
 */
export function isTemporaryError(code: ApiErrorCode | PipelineErrorCode | LLMErrorCode): boolean {
  const error = getUserFriendlyError(code);
  return error.isTemporary;
}

/**
 * Check if user can take action to resolve error
 */
export function isUserActionable(code: ApiErrorCode | PipelineErrorCode | LLMErrorCode): boolean {
  const error = getUserFriendlyError(code);
  return error.isUserActionable;
}
