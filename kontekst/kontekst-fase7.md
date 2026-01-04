# Kontekst - Fase 7: Gamma-nivå Design Upgrade

## 2025-12-20 - Sprint 1: AI Bildegenerering KOMPLETT

**What:** Implementerte AI-bildegenerering med DALL-E 3 integrasjon, inkludert prompt builder, S3 lagring, og PPTX bildestøtte.

**Why:** For å oppnå Gamma-kvalitet design trenger slides kontekstuelt relevante AI-genererte bilder i stedet for placeholdere.

**How:**
1. Opprettet `src/lib/ai/image-client.ts` - DALL-E 3 klient med:
   - Style presets (photorealistic, illustration, minimalist, isometric, editorial)
   - Retry logikk med eksponentiell backoff
   - Rate limit håndtering
   - MockImageClient for testing (FAKE_LLM=true)

2. Opprettet `src/lib/ai/image-generation.ts` - Orkestreringsmodul med:
   - `buildImagePrompt()` - Bygger kontekstuelle prompts fra slide-innhold
   - `shouldGenerateImage()` - Bestemmer hvilke slides som trenger bilder
   - `generateImagesForDeck()` - Genererer og laster opp bilder til S3
   - Støtte for slide-typer: cover, section_header, text_plus_image, summary_next_steps

3. Oppdatert `src/lib/ai/pipeline.ts`:
   - Ny "images" stage i progress callback
   - Integrasjon med generateImagesForDeck()
   - Sjekker imageMode='ai' og deckId før bildegenerering

4. Oppdatert `src/lib/export/pptx-renderer.ts`:
   - Lagt til `downloadImageAsBase64()` for å hente bilder fra URL
   - Lagt til `addImage()` helper funksjon
   - Cover slides får nå bakgrunnsbilde med semi-transparent overlay
   - text_plus_image slides viser tekst på venstre side, bilde på høyre
   - Alle render-funksjoner er nå async for bildestøtte

5. Oppdatert `src/lib/queue/generation-worker.ts`:
   - Pre-genererer deckId (UUID) før pipeline kjøres
   - Passer deckId til pipeline for S3 bildesti
   - Bruker samme ID ved deck-opprettelse i databasen
   - Oppdatert progress mapping for "images" stage

**Nye filer:**
- `/src/lib/ai/image-client.ts`
- `/src/lib/ai/image-generation.ts`

**Filer modifisert:**
- `/src/lib/ai/pipeline.ts` (image generation stage)
- `/src/lib/export/pptx-renderer.ts` (image support)
- `/src/lib/queue/generation-worker.ts` (pre-generated deckId)

**Schemas allerede klare:**
- `imageMode: z.enum(["none", "ai"])` i GenerationRequestSchema
- `imageStyle` enum med 6 alternativer

**Risks:**
- DALL-E 3 kostnader: ~$0.04-0.08/bilde, estimert $0.50-1.00/presentasjon
- Rate limiting kan forlenge genereringstid
- Content policy violations hoppes over (bilder genereres ikke)

**Check:** Build grønn, alle komponenter kompilerer korrekt

---

## 2025-12-20 - Sprint 2: Stat Blocks KOMPLETT

**What:** Implementerte `stat_block` blokk-type for å vise store statistikker/nøkkeltall i presentasjoner.

**Why:** Gamma-kvalitet presentasjoner trenger visuelt fremtredende statistikker (f.eks. "95%", "180 ansatte", "12M NOK") med store tall og labels.

**How:**
1. Oppdatert `src/lib/schemas/block.ts`:
   - Lagt til `stat_block` i BlockKind enum
   - Opprettet `StatBlockContent` schema med `value`, `label`, `sublabel`
   - Lagt til i BlockContent discriminated union
   - Utvidet BlockSchema med nye felter

2. Opprettet `src/components/blocks/StatBlock.tsx`:
   - Stor verdi med theme-farger (primary)
   - Label og optional sublabel
   - Responsivt centered layout

3. Oppdatert `src/components/blocks/BlockRenderer.tsx`:
   - Lagt til case for `stat_block`

4. Oppdatert `src/lib/editor/constraints.ts`:
   - Lagt til `stat_block` constraints (20/50/100 tegn)
   - Implementert validering for stat_block i `validateBlock()`

5. Oppdatert `src/lib/export/pptx-renderer.ts`:
   - Lagt til `getStatBlockData()` helper
   - Lagt til `addStatBlock()` funksjon
   - Oppdatert `renderContentSlide()` for å håndtere stat_blocks i rad

**Nye filer:**
- `/src/components/blocks/StatBlock.tsx`
- `/scripts/test-stat-blocks.ts` (test script)
- `/scripts/test-stat-block-schema.ts` (schema validation test)

**Filer modifisert:**
- `/src/lib/schemas/block.ts` (stat_block schema)
- `/src/components/blocks/BlockRenderer.tsx` (stat_block rendering)
- `/src/lib/editor/constraints.ts` (constraints + validation)
- `/src/lib/export/pptx-renderer.ts` (PPTX stat_block support)

