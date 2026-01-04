/**
 * Norwegian Sentence Case Converter
 *
 * Converts Title Case text to Norwegian sentence case.
 * In Norwegian, only the first word of a sentence and proper nouns are capitalized.
 *
 * Example:
 *   "Store Endringer og Vedtak i Desember 2025"
 *   → "Store endringer og vedtak i desember 2025"
 */

/**
 * Norwegian acronyms and abbreviations that should stay uppercase
 */
const NORWEGIAN_ACRONYMS = new Set([
  // Common abbreviations
  "AI",
  "GDPR",
  "KS",
  "KA",
  "IT",
  "HR",
  "CEO",
  "CFO",
  "CTO",
  "PR",
  "TV",
  "PC",
  "USB",
  "API",
  "URL",
  "PDF",
  "PPTX",
  // Norwegian specific
  "NAV",
  "NRK",
  "DNB",
  "NSB",
  "SAS",
  "UiO",
  "NTNU",
  "UiB",
  "NOK",
  "SEK",
  "EUR",
  "USD",
  "GBP",
  // Units
  "KWH",
  "CO2",
  "M2",
  "M3",
]);

/**
 * Proper nouns that should keep their capitalization
 * This includes Norwegian place names, organization names, etc.
 */
const PROPER_NOUNS = new Set([
  // Countries
  "Norge",
  "Sverige",
  "Danmark",
  "Finland",
  "Island",
  "Tyskland",
  "Frankrike",
  "Storbritannia",
  "Italia",
  "Spania",
  "Polen",
  "Nederland",
  "Belgia",
  "Europa",
  "Amerika",
  "Asia",
  "Afrika",
  "Australia",
  "Norden",
  // Major Norwegian cities
  "Oslo",
  "Bergen",
  "Trondheim",
  "Stavanger",
  "Kristiansand",
  "Tromsø",
  "Drammen",
  "Fredrikstad",
  "Sandnes",
  "Bodø",
  "Ålesund",
  "Tønsberg",
  "Haugesund",
  "Sandefjord",
  "Moss",
  "Sarpsborg",
  "Skien",
  "Arendal",
  "Gjøvik",
  "Hamar",
  "Lillehammer",
  "Molde",
  "Harstad",
  "Narvik",
  "Alta",
  "Hammerfest",
  "Kirkenes",
  // Other places
  "Melhus",
  "Frogner",
  "Majorstuen",
  "Grünerløkka",
  "Aker",
  "Bærum",
  // Companies/Organizations (common ones)
  "Microsoft",
  "Google",
  "Apple",
  "Amazon",
  "Meta",
  "Facebook",
  "LinkedIn",
  "Equinor",
  "Telenor",
  "Hydro",
  "Yara",
  "Storebrand",
  "Gjensidige",
  "Vipps",
  "Finn",
  "Schibsted",
  "Atea",
  "Visma",
  "Kahoot",
  // Government & public sector
  "Stortinget",
  "Regjeringen",
  "Kirkerådet",
  "Kirkemøtet",
  "Helse",
  "Helseforetaket",
  "Statsforvalteren",
  "Fylkeskommunen",
  // Organizations relevant to the current use case
  "Hovedorganisasjonen",
  "Gravplassforeningen",
  // Days/months (in Norwegian these are lowercase, but might appear capitalized)
  // Not including these as they should be lowercase in Norwegian
]);

/**
 * Words that should always be lowercase (unless first word)
 * These are common Norwegian function words
 */
const ALWAYS_LOWERCASE = new Set([
  // Prepositions
  "i",
  "på",
  "av",
  "til",
  "fra",
  "med",
  "for",
  "om",
  "ved",
  "etter",
  "under",
  "over",
  "mellom",
  "blant",
  "gjennom",
  "mot",
  "hos",
  // Conjunctions
  "og",
  "eller",
  "men",
  "så",
  "da",
  "når",
  "hvis",
  "fordi",
  "at",
  // Articles
  "en",
  "et",
  "ei",
  "den",
  "det",
  "de",
  // Verbs (common ones often incorrectly capitalized)
  "som",
  "er",
  "var",
  "har",
  "hadde",
  "blir",
  "ble",
  "kan",
  "skal",
  "vil",
  "må",
  "bør",
  "ikke",
  // Months (lowercase in Norwegian)
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
  // Days (lowercase in Norwegian)
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
  "søndag",
  // Common words often incorrectly capitalized in titles
  "viktige",
  "viktig",
  "nye",
  "ny",
  "neste",
  "første",
  "andre",
  "tredje",
  "store",
  "stor",
  "små",
  "liten",
  "god",
  "gode",
  "best",
  "beste",
  "fremtiden",
  "fremtid",
  "status",
  "oversikt",
  "oppsummering",
  "punkter",
  "trinn",
  "steg",
  "endringer",
  "vedtak",
  "beslutninger",
]);

