# PRD — Norsk AI-presentasjonsplattform (MVP)

> **Formål:** Dette dokumentet beskriver kravene for en MVP av en norsk, Gamma-lignende AI-presentasjonsplattform som kan brukes både som **standalone webapp** og som **API** i andre produkter (f.eks. Notably).

---

## 0. Sammendrag

Vi skal bygge en norsk tjeneste som genererer **førsteklasses** presentasjoner (slides) fra en prompt eller innlimte notater. MVP skal gi:

1) **Webapp:** superenkel flyt fra input → outline → ferdig deck, med lett redigering, deling og eksport.  
2) **API-first:** asynkron generering med job-ID og polling, samt signed URL-er til web-visning og eksportfiler (PDF/PPTX).

**MVP avgrenser seg til presentasjoner** (ikke dokument/nettside/sosiale format).

---

## 1. Mål

### 1.1 Produktmål (MVP)
- Levere presentasjoner som oppleves **“ready-to-present”** uten manuell designjobb.
- Svært lav friksjon: **prompt/notater → outline → deck**.
- Lett redigering + AI-hjelp som **ikke ødelegger layout**.
- Delbar lenke (view-only) + eksport til **PDF og PPTX**.
- Stabilt API som kan brukes av andre produkter.

### 1.2 Suksesskriterier (KPIer)
- **Aktivering:** % av nye brukere som fullfører første deck.
- **Time-to-value:** tid fra “Generer” til deck er klart.
- **Kvalitetsproxy:** % av decks som eksporteres (PDF/PPTX) eller deles.
- **Retensjon:** % som genererer nytt deck innen 7 dager.
- **API-adopsjon:** aktive API-nøkler og vellykkede genereringer per dag/uke.
- **Kundetilbakemelding:** score på “designkvalitet” og “brukervennlighet”.

---

## 2. Ikke-mål / Utenfor scope (MVP)
- Sanntidssamarbeid (Google Slides-style samtidig redigering).
- Full “template import” fra PPTX/PDF (plan for V2).
- Avanserte animasjoner/overganger.
- Full chart-/diagrameditor (V2; kan komme med 1–2 enkle typer senere).
- Dokument-/nettside-/SoMe-formater (kun presentasjoner i MVP).

---

## 3. Personas
- **Konsulent:** trenger premium uttrykk + PPTX for siste finpuss i PowerPoint.
- **Leder/PM:** trenger status/møte-deck fra notater (beslutninger + action items).
- **Utvikler/API-kunde:** trenger stabil API-kontrakt, forutsigbart schema og eksportfiler.

---

## 4. Brukerreiser

### 4.1 Webapp (standalone)
1. Bruker klikker **Ny presentasjon**
2. Velger input: **Prompt** eller **Lim inn notater** (MVP: begge)
3. Setter valg: språk, tone, mengde tekst, antall slides, tema, bilder
4. Systemet genererer **Outline** (redigerbar)
5. Bruker klikker **Generer presentasjon**
6. Bruker ser deck i viewer/editor
7. Bruker gjør små endringer eller AI-handlinger (slide/global)
8. Bruker **deler lenke** eller **eksporterer PDF/PPTX**

### 4.2 API (integrasjon, f.eks. Notably)
1. Klient kaller **POST /v1/generations** med møte-notater + parametre
2. API returnerer **generationId**
3. Klient poller **GET /v1/generations/{id}** til status = completed
4. Klient mottar **viewUrl** + **pdfUrl/pptxUrl** (signed, utløper)
5. Klient viser “Åpne” og “Last ned” i eget produkt

---

## 5. Funksjonelle krav (FR)

> **Krav-ID-format:** FR-XX. Hvert krav har akseptansekriterier.

### 5.1 Input og moduser

**FR-1 Inputtyper (MVP)**
- Prompt (kort tekst)
- Lim inn notater (lang tekst)
- Nice-to-have: manuelle slide-breaks via `\n---\n`

**Akseptanse**
- Bruker kan velge inputtype i UI.
- API støtter samme via `inputText`.
- Hvis `\n---\n` brukes (dersom aktivert), skal systemet splitte slides deterministisk.

---

**FR-2 Tekstmoduser**
- `generate`: generer innhold fra prompt/tema
- `condense`: oppsummer lange notater til deck
- `preserve`: behold formuleringer mest mulig; strukturér til slides