**Check:**
- Build grønn
- PPTX eksport verifisert: `/tmp/stat-blocks-test.pptx` (66KB)
- Schema validering fungerer korrekt

**Risks:**
- stat_block krever god balanse mellom verdi og label-lengde
- Flere stat_blocks på rad kan bli trangt på smale skjermer

---

## 2025-12-20 - Sprint 3: Timeline Roadmap KOMPLETT

**What:** Implementerte `timeline_step` blokk-type og `timeline_roadmap` slide-type for å vise prosjektfaser og milepæler.

**Why:** Gamma-kvalitet presentasjoner trenger visuelt tiltalende tidslinje/roadmap-visning med statusindikator (completed/current/upcoming).

**How:**

1. Oppdatert `src/lib/schemas/block.ts`:
   - Lagt til `timeline_step` i BlockKind enum
   - Opprettet `TimelineStepBlockContent` med step, title, description, status
   - Lagt til i BlockContent discriminated union
   - Utvidet BlockSchema med step, description, status felter

2. Oppdatert `src/lib/schemas/slide.ts`:
   - Lagt til `timeline_roadmap` i SlideType enum

3. Oppdatert constraints og AI-støtte:
   - `src/lib/validation/constraints.ts`: timeline_roadmap slide constraints
   - `src/lib/editor/constraints.ts`: timeline_step block constraints + validering
   - `src/lib/ai/layout.ts`: LAYOUT_VARIANTS + assignLayoutVariant for timeline
   - `src/lib/ai/prompts/content.ts`: Guidance og block structure for timeline

4. Opprettet `src/components/blocks/TimelineStepBlock.tsx`:
   - Visuell tidslinje med sirkler og konnekterende linjer
   - Status-basert fargekoding (grønn/blå/grå)
   - Støtter vertical og horizontal layout
   - Checkmark-ikon for completed steps

5. Opprettet `src/components/slides/TimelineRoadmapSlide.tsx`:
   - Wrapper for SlideLayout med timeline_step-blokker
   - Layout variants: vertical, horizontal, compact
   - SmartBlockRenderer-integrasjon for title

6. Oppdatert `src/components/blocks/BlockRenderer.tsx`:
   - Lagt til case for `timeline_step`
   - Importert TimelineStepBlock

7. Oppdatert `src/components/slides/SlideRenderer.tsx`:
   - Lagt til case for `timeline_roadmap`
   - Importert TimelineRoadmapSlide

8. Oppdatert `src/lib/export/pptx-renderer.ts`:
   - `getTimelineStepData()` helper
   - `addTimelineStep()` - tegner sirkel, linje, tekst med status-farger
   - `renderTimelineRoadmapSlide()` - vertikal timeline layout

**Nye filer:**
- `/src/components/blocks/TimelineStepBlock.tsx`
- `/src/components/slides/TimelineRoadmapSlide.tsx`
- `/scripts/test-timeline.ts` (PPTX test)
- `/scripts/test-timeline-schema.ts` (schema validation)

**Filer modifisert:**
- `/src/lib/schemas/block.ts` (timeline_step schema)
- `/src/lib/schemas/slide.ts` (timeline_roadmap type)
- `/src/lib/validation/constraints.ts` (slide constraints)
- `/src/lib/editor/constraints.ts` (block constraints + validation)
- `/src/lib/ai/layout.ts` (layout variants)
- `/src/lib/ai/prompts/content.ts` (AI guidance)
- `/src/components/blocks/index.ts` (exports)
- `/src/components/blocks/BlockRenderer.tsx` (dispatch)
- `/src/components/slides/SlideRenderer.tsx` (dispatch)
- `/src/lib/export/pptx-renderer.ts` (PPTX rendering)

**Check:**
- Build grønn
- PPTX eksport verifisert: `/tmp/timeline-test.pptx` (86KB, 4 slides)
- Schema validering fungerer korrekt
- Constraint validering fanger for lange titler

**Risks:**
- Mange timeline_steps (6+) kan overfylle slide vertikal
- Horizontal layout best egnet for 2-4 steps

---

## 2025-12-20 - Sprint 4: Cards KOMPLETT

**What:** Implementerte `icon_card` og `numbered_card` blokk-typer, samt tre nye slide-typer: `numbered_grid`, `icon_cards_with_image`, og `summary_with_stats`.

**Why:** Gamma-kvalitet presentasjoner trenger visuelt tiltalende kort for å fremheve features, prinsipper og konsepter med ikoner og nummerering.

**How:**

1. Oppdatert `src/lib/schemas/block.ts`:
   - Lagt til `icon_card` og `numbered_card` i BlockKind enum
   - Opprettet `IconCardBlockContent` med icon, text, description, bgColor
   - Opprettet `NumberedCardBlockContent` med number, text, description
   - Lagt til i BlockContent discriminated union
   - Utvidet BlockSchema med icon, bgColor, number felter