/**
 * Check if a word is an acronym (all uppercase, 2+ chars)
 */
function isAcronym(word: string): boolean {
  if (word.length < 2) return false;
  // Remove trailing punctuation for check
  const cleanWord = word.replace(/[.,!?:;]$/, "");
  return cleanWord === cleanWord.toUpperCase() && /^[A-ZÆØÅ]+$/.test(cleanWord);
}

/**
 * Check if a word is a known proper noun
 */
function isProperNoun(word: string): boolean {
  // Remove trailing punctuation for check
  const cleanWord = word.replace(/[.,!?:;]$/, "");
  return PROPER_NOUNS.has(cleanWord);
}

/**
 * Check if a word is a known acronym
 */
function isKnownAcronym(word: string): boolean {
  const cleanWord = word.replace(/[.,!?:;]$/, "").toUpperCase();
  return NORWEGIAN_ACRONYMS.has(cleanWord);
}

/**
 * Check if word starts a new sentence (after . ! ? or :)
 */
function startsNewSentence(words: string[], index: number): boolean {
  if (index === 0) return true;
  const prevWord = words[index - 1];
  return /[.!?:]$/.test(prevWord);
}

/**
 * Convert a single word to sentence case
 */
function convertWord(word: string, isFirstWord: boolean): string {
  if (!word) return word;

  // Preserve punctuation
  const punctuationMatch = word.match(/^(.+?)([.,!?:;]*)$/);
  if (!punctuationMatch) return word;

  const [, cleanWord, punctuation] = punctuationMatch;

  // Keep acronyms uppercase
  if (isAcronym(cleanWord) || isKnownAcronym(cleanWord)) {
    return cleanWord.toUpperCase() + punctuation;
  }

  // Keep proper nouns capitalized
  if (isProperNoun(cleanWord)) {
    return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase() + punctuation;
  }

  // First word of sentence: capitalize
  if (isFirstWord) {
    return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase() + punctuation;
  }

  // Everything else: lowercase
  return cleanWord.toLowerCase() + punctuation;
}

/**
 * Convert a title/text to Norwegian sentence case
 *
 * @param text - The text to convert
 * @returns The text in Norwegian sentence case
 *
 * @example
 * toNorwegianSentenceCase("Store Endringer og Vedtak i Desember 2025")
 * // → "Store endringer og vedtak i desember 2025"
 *
 * toNorwegianSentenceCase("Ny Ledelse i Oslo Kommune")
 * // → "Ny ledelse i Oslo kommune"
 */
export function toNorwegianSentenceCase(text: string): string {
  if (!text) return text;

  // Split into words while preserving whitespace
  const words = text.split(/(\s+)/);

  let wordIndex = 0;
  const result = words.map((segment) => {
    // Preserve whitespace segments
    if (/^\s+$/.test(segment)) {
      return segment;
    }

    const isFirstWord =
      wordIndex === 0 ||
      startsNewSentence(
        words.filter((w) => !/^\s+$/.test(w)),
        wordIndex
      );

    const converted = convertWord(segment, isFirstWord);
    wordIndex++;
    return converted;
  });

  return result.join("");
}

/**
 * Check if text appears to be in Title Case
 * (More than 50% of words start with uppercase)
 */
export function isTitleCase(text: string): boolean {
  if (!text) return false;

  const words = text.split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 2) return false;

  const capitalizedWords = words.filter((word) => {
    const cleanWord = word.replace(/[.,!?:;]$/, "");
    if (cleanWord.length === 0) return false;
    // Skip acronyms
    if (isAcronym(cleanWord)) return false;
    // Check if first letter is uppercase
    return (
      cleanWord.charAt(0) === cleanWord.charAt(0).toUpperCase() &&
      cleanWord.charAt(0) !== cleanWord.charAt(0).toLowerCase()
    );
  });

  // If more than 60% of words are capitalized, it's likely Title Case
  return capitalizedWords.length / words.length > 0.6;
}

/**
 * Convert text to sentence case only if it appears to be in Title Case
 * This is a safer version that won't modify already-correct text
 */
export function fixTitleCaseIfNeeded(text: string): string {
  if (isTitleCase(text)) {
    return toNorwegianSentenceCase(text);
  }
  return text;
}
