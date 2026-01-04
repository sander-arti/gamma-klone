/**
 * Content Analysis - Regex-basert ekstraksjon av nøkkelinnhold
 *
 * Dette er en lettvekts, deterministisk analysator som kjører
 * UTEN LLM-kall. Den bruker regex/heuristikker for å finne:
 * - Tall og statistikk
 * - Sitater (tekst i anførselstegn)
 * - Action items (verb + objekt mønstre)
 * - Beslutninger (bestemte/vedtatt/godkjent mønstre)
 */

/**
 * A step in a sequential process
 */
export interface ProcessStep {
  order: number;
  text: string;
}

/**
 * A comparison between two concepts
 */
export interface Comparison {
  left: string;
  right: string;
  basis?: string;
}

/**
 * A feature with title and description
 */
export interface Feature {
  title: string;
  description: string;
}

export interface ContentAnalysis {
  keyMessages: string[]; // Viktigste punkter (første setning i avsnitt)
  quotes: string[]; // Sitater fra teksten ("...")
  decisions: string[]; // Beslutninger/vedtak
  actionItems: string[]; // Handlingspunkter
  statistics: string[]; // Tall og data (%, NOK, M, etc.)
  topics: string[]; // Hovedtemaer (overskrifter/nøkkelord)
  wordCount: number; // For å estimere deck-lengde
  suggestedSlideCount: number; // Anbefalt antall slides

  // Sprint 5: Nye felter for intelligent layout
  sequentialProcess: ProcessStep[]; // Sekvensielle steg (1., 2., 3. eller "først", "deretter")
  comparisons: Comparison[]; // Sammenligninger (vs, kontra, før/etter)
  features: Feature[]; // Features med beskrivelser
  hasRoadmap: boolean; // Indikerer om teksten beskriver en tidslinje/plan
}

/**
 * Analyser input-tekst og ekstraher nøkkelinnhold
 */
export function analyzeContent(inputText: string): ContentAnalysis {
  const text = inputText.trim();

  return {
    keyMessages: extractKeyMessages(text),
    quotes: extractQuotes(text),
    decisions: extractDecisions(text),
    actionItems: extractActionItems(text),
    statistics: extractStatistics(text),
    topics: extractTopics(text),
    wordCount: text.split(/\s+/).filter(Boolean).length,
    suggestedSlideCount: estimateSlideCount(text),

    // Sprint 5: Nye ekstraksjoner for intelligent layout
    sequentialProcess: extractSequentialProcess(text),
    comparisons: extractComparisons(text),
    features: extractFeatures(text),
    hasRoadmap: detectRoadmap(text),
  };
}

/**
 * Ekstraher første setning fra hvert avsnitt
 */
function extractKeyMessages(text: string): string[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
  return paragraphs
    .map((p) => {
      const firstSentence = p.split(/[.!?]/)[0]?.trim();
      return firstSentence;
    })
    .filter((s): s is string => Boolean(s) && s.length > 10)
    .slice(0, 5);
}

/**
 * Finn tekst i anførselstegn (norske og engelske)
 */
function extractQuotes(text: string): string[] {
  const quoteRegex = /["«"']([^"»"']+)["»"']/g;
  const matches = [...text.matchAll(quoteRegex)];
  return matches
    .map((m) => m[1].trim())
    .filter((q) => q.length > 10 && q.length < 200)
    .slice(0, 3);
}

/**
 * Finn beslutninger/vedtak basert på norske nøkkelord
 */
function extractDecisions(text: string): string[] {
  const patterns = [
    /(?:besluttet|vedtatt|godkjent|bestemt|valgt|konkludert)\s*(?:å|at|med)?\s*([^.!?\n]+)/gi,
    /beslutning:\s*([^.!?\n]+)/gi,
    /vedtak:\s*([^.!?\n]+)/gi,
    /konklusjon:\s*([^.!?\n]+)/gi,
  ];

  const decisions: string[] = [];
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    decisions.push(...matches.map((m) => m[1].trim()).filter(Boolean));
  }
  return [...new Set(decisions)].filter((d) => d.length > 5 && d.length < 150).slice(0, 5);
}

/**
 * Finn handlingspunkter basert på modalverb og bullet points
 */
function extractActionItems(text: string): string[] {
  const patterns = [
    // Norske modalverb
    /(?:må|skal|bør|vil|trenger å)\s+([^.!?\n]+)/gi,
    // Eksplisitte action items
    /(?:action|oppgave|todo|aksjonspunkt):\s*([^.!?\n]+)/gi,
    // Bullet points som starter med verb
    /^[-•*]\s*([A-ZÆØÅ][^.!?\n]+)$/gm,
  ];

  const items: string[] = [];
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    items.push(...matches.map((m) => m[1]?.trim()).filter(Boolean));
  }
  return [...new Set(items)].filter((i) => i && i.length > 5 && i.length < 100).slice(0, 6);
}

/**
 * Finn tall og statistikk (prosent, valuta, mengder)
 */