2. Oppdatert `src/lib/schemas/slide.ts`:
   - Lagt til `numbered_grid`, `icon_cards_with_image`, `summary_with_stats` i SlideType enum

3. Opprettet `src/components/blocks/IconCardBlock.tsx`:
   - Lucide-ikoner via eksplisitt iconMap (20+ ikoner)
   - Farge-presets (pink, blue, green, purple, orange, yellow, cyan, red)
   - Ikon i sirkel, tittel, og valgfri beskrivelse
   - Theme-variabler for konsistent styling

4. Opprettet `src/components/blocks/NumberedCardBlock.tsx`:
   - Nummerert badge i sirkel med primary-farge
   - Tittel og valgfri beskrivelse
   - Border og bakgrunnsfarge fra theme

5. Opprettet tre nye slide-komponenter:
   - `NumberedGridSlide.tsx`: Grid layout (2x2, 3x1, 4x1 varianter)
   - `IconCardsWithImageSlide.tsx`: Kort + bilde (cards_left, cards_right, cards_top)
   - `SummaryWithStatsSlide.tsx`: Tekst + statistikker (stats_bottom, stats_right, stats_inline)

6. Oppdatert støttefiler:
   - `src/components/blocks/BlockRenderer.tsx`: Cases for icon_card, numbered_card
   - `src/components/blocks/index.ts`: Eksporterer nye komponenter
   - `src/components/slides/SlideRenderer.tsx`: Cases for nye slide-typer
   - `src/components/slides/index.ts`: Eksporterer nye slide-komponenter
   - `src/lib/ai/layout.ts`: Layout variants for alle nye typer
   - `src/lib/ai/prompts/content.ts`: Guidance og block structures
   - `src/lib/validation/constraints.ts`: Constraints for nye slide-typer

7. Oppdatert `src/lib/export/pptx-renderer.ts`:
   - `getIconCardData()` og `getNumberedCardData()` helpers
   - `addIconCard()` - rendrer kort med farget bakgrunn og ikon-placeholder
   - `addNumberedCard()` - rendrer kort med nummer-badge
   - `renderNumberedGridSlide()` - grid layout for numbered cards
   - `renderIconCardsWithImageSlide()` - kort + bilde layout
   - `renderSummaryWithStatsSlide()` - tekst + stat blocks

**Nye filer:**
- `/src/components/blocks/IconCardBlock.tsx`
- `/src/components/blocks/NumberedCardBlock.tsx`
- `/src/components/slides/NumberedGridSlide.tsx`
- `/src/components/slides/IconCardsWithImageSlide.tsx`
- `/src/components/slides/SummaryWithStatsSlide.tsx`
- `/scripts/test-sprint4-cards.ts` (test script)

**Filer modifisert:**
- `/src/lib/schemas/block.ts` (icon_card, numbered_card schemas)
- `/src/lib/schemas/slide.ts` (3 nye slide-typer)
- `/src/components/blocks/BlockRenderer.tsx` (dispatch)
- `/src/components/blocks/index.ts` (exports)
- `/src/components/slides/SlideRenderer.tsx` (dispatch)
- `/src/components/slides/index.ts` (exports)
- `/src/lib/ai/layout.ts` (layout variants)
- `/src/lib/ai/prompts/content.ts` (AI guidance + block structures)
- `/src/lib/validation/constraints.ts` (slide constraints)
- `/src/lib/export/pptx-renderer.ts` (PPTX rendering)

**Check:**
- Build grønn
- PPTX eksport verifisert: `/tmp/sprint4-cards-test.pptx` (125KB, 7 slides)
- Alle slide-varianter rendrer korrekt

**Risks:**
- Lucide-ikoner i PPTX vises som tekstplaceholder (første bokstav)
- Mange kort (4+) kan bli trangt på smale skjermer

---

## 2025-12-20 - Sprint 5: Intelligent Layout KOMPLETT

**What:** Implementerte intelligent slide type selection basert på content analysis patterns.

**Why:** For å oppnå Gamma-kvalitet må slide-typer velges automatisk basert på innholdsanalyse, ikke bare LLM-gjetning.

**How:**
1. Utvidet `src/lib/ai/content-analysis.ts` med nye interfaces og ekstraksjons-funksjoner:
   - `ProcessStep`, `Comparison`, `Feature` interfaces
   - `extractSequentialProcess()` - finner nummererte/fase-baserte steg
   - `extractComparisons()` - finner vs/kontra/før-etter mønstre
   - `extractFeatures()` - finner bullet+kolon feature-beskrivelser
   - `detectRoadmap()` - sjekker for roadmap/tidslinje nøkkelord

2. Opprettet `src/lib/ai/slide-type-selector.ts` med:
   - `SlideTypeRecommendation` interface med type, confidence, reason
   - `recommendSlideTypes()` - mapper content analysis til slide-typer
   - `formatRecommendationsForPrompt()` - formaterer for prompt-injeksjon
   - `getTopRecommendation()` og `isSlideTypeRecommended()` hjelpefunksjoner
   - Regler: statistics → summary_with_stats, sequential → timeline_roadmap, features → icon_cards_with_image, etc.