**Akseptanse**
- Mode kan velges i UI og API.
- `preserve` skal ikke “omskrive” (kun struktur/normalisering av whitespace).

---

### 5.2 Outline-first (kritisk for kvalitet)

**FR-3 Outline**
- Systemet lager outline som liste av slides med:
  - tittel
  - 1–2 stikkord/bullet hints
  - foreslått slide-type
- Bruker kan:
  - endre titler
  - reorder (drag/drop)
  - legge til / fjerne slides

**Akseptanse**
- Outline genereres før full deck-generering.
- Outline lagres som metadata på deck.

---

### 5.3 Slide-typer (MVP-komponentbibliotek)

**FR-4 Slide-typer (8–10)**
MVP støtter følgende “byggesteiner” (templates):
1. `cover`
2. `agenda`
3. `section_header`
4. `bullets`
5. `two_column_text`
6. `text_plus_image`
7. `decisions_list`
8. `action_items_table` (oppgave/eier/frist)
9. `summary_next_steps`
10. `quote_callout` (valgfri i MVP)

**Akseptanse**
- AI velger slide-type per slide.
- Hver slide-type har constraints for maks innhold (se §9).

---

### 5.4 Tema og branding

**FR-5 Temaer**
Minimum 5 temaer:
- `nordic_light`
- `nordic_dark`
- `corporate_blue`
- `minimal_warm`
- `modern_contrast`

Tema definerer:
- typografi (font stack, størrelseshierarki)
- spacing-scale
- fargepalett
- bakgrunn/stil for komponenter

**Akseptanse**
- Tema kan velges ved opprettelse og byttes etterpå.
- Bytte tema oppdaterer alle slides konsistent.

---

**FR-6 Brand Kit (MVP light)**
- Logo (valgfritt)
- Primærfarge + sekundærfarge

**Akseptanse**
- Brand kit påvirker tema (innen guardrails) på alle slides.
- Bruker kan fjerne logo uten å ødelegge layout.

---

### 5.5 Bilder

**FR-7 Bildemodus**
- `none`
- `ai_generated`
(V1.1: `stock` via Unsplash eller tilsvarende)

**FR-8 Bildestiler (presets)**
- `photorealistic`
- `illustration`
- `minimalist`
- `isometric`
- `editorial`
- `default`

**Akseptanse**
- Hvis bilder er på: `text_plus_image` skal inneholde et relevant bilde.
- Bruker kan “Regenerer bilde” per slide.

---

### 5.6 Viewer og lettvekts editor

**FR-9 Lettvekts editor**
Layout:
- Venstre: slide-liste
- Midten: canvas / viewer
- Høyre: inspector

Redigering (MVP):
- endre tittel/tekst
- endre bullets
- bytte layout-variant innen slide-type
- regenerere bilde
- bytte tema

**Akseptanse**
- Endringer skal ikke knuse layout.
- Ved overflow: clamp + foreslå “splitt slide” eller “kort ned”.

---

### 5.7 AI-agent (MVP)

**FR-10 AI-handlinger**
Per slide:
- “Kortere”
- “Mer profesjonell tone”
- “Gjør om til bullets”
- “Regenerer bilde”

Globalt:
- “Gjør presentasjonen kortere (X → Y)”
- “Legg til et slide om …”

**Akseptanse**
- Agent returnerer strukturert output som følger schema (ikke fri tekst).
- Endringer påvirker kun valgt scope (slide eller hele deck).

---

### 5.8 Deling

**FR-11 Delbar lenke**
Tilgangsnivå:
- `private` (kun eier)
- `anyone_with_link_can_view`

**Akseptanse**
- View-only lenke fungerer uten innlogging for “anyone”.
- Lenken viser deck med korrekt tema og typografi.

---

### 5.9 Eksport

**FR-12 PDF-eksport**
- Pixel-perfect render fra web-deck.
- En slide = en PDF-side med riktig aspect.

**FR-13 PPTX-eksport**
- Redigerbar PPTX som matcher MVP slide-typer/layouts.
- MVP-begrensninger er OK:
  - ingen animasjoner
  - font fallbacks dersom font ikke finnes lokalt

**Akseptanse**
- PPTX åpner i PowerPoint uten feil.
- Tekst er redigerbar.
- Layout er stabil for alle støttede slide-typer.