function extractStatistics(text: string): string[] {
  const patterns = [
    // Prosent
    /\d+(?:[,.]\d+)?\s*(?:%|prosent)/gi,
    // Norske kroner
    /\d+(?:[,.]\d+)?\s*(?:MNOK|BNOK|millioner?(?:\s+kroner)?|milliarder?(?:\s+kroner)?|kr|NOK)/gi,
    // Internasjonale valutaer
    /(?:USD|EUR|€|\$)\s*\d+(?:[,.]\d+)?(?:\s*(?:million|billion|M|B))?/gi,
    // Vekst/endring
    /(?:økte?|redusert?|vokste?|falt?|steg|gikk (?:opp|ned))\s*(?:med\s*)?\d+(?:[,.]\d+)?(?:\s*%)?/gi,
    // Antall (ansatte, brukere, kunder)
    /\d+(?:\s*(?:\d{3}))?\s*(?:ansatte|brukere|kunder|enheter|medlemmer|deltakere)/gi,
    // År-over-år, Q-tall
    /(?:Q[1-4]|H[12])\s*\d{4}/gi,
  ];

  const stats: string[] = [];
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    stats.push(...matches.map((m) => m[0].trim()));
  }
  return [...new Set(stats)].slice(0, 8);
}

/**
 * Finn hovedtemaer (overskrifter, nøkkelord med stor bokstav)
 */
function extractTopics(text: string): string[] {
  // Finn linjer som ser ut som overskrifter
  const patterns = [
    // Markdown-overskrifter
    /^#{1,3}\s*(.+)$/gm,
    // Linjer som er korte og starter med stor bokstav (potensielle overskrifter)
    /^([A-ZÆØÅ][A-Za-zæøåÆØÅ\s-]{5,50})$/gm,
    // Tall-nummererte seksjoner
    /^\d+\.\s*([A-ZÆØÅ][^.!?\n]{5,50})$/gm,
  ];

  const topics: string[] = [];
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    topics.push(...matches.map((m) => m[1].trim()));
  }

  return [...new Set(topics)]
    .filter((t) => !t.includes("http") && t.length > 3 && t.length < 60)
    .slice(0, 5);
}

/**
 * Estimer antall slides basert på innholdsmengde
 */
function estimateSlideCount(text: string): number {
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Tommelfingerregel: 100-150 ord per slide for content
  const baseCount = Math.ceil(wordCount / 120);

  // Legg til 2 for cover + summary
  const withStructure = baseCount + 2;

  // Clamp mellom 4 og 15
  return Math.max(4, Math.min(15, withStructure));
}

// =============================================================================
// Sprint 5: Nye ekstraksjons-funksjoner for intelligent layout
// =============================================================================

/**
 * Ekstraher sekvensielle steg fra teksten (nummererte lister, fase-beskrivelser)
 */
function extractSequentialProcess(text: string): ProcessStep[] {
  const steps: ProcessStep[] = [];

  // Mønster 1: Nummererte steg (1. 2. 3.)
  const numberedPattern = /^(\d+)\.\s*(.+)$/gm;
  let match;
  while ((match = numberedPattern.exec(text)) !== null) {
    const order = parseInt(match[1], 10);
    const stepText = match[2].trim();
    if (stepText.length > 5 && stepText.length < 150) {
      steps.push({ order, text: stepText });
    }
  }

  // Mønster 2: Fase-basert (Fase 1:, Phase 1:, Steg 1:)
  const phasePattern = /(?:fase|phase|steg|step)\s*(\d+)\s*[:\-–]\s*(.+)/gi;
  while ((match = phasePattern.exec(text)) !== null) {
    const order = parseInt(match[1], 10);
    const stepText = match[2].trim().split(/[.!?\n]/)[0];
    if (stepText && stepText.length > 5 && stepText.length < 150) {
      // Unngå duplikater
      if (!steps.some((s) => s.order === order)) {
        steps.push({ order, text: stepText });
      }
    }
  }

  // Mønster 3: Ordinals (først, deretter, til slutt)
  const ordinalPatterns = [
    { pattern: /(?:først|for det første)[,:\s]+([^.!?\n]+)/gi, order: 1 },
    { pattern: /(?:deretter|så|dernest|for det andre)[,:\s]+([^.!?\n]+)/gi, order: 2 },
    {
      pattern: /(?:til slutt|endelig|for det tredje|avslutningsvis)[,:\s]+([^.!?\n]+)/gi,
      order: 3,
    },
  ];

  for (const { pattern, order } of ordinalPatterns) {
    while ((match = pattern.exec(text)) !== null) {
      const stepText = match[1].trim();
      if (stepText.length > 5 && stepText.length < 150) {
        if (!steps.some((s) => s.order === order)) {
          steps.push({ order, text: stepText });
        }
      }
    }
  }

  // Sorter etter rekkefølge og returner
  return steps.sort((a, b) => a.order - b.order).slice(0, 8);
}

/**
 * Ekstraher sammenligninger fra teksten (vs, kontra, før/etter)
 */