3. Oppdatert `src/lib/ai/prompts/outline.ts`:
   - Importert `recommendSlideTypes` og `formatRecommendationsForPrompt`
   - Lagt til nye slide-typer i SLIDE_TYPES array
   - Utvidet SLIDE TYPE GUIDELINES med nye typer
   - Integrert recommendations i system prompt når analysis er tilgjengelig

4. Layout assignment (Sprint 5.4) var allerede implementert i Sprint 4

**Nye filer:**
- `/src/lib/ai/slide-type-selector.ts`
- `/scripts/test-sprint5-intelligent-layout.ts`

**Filer modifisert:**
- `/src/lib/ai/content-analysis.ts` (nye interfaces + funksjoner)
- `/src/lib/ai/prompts/outline.ts` (nye slide-typer + recommendations)
- `/scripts/test-sprint4-cards.ts` (fikset ThemeId type)

**Check:**
- Build grønn
- Alle 7 tester bestått:
  - Statistics → summary_with_stats ✅
  - Sequential Process → timeline_roadmap ✅
  - Features → icon_cards_with_image ✅
  - Roadmap Keywords → timeline_roadmap ✅
  - Decisions → decisions_list ✅
  - Comparisons → two_column_text ✅
  - Prompt Formatting ✅

**Risks:**
- False positives i pattern detection kan foreslå feil slide-typer
- LLM kan ignorere recommendations ved sterke motstridende signaler

---

## Fase 7 KOMPLETT

Alle 5 sprints er nå fullført:
- Sprint 1: AI Bildegenerering ✅
- Sprint 2: Stat Blocks ✅
- Sprint 3: Timeline Roadmap ✅
- Sprint 4: Cards (icon_card, numbered_card, 3 nye slide-typer) ✅
- Sprint 5: Intelligent Layout (content analysis → slide type selection) ✅

---

## 2024-12-29 - Freeform-First Flow KOMPLETT

**What:** Implementerte Gamma-lignende "freeform-first" flyt der brukere går rett til Prompt Editor uten å vente på outline-generering.

**Why:** Forbedre brukeropplevelsen ved å:
1. Fjerne ventetiden på 5-10 sekunder ved "Fortsett"-klikk
2. La brukere velge om de vil ha outline for mer kontroll
3. Tillate direkte generering fra fritekst (outline genereres inline i pipeline)

**How:**
1. **page.tsx - Fjernet auto-outline**:
   - `handleInputNext()` kaller ikke lenger `generateOutline()`
   - Lagt til `handleGenerateOutline()` for on-demand outline-generering
   - `startGeneration()` sender nå outline som optional parameter
   - `handleOutlineNext()` og `handleGenerateRetry()` fungerer med eller uten outline

2. **ContentPreview.tsx - Freeform-first**:
   - Default viewMode = "freeform" når outline er null
   - Nye props: `onGenerateOutline`, `isGeneratingOutline`
   - Viser "Generer outline (valgfritt)" knapp i freeform-modus
   - Ny `FreeformEmptyState` komponent med tydelig CTA

3. **PromptEditor.tsx - Oppdaterte footer-knapper**:
   - Nye props: `onGenerateOutline`, `isGeneratingOutline`
   - "Regenerer outline" vises kun når outline finnes
   - "Generer outline (valgfritt)" vises når outline er null
   - "Generer presentasjon" er alltid aktiv (krever ikke outline)

4. **deck.ts schema - Valgfri outline**:
   - `outline: OutlineSchema.optional()` lagt til i GenerationRequestSchema
   - Dokumentert freeform-first arkitektur i schema-kommentar

5. **pipeline.ts - Inline outline-generering**:
   - `generate()` sjekker nå om `request.outline` er satt
   - Hvis outline finnes: brukes direkte
   - Hvis outline mangler: genereres inline før content-generering
   - Samme enforcing og validation uansett kilde

**Filer modifisert:**
- `/src/app/new/page.tsx` (state management, handlers)
- `/src/components/wizard/ContentPreview.tsx` (freeform-first, ny UI)
- `/src/components/wizard/PromptEditor.tsx` (footer-knapper, nye props)
- `/src/lib/schemas/deck.ts` (valgfri outline i schema)
- `/src/lib/ai/pipeline.ts` (inline outline-generering)

**Ny arkitektur:**
```
Steg 1: Innhold → [Fortsett] → INGEN VENTING
                                    ↓
Steg 2: Prompt Editor
        - Default: Fritekstvisning
        - Valgfritt: "Generer outline" for mer kontroll
                                    ↓
Steg 3: [Generer presentasjon]
        - Med outline: Bruker eksisterende
        - Uten outline: Genererer inline i pipeline
```