---

## 6. API-krav

### 6.1 Autentisering og begrensninger
- API key per workspace/prosjekt
- Rate limits per key (per minutt + per dag)
- Støtte for **idempotency key** (for å unngå dobbeltgenerering)

---

### 6.2 Endepunkter (MVP)

#### POST `/v1/generations`
Starter asynkron generering.

**Request (JSON)**
- `inputText` (string, required)
- `textMode` (`generate|condense|preserve`, required)
- `language` (string, default `"no"`)
- `tone` (string, optional)
- `audience` (string, optional)
- `amount` (`brief|medium|detailed`, default `medium`)
- `numSlides` (int, optional)
- `themeId` (string, optional)
- `imageMode` (`none|ai`, default `ai`)
- `imageStyle` (enum, optional)
- `exportAs` (array, optional; any of `["pdf","pptx"]`)
- `callbackUrl` (string, optional; reserved for V1.1)

**Response**
- `generationId` (string)
- `status` (`queued`)

---

#### GET `/v1/generations/{id}`
Henter status og resultat.

**Response**
- `status` (`queued|running|completed|failed`)
- `progress` (0–100, optional)
- `viewUrl` (string, when completed)
- `pdfUrl` (string, signed, optional)
- `pptxUrl` (string, signed, optional)
- `expiresAt` (timestamp, when any signed urls present)
- `error` (object, when failed):
  - `code`
  - `message`

---

#### (Nice-to-have) POST `/v1/generations/{id}/cancel`
Avbryt en jobb hvis mulig.

---

## 7. Datamodell (MVP)

### 7.1 Entiteter
- `user`
- `workspace`
- `api_key`
- `deck`
- `slide`
- `block`
- `generation_job`
- `export_job`

### 7.2 Intern deck-representasjon (AI output)
AI må produsere strukturert JSON som valideres mot schema.

**Eksempel**
```json
{
  "deck": {
    "title": "Ukesstatus – uke 50",
    "language": "no",
    "themeId": "nordic_light",
    "brandKit": {
      "logoUrl": "https://...",
      "primaryColor": "#123456",
      "secondaryColor": "#abcdef"
    }
  },
  "slides": [
    {
      "type": "cover",
      "layoutVariant": "cover_a",
      "blocks": [
        { "kind": "title", "text": "Ukesstatus – uke 50" },
        { "kind": "text", "text": "Produktteam • 15. desember 2025" }
      ]
    }
  ]
}
```

### 7.3 Block-typer (MVP)
- `title` (text)
- `text` (text)
- `bullets` (array[string])
- `image` (url + alt + cropMode)
- `table` (columns + rows)
- `callout` (text)

---

## 8. AI-pipeline (MVP)

### 8.1 Trinn
1. **Outline generation** → outline schema
2. **Slide content generation** → blocks per slide schema
3. **Layout assignment** → velg `layoutVariant` basert på innholdslengde
4. **Validation & repair**
   - JSON schema validering
   - constraint checks (tekst/bullets/tabell)
   - repair prompts: kort ned / splitt / reformat
5. **Rendering**
   - web deck (source of truth)
   - PDF via headless browser
   - PPTX via renderer som mapper slide-typer til PPTX layouts

### 8.2 Guardrails (må)
- Hard constraints per slide-type:
  - maks tegn per block
  - maks bullets
  - maks tabellrader/kolonner
- Overflow-handtering:
  - “kort ned” ELLER “splitt slide”
- MVP-policy for fakta:
  - Ikke oppgi konkrete tall/statistikk hvis ikke levert av input (eller marker som estimat).

---

## 9. Layout- og innholdsconstraints (MVP)

> Dette er avgjørende for “premium look”. Constraints håndheves i valideringslaget.

Eksempel (kan justeres):
- `cover`: title <= 60 tegn, subtitle <= 120
- `bullets`: title <= 70, bullets 3–6, hver bullet <= 120
- `two_column_text`: hver kolonne <= 350 tegn
- `text_plus_image`: tekst <= 450 tegn + 1 bilde
- `decisions_list`: 3–7 beslutninger, hver <= 140 tegn
- `action_items_table`: maks 8 rader, 3 kolonner (oppgave/eier/frist)
- `summary_next_steps`: 3–6 punkter

Fallback:
- Hvis over: shorten → hvis fortsatt over → split slide.