function extractComparisons(text: string): Comparison[] {
  const comparisons: Comparison[] = [];

  // Mønster 1: X vs Y, X kontra Y
  const vsPattern =
    /([A-Za-zÆØÅæøå\s]{5,40})\s+(?:vs\.?|versus|kontra|mot)\s+([A-Za-zÆØÅæøå\s]{5,40})/gi;
  let match;
  while ((match = vsPattern.exec(text)) !== null) {
    comparisons.push({
      left: match[1].trim(),
      right: match[2].trim(),
    });
  }

  // Mønster 2: Før/Etter
  const beforeAfterPattern =
    /(?:før|tidligere|gammel|nåværende)[:\s]+([^.!?\n]+?)\s+(?:etter|nå|ny|fremtidig|planlagt)[:\s]+([^.!?\n]+)/gi;
  while ((match = beforeAfterPattern.exec(text)) !== null) {
    comparisons.push({
      left: match[1].trim().slice(0, 50),
      right: match[2].trim().slice(0, 50),
      basis: "tid",
    });
  }

  return comparisons.slice(0, 4);
}

/**
 * Ekstraher features med beskrivelser (tittel: beskrivelse mønster)
 */
function extractFeatures(text: string): Feature[] {
  const features: Feature[] = [];

  // Mønster 1: Bullet point med kolon (- Tittel: Beskrivelse)
  const bulletColonPattern = /^[-•*]\s*([^:\n]{5,40}):\s*(.{10,150})$/gm;
  let match;
  while ((match = bulletColonPattern.exec(text)) !== null) {
    features.push({
      title: match[1].trim(),
      description: match[2].trim(),
    });
  }

  // Mønster 2: Bullet point med bindestrek (- Tittel - Beskrivelse)
  const bulletDashPattern = /^[-•*]\s*([^-\n]{5,40})\s*[-–]\s*(.{10,150})$/gm;
  while ((match = bulletDashPattern.exec(text)) !== null) {
    // Unngå duplikater
    const title = match[1].trim();
    if (!features.some((f) => f.title === title)) {
      features.push({
        title,
        description: match[2].trim(),
      });
    }
  }

  // Mønster 3: Feature + parentes (Feature (beskrivelse))
  const parenPattern = /([A-ZÆØÅ][a-zæøå\s]{3,30})\s*\(([^)]{10,100})\)/g;
  while ((match = parenPattern.exec(text)) !== null) {
    const title = match[1].trim();
    if (!features.some((f) => f.title === title)) {
      features.push({
        title,
        description: match[2].trim(),
      });
    }
  }

  return features.slice(0, 6);
}

/**
 * Detekter om teksten beskriver en roadmap/tidslinje
 */
function detectRoadmap(text: string): boolean {
  const keywords = [
    /roadmap/i,
    /tidslinje/i,
    /tidsplan/i,
    /milepæl/i,
    /milestone/i,
    /fase\s*\d/i,
    /phase\s*\d/i,
    /Q[1-4]\s*\d{4}/i,
    /H[12]\s*\d{4}/i,
    /sprint\s*\d/i,
    /lanseringsplan/i,
    /implementeringsplan/i,
    /prosjektplan/i,
    /project\s*plan/i,
    /\d{4}\s*[-–]\s*\d{4}/i, // Årstall-spenn
  ];

  return keywords.some((k) => k.test(text));
}

/**
 * Format analyse som streng for prompt-injeksjon
 * Begrenser lengde for å unngå for lange prompts
 * @param analysis - Innholdsanalysen
 * @param maxLength - Maks lengde på output
 * @param excludeSlideCount - Hvis true, ikke inkluder suggested slide count (brukes når numSlides er eksplisitt satt)
 */
export function formatAnalysisForPrompt(
  analysis: ContentAnalysis,
  maxLength: number = 500,
  excludeSlideCount: boolean = false
): string {
  const parts: string[] = [];

  if (analysis.statistics.length > 0) {
    parts.push(`Statistics: ${analysis.statistics.slice(0, 4).join(", ")}`);
  }

  if (analysis.quotes.length > 0) {
    parts.push(`Quotes: "${analysis.quotes[0]}"`);
  }

  if (analysis.decisions.length > 0) {
    parts.push(`Decisions: ${analysis.decisions.slice(0, 2).join("; ")}`);
  }

  if (analysis.actionItems.length > 0) {
    parts.push(`Actions: ${analysis.actionItems.slice(0, 3).join("; ")}`);
  }

  if (analysis.topics.length > 0) {
    parts.push(`Topics: ${analysis.topics.slice(0, 3).join(", ")}`);
  }

  // Only include suggested slide count if not explicitly overridden by user
  if (!excludeSlideCount) {
    parts.push(`Suggested slides: ${analysis.suggestedSlideCount}`);
  }

  let result = parts.join("\n");

  // Trunkér hvis for langt
  if (result.length > maxLength) {
    result = result.substring(0, maxLength - 3) + "...";
  }

  return result;
}