**Check:**
- Build grønn ✅
- TypeScript kompilerer korrekt ✅

**Risks:**
- Brukere kan bli forvirret over valgfri outline-funksjonalitet
- Inline outline-generering legger til latency ved "Generer presentasjon"
- Ingen outline betyr at brukeren ikke kan redigere struktur før generering

---

## 2024-12-30 - Kvalitetsforbedringer for AI-generert innhold

**What:**
Implementert 5 kvalitetsforbedringer for å redusere "AI-generert" følelse i presentasjoner:
1. Tittel-telling-validering (f.eks. "Fire USP-er" må ha 4 items)
2. NO_TEXT_INSTRUCTION for bildegenerering (fjerner tekst i AI-bilder)
3. Minimum tegngrense for card-beskrivelser (30-120 tegn)
4. Content density scoring (identifiserer tomme slides)
5. Norsk sentence case i prompt-instruksjoner (ikke Title Case)

**Why:**
Analyse av genererte presentasjoner avdekket flere kvalitetsproblemer:
- Titler som lover antall ("Fire USP-er") matchet ikke faktisk innhold
- DALL-E la til tekst i bilder (f.eks. "EFFICIENCTY")
- Feature cards hadde for korte beskrivelser (2-3 ord)
- Enkelte slides fremsto tomme/sparsomme
- Title Case på norsk ser AI-generert ut og er grammatisk feil

**How:**
- `constraints.ts`: Ny `extractNumberFromTitle()` med norske tallord + `minCharsPerItem`
- `validation.ts`: Ny `validateTitleCountConsistency()` + `calculateContentDensity()`
- `image-generation.ts`: Lagt til `NO_TEXT_INSTRUCTION` konstant
- `content.ts`: Norsk sentence case instruksjoner + oppdatert guidance for cards
- `repair.ts`: Håndtering av `adjust_title` og `expand` actions + sentence case
- Ny testfil: `title-count.test.ts` med 11 unit-tester

**Risks:**
- Prompt-instruksjoner for sentence case er "soft enforcement" - LLM kan ignorere
- Content density threshold (35%) kan være for høy for noen slide-typer
- Minimum tegngrense kan tvinge AI til å padde med filler-tekst hvis hints mangler

---

## 2024-12-30 - Slide Count Inkonsistens - PLAN FOR OPPRYDDING

**What:** Omfattende plan for å fikse alle inkonsistenser i slide-telling mellom brukerens valg, AI-generering, og frontend-visning.

**Why:** Brukeren rapporterer følgende problemer:
1. Header viser "6 / 8 slides" når bruker valgte 8, men AI genererte 6
2. Progress viser "Genererer slide 1 av 8" når outline kun har 6 slides
3. Sidebar viser "Slides (6)" - riktig for faktisk antall, men inkonsistent med forventning
4. "80% ferdig" matcher ikke med faktisk progresjon

**Rotårsaksanalyse:**

```
DATAFLYT FOR SLIDE-TELLING:
1. Bruker velger 8 slides → request.numSlides = 8
2. Content Analysis → suggestedSlideCount = 6 (basert på ordtelling)
3. AI får prompt med "EXACTLY 8 slides" MEN også "Suggested: 6" (FIKSET i forrige sesjon)
4. AI genererer outline → outline.slides.length = 6 (ignorerer instruksjon)
5. Worker sender SSE: totalSlides = outline.slides.length = 6
6. Frontend bruker totalSlides fra SSE = 6
7. Men header-komponent får også "forventet" fra et annet sted

KILDER TIL SLIDE-TELLING:
- request.numSlides (8) - brukerens eksplisitte valg
- analysis.suggestedSlideCount (6) - algoritme-forslag (NÅ EKSKLUDERT når numSlides er satt)
- outline.slides.length (6) - faktisk AI-output
- composedOutline.slides.length (6+) - etter cover/agenda/summary injeksjon
- finalDeck.slides.length (6+) - endelig resultat

INKONSISTENS-KILDE:
GenerateStep.tsx linje 159:
  const expectedTotal = displayOutline?.slides?.length ?? 0;

Dette bruker outline.slides.length (6), IKKE request.numSlides (8).
Dermed får GenerationHeader feil totalSlides.
```

**Plan for opprydding:**

### Steg 1: Single Source of Truth - Definer `requestedSlides` felt
- **Mål:** La brukerens valg (numSlides) følge med gjennom hele pipeline
- **Filer:**
  - `src/lib/streaming/types.ts` - Legg til `requestedSlides` i StreamEventData
  - `src/lib/queue/generation-worker.ts` - Send requestedSlides i alle events
  - `src/hooks/useGenerationStream.ts` - Track requestedSlides separat fra totalSlides
- **Check:** Console.log viser requestedSlides=8 i alle events

### Steg 2: Outline Validering og Håndhevelse
- **Mål:** Sikre at AI faktisk genererer riktig antall slides
- **Filer:**
  - `src/lib/ai/pipeline.ts` - Legg til `validateOutlineSlideCount()` etter outline generation
  - `src/lib/ai/prompts/outline.ts` - Enda sterkere instruksjoner (allerede forbedret)