---

## 10. Ikke-funksjonelle krav (NFR)

### 10.1 Ytelse
- Asynkrone jobber (queue + workers)
- Mål: 10 slides uten bilder < 60–90 sek (best effort)

### 10.2 Pålitelighet
- Retries på modellkall
- Idempotency keys på API
- Robust feilhåndtering + tydelige error codes

### 10.3 Sikkerhet
- TLS in transit
- Kryptering at rest
- Strict multi-tenant isolasjon
- Signed URLs med utløp for eksportfiler

### 10.4 Personvern/GDPR (strategi-avhengig)
- EU-hosting foretrukket
- Retention policy (eksporter kan slettes etter X dager)
- “No training on customer data” for business tier

### 10.5 Observability
- Per-job timings (pipeline-steg)
- Token-/bildekost per generering
- Event tracking:
  - `deck_create_started`, `outline_generated`, `deck_generated`,
    `agent_action_used`, `export_pdf_clicked`, `export_pptx_clicked`,
    `share_link_created`, `generation_failed`

---

## 11. Prioritering (MVP must/should/could)

### Must have (MVP)
- Prompt + paste notes
- Outline-first + redigering
- 8–10 slide-typer (min. cover, bullets, two-column, image+text, actions, decisions, summary)
- 5 temaer + brand kit light
- Viewer + lettvekts redigering
- AI-handlinger (min. 3 per slide + 1 global)
- Share link view-only
- PDF eksport
- PPTX eksport (for MVP slide-typer)
- API (create + status + result URLs)
- API keys + rate limiting + logging

### Should have (MVP+ / V1.1)
- Unsplash/stock provider
- Cancel job endpoint
- Webhook callbackUrl
- Bedre “split slide”-UI

### Could have (V2)
- Template import (PPTX/PDF → theme/layout extraction)
- Charts fra data
- Samarbeid, kommentarer, versjonering

---

## 12. Risikoer og mitigering

1. **PPTX fidelity (høy risiko)**
   - Mitigering: begrens templates og bygg renderer spesifikt.
   - “PPTX safe mode”: enklere layouts, mer stabilt.

2. **Variasjon i AI-kvalitet**
   - Mitigering: outline-first + schema + constraints + repair.

3. **Kostnad per generering**
   - Mitigering: rate limits, caching, image off by default for API-planer.

4. **Bilderettigheter**
   - Mitigering: default AI-bilder + tydelig policy; stock-kilde med klare vilkår hvis lagt til.

5. **Skalering**
   - Mitigering: kø + autoskalering av workers; concurrency per workspace.

---

## 13. MVP Definition of Done (DoD)
MVP er ferdig når:
- Ny bruker kan generere et norsk deck fra prompt eller notater.
- Outline kan redigeres før generering.
- Deck rendres pent i web viewer med 5 temaer.
- Bruker kan gjøre basisredigering + minst 3 AI-handlinger.
- Delbar view-only lenke fungerer.
- PDF eksport fungerer stabilt.
- PPTX eksport fungerer stabilt for støttede slide-typer, med redigerbar tekst.
- API støtter async generering + polling + signed URLs til output.
- API key management, rate limiting og logging er på plass.

---

## 14. Vedlegg A — Feilkoder (forslag)
- `INVALID_REQUEST` (mangler felter, ugyldig enum)
- `UNAUTHORIZED` (ugyldig API key)
- `RATE_LIMITED`
- `MODEL_ERROR`
- `RENDER_ERROR_PDF`
- `RENDER_ERROR_PPTX`
- `INTERNAL_ERROR`

---

## 15. Vedlegg B — API eksempel

### POST /v1/generations
```json
{
  "inputText": "Møtereferat: ...",
  "textMode": "condense",
  "language": "no",
  "tone": "profesjonell",
  "amount": "medium",
  "numSlides": 10,
  "themeId": "nordic_light",
  "imageMode": "ai",
  "imageStyle": "editorial",
  "exportAs": ["pdf", "pptx"]
}
```

### GET /v1/generations/{id}
```json
{
  "status": "completed",
  "viewUrl": "https://app.dittdomene.no/view/deck_123",
  "pdfUrl": "https://storage...signed.pdf",
  "pptxUrl": "https://storage...signed.pptx",
  "expiresAt": "2025-12-15T23:59:59Z"
}
```