- **Logikk:**
  1. Hvis outline.slides.length !== numSlides:
     - Log avviket
     - IKKE retry (kan føre til uendelig loop)
     - Sett `actualSlides = outline.slides.length`
     - Kommuniser avviket via SSE event
- **Check:** Ved avvik logges warning og event sendes

### Steg 3: Oppdater SSE Events
- **Mål:** Frontend får både forventet og faktisk slide-telling
- **Filer:**
  - `src/lib/streaming/types.ts`:
    ```typescript
    export interface StreamEventData {
      // ... eksisterende
      requestedSlides?: number;  // Fra request.numSlides
      actualSlides?: number;     // Fra outline.slides.length
      // totalSlides forblir for bakoverkompatibilitet
    }
    ```
  - `src/lib/queue/generation-worker.ts`:
    - Ved `outline_complete`: Send `requestedSlides` og `actualSlides`
    - Ved `slide_started/content`: Bruk `actualSlides` for progresjon
- **Check:** SSE events inneholder begge verdier

### Steg 4: Frontend - Konsistent Visning
- **Mål:** Vis enten forventet ELLER faktisk, ikke begge
- **Valg:** Vis FAKTISK antall (outline.slides.length) fordi:
  - Det er sannheten - brukeren får det antallet
  - Å vise "6 av 8" skaper forvirring
  - Hvis AI genererte 6, er det mer nyttig å vise det
- **Filer:**
  - `src/hooks/useGenerationStream.ts`:
    ```typescript
    interface GenerationStreamState {
      // Fjern ambiguitet:
      requestedSlides: number;  // Hva bruker ba om
      actualSlides: number;     // Hva som faktisk genereres
      slidesGenerated: number;  // Hvor mange er ferdige
    }
    ```
  - `src/components/wizard/GenerateStep.tsx`:
    - Bruk `actualSlides` (eller `outline.slides.length`) konsekvent
    - Hvis `actualSlides !== requestedSlides`, vis toast/melding
  - `src/components/generation/GenerationHeader.tsx`:
    - Mottar kun `totalSlides` (faktisk antall)
    - Viser "3 av 6 slides" (faktisk progresjon)
  - `src/components/wizard/LivePreview.tsx`:
    - Bruker samme `totalSlides` kilde
- **Check:** Alle komponenter viser samme tall

### Steg 5: Kommuniser Avvik til Bruker
- **Mål:** Hvis AI genererte færre slides enn forespurt, informer bruker
- **Implementasjon:**
  - Når `outline_complete` mottas med `actualSlides !== requestedSlides`:
    - Vis toast: "AI genererte 6 slides basert på innholdet (du ba om 8)"
  - Alternativt: Vis info-banner i header
- **Filer:**
  - `src/components/wizard/GenerateStep.tsx` - Toast ved avvik
- **Check:** Toast vises ved avvik

### Steg 6: Testing og Verifikasjon
- **Mål:** Verifiser at alle endringer fungerer sammen
- **Tester:**
  1. Velg 8 slides, generer, verifiser at UI viser konsistente tall
  2. Sjekk at progress-% matcher faktisk progresjon
  3. Verifiser at sidebar viser riktig antall
  4. Test med ulike numSlides-verdier (4, 6, 10, 15)
- **Check:** Alle 4 tester passerer

**Filer som må endres:**

| Fil | Endring |
|-----|---------|
| `src/lib/streaming/types.ts` | Legg til `requestedSlides`, `actualSlides` |
| `src/lib/queue/generation-worker.ts` | Send nye felter i events |
| `src/hooks/useGenerationStream.ts` | Track og eksponér nye verdier |
| `src/components/wizard/GenerateStep.tsx` | Bruk konsistent kilde, vis avvik |
| `src/components/generation/GenerationHeader.tsx` | Bruk kun én kilde |
| `src/components/wizard/LivePreview.tsx` | Bruk samme kilde |

**Risiko:**
- AI kan fortsatt generere feil antall slides (mitigeres med logging/toast)
- Må teste backward compatibility med polling fallback
- SSE event-størrelse øker marginalt

**Anbefalt rekkefølge:**
1. Steg 1 + 3 (types + events) - backend-endringer
2. Steg 4 (frontend) - UI-endringer
3. Steg 2 (validation) - logging av avvik
4. Steg 5 (toast) - bruker-kommunikasjon
5. Steg 6 (testing) - verifikasjon

---

## 2025-12-30 - Slide Count Inkonsistens Fix KOMPLETT

**What:** Implementerte single source of truth for slide-telling på tvers av hele systemet, fra backend SSE events til alle frontend-komponenter.

**Why:** Bruker kunne velge 8 slides, men UI viste inkonsistente tall:
- Header: "6 / 8 slides" (blandet faktisk og forventet)
- Status: "Genererer slide 1 av 8" (brukte forventet)
- Faktisk: 6 slides generert

**Root cause:** To kilder til slide-telling (`request.numSlides` vs `outline.slides.length`) ble brukt inkonsistent fordi AI ikke alltid følger instruksjonene om antall slides.

**How:**

1. **Backend - SSE Types** (`src/lib/streaming/types.ts`):
   - Lagt til `requestedSlides?: number` - brukerens valg
   - Lagt til `actualSlides?: number` - hva AI faktisk genererte

2. **Backend - Worker** (`src/lib/queue/generation-worker.ts`):
   - Tracker `requestedSlides` og `actualSlides` som variabler
   - Sender `requestedSlides` i `generation_started` event
   - Setter `actualSlides` når outline er ferdig
   - Logger warning ved avvik: `[generationId] Slide count mismatch: requested=8, actual=6`
   - Inkluderer begge felter i alle SSE events

3. **Frontend - Hook** (`src/hooks/useGenerationStream.ts`):
   - Lagt til `requestedSlides` og `actualSlides` i state
   - `generation_started` handler setter `requestedSlides`
   - `outline_complete` handler setter `actualSlides`
   - Alle handlers bruker nå `actualSlides` som autoritativ kilde

4. **Frontend - GenerateStep** (`src/components/wizard/GenerateStep.tsx`):
   - Henter `actualSlides` og `requestedSlides` fra hook
   - Bruker `actualSlides` som single source of truth for `expectedTotal`
   - Viser info-toast ved avvik: "AI genererte 6 slides (du ba om 8). Innholdet passet bedre med dette antallet."

5. **Frontend - GenerationHeader og LivePreview**:
   - Mottar nå konsistente verdier via props fra GenerateStep
   - Ingen direkte endringer nødvendig, bare korrekte input-verdier

**Filer modifisert:**
- `src/lib/streaming/types.ts` - Nye SSE-felter
- `src/lib/queue/generation-worker.ts` - Backend tracking og logging
- `src/hooks/useGenerationStream.ts` - Frontend state management
- `src/components/wizard/GenerateStep.tsx` - UI + toast ved avvik

**Check:**
- `npx tsc --noEmit` - Grønn
- `pnpm build` - Grønn
- Alle komponenter kompilerer korrekt

**Risks:**
- AI kan fortsatt generere feil antall (mitigeres med logging og bruker-varsling)
- Polling fallback bør testes manuelt

**Neste steg:**
- T7.x.4: Manuell test med ulike numSlides-verdier
- Verifiser konsistent visning i alle komponenter

## 2025-12-30 - Radikal Arkitekturrefaktorering: "Compose First, Count Once"

**What:** Komplett refaktorering av slide count-håndtering i pipeline for å fikse persistent bug der bruker fikk 7 slides i stedet for 8.

**Why:** Rotårsaken var en THRESHOLD MISMATCH mellom `predictComposedCount()` og faktisk `composeDeck()`:
- `predictComposedCount()` brukte: `slideCountAfterCover > 5` (inkluderer cover)
- `generateDeck().composeDeck()` brukte: `outline.slides.length > 5` (ekskluderer cover)

Dette førte til at prediksjonen og faktisk komposisjon la til ulike antall strukturslides.

**How:** Ny arkitektur - "Compose First, Count Once":

1. **Fjernet prediksjon helt** - Ingen `predictComposedCount()`, `trimOutlineToCount()`, eller `padOutlineToCount()` (den gamle)

2. **Ny flyt i `generate()`:**
   ```
   1. generateOutline() → LLM genererer fritt (ingen count-validering)
   2. composeDeck() → Legg til strukturslides UMIDDELBART etter outline
   3. enforceExactSlideCount() → Trim/pad ETTER komposisjon
   4. enforceSlideDistribution() → Modifiser typer (aldri count)
   5. generateDeck() → Generer innhold (INGEN komposisjon her)
   ```

3. **Nye metoder i `pipeline.ts`:**
   - `enforceExactSlideCount()` - Eneste sted hvor count justeres
   - `trimComposedOutline()` - Fjerner content-slides fra midten
   - `padComposedOutline()` - Legger til slides basert på analyse

4. **Fjernet komposisjon fra `generateDeck()`** - Tar nå bare pre-komponert outline

5. **Gjort `composeDeck()` idempotent i `deck-composer.ts`:**
   - `hasCoverAnywhere()` - Sjekker ALLE slides, ikke bare index 0
   - `hasSummaryAnywhere()` - Sjekker ALLE slides
   - Flytter eksisterende cover/summary til riktig posisjon

6. **Forenklet outline-prompt i `prompts/outline.ts`:**
   - Fra: "MUST create EXACTLY X slides"
   - Til: "Target approximately X-3 content slides. Structural slides added automatically."

**Filer modifisert:**
- `src/lib/ai/pipeline.ts` - Hovedrefaktorering (ny flyt, nye metoder, fjernet prediksjon)
- `src/lib/ai/deck-composer.ts` - Idempotent komposisjon
- `src/lib/ai/prompts/outline.ts` - Forenklet count-instrukser

**Check:**
- `pnpm build` - Grønn ✅
- Test 8 slides forespurt → 8 slides generert ✅
- Test 5 slides forespurt → 5 slides generert ✅
- Test 10 slides forespurt → 10 slides generert ✅

**Risks:**
- Outline-prompt endring kan påvirke LLM-output kvalitet (mitigeres med count enforcement)
- Padding med generiske slides kan være mindre relevant (mitigeres med analyse-baserte forslag)

**Resultat:** Bug fikset permanent. Slide count er nå 100% deterministisk etter komposisjon.

---

## 2025-12-31 - Editor Revamp: AI Agent Core + AI Chat UI KOMPLETT

**What:** Implementerte Dag 4-5 av Editor Revamp Fase 1: AI-drevet slide-transformasjon med SlideTransformAgent og AIChat floating panel.

**Why:** For å oppnå Gamma-kvalitet editor trenger brukere mulighet til å transformere slides via naturlig språk-instruksjoner. AI-assistenten gir hurtigvalg og fritekst-transformasjoner med streaming-feedback.

**How:**

### Dag 4: AI Agent Core

1. **Opprettet `src/lib/ai/prompts/slide-transform.ts`**:
   - `getConstraintsForSlideType()` - Formaterer constraints for hver slide-type
   - `buildTransformSystemPrompt()` - System prompt med regler og constraints
   - `buildTransformUserPrompt()` - User prompt med slide JSON og instruksjon
   - `TRANSFORM_INSTRUCTIONS` - Predefinerte transformasjoner (simplify, expand, professional, casual, visualize, translate_en, translate_no)
   - `getTransformInstruction()` - Henter instruksjon for transformation type

2. **Opprettet `src/lib/ai/slide-agent.ts`**:
   - `SlideTransformAgent` klasse med:
     - `transform()` - Hoved-transformasjonsmetode med streaming-støtte
     - `simplify()`, `expand()`, `makeProfessional()`, `makeCasual()`, `makeVisual()` - Convenience-metoder
     - `translateToEnglish()`, `translateToNorwegian()` - Oversettelsesmetoder
     - `applyTransformation()` - Generisk metode for predefinerte transformasjoner
     - `postProcessResult()` - Validering og repair av transformert slide
   - Streaming callbacks: `onToken`, `onPartial`, `onComplete`, `onError`
   - Constraint-validering med auto-repair via `aiShortenSlide()`

### Dag 5: AI Chat UI

3. **Opprettet `src/components/editor/AIChat/useAIChat.ts`**:
   - State management for chat (messages, input, status, partialResult)
   - `submit()` - Sender instruksjon til AI agent
   - `applyQuickAction()` - Kjører predefinert transformasjon
   - `clearHistory()` - Nullstiller meldingshistorikk
   - Dynamisk import av SlideTransformAgent for SSR-kompatibilitet

4. **Opprettet `src/components/editor/AIChat/AIChat.tsx`**:
   - Floating panel (fixed right-4, portal-basert)
   - Hurtigvalg-knapper: Forenkle, Utvid, Profesjonell, Visuell, Engelsk
   - Chat-historikk med bruker/AI-meldinger
   - Streaming preview under transformasjon
   - Status-indikator (loading/streaming/success/error)
   - Textarea input med Enter for send, Shift+Enter for newline

5. **Oppdatert `src/components/editor/EditorLayout.tsx`**:
   - Import av AIChat, useState, useCallback, Sparkles, useCurrentSlide
   - `isAIChatOpen` state for toggle
   - `handleAITransformComplete` callback som kaller `actions.aiReplaceSlide()`
   - AI toggle-knapp i header med gradient-styling når aktiv
   - AIChat komponent integrert med correct props

6. **Oppdatert `src/components/editor/index.ts`**:
   - Eksporterer `AIChat`, `useAIChat`, og `AIChatProps`

**Nye filer:**
- `/src/lib/ai/prompts/slide-transform.ts`
- `/src/lib/ai/slide-agent.ts`
- `/src/components/editor/AIChat/useAIChat.ts`
- `/src/components/editor/AIChat/AIChat.tsx`
- `/src/components/editor/AIChat/index.ts`

**Filer modifisert:**
- `/src/components/editor/index.ts` (AIChat eksport)
- `/src/components/editor/EditorLayout.tsx` (AIChat integrasjon)

**Check:**
- `npx tsc --noEmit` - Grønn ✅
- `pnpm build` - Grønn ✅
- Alle komponenter kompilerer korrekt

**Risks:**
- LLM-transformasjoner kan bryte constraints (mitigeres med repair-loop)
- SSR issues med AI agent (mitigeres med dynamisk import)
- Streaming-feil kan etterlate UI i uferdig tilstand (mitigeres med error handling)
