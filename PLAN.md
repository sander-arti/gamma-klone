# PLAN.md — Norsk AI-presentasjonsplattform MVP

> **Kilde-sannhet:** PRD.md definerer scope og DoD. Denne planen bryter MVP ned i implementerbare faser.

---

## Oversikt

**Prosjekt:** Gamma-klone — Norsk AI-presentasjonsplattform
**Scope:** MVP (ref. PRD.md §11 "Must have")
**Tech stack:** TypeScript/Node, Next.js 14+, PostgreSQL, Redis/BullMQ, S3-kompatibel lagring, Playwright, PptxGenJS, Zod, OpenAI

---

## Faser

### Fase 1: Fundament
**Mål:** Prosjektoppsett med kjørende dev-miljø, database-schema og kjernemodeller.

**Leveranser:**
- Next.js 14+ prosjekt med TypeScript, ESLint, Prettier
- PostgreSQL-oppsett med Prisma ORM
- Redis-tilkobling
- Zod-schemas for Deck/Slide/Block (ref. PRD §7)
- Env-konfigurasjon (.env.example)
- Docker Compose for lokal utvikling (Postgres + Redis)

**Kritiske filer:**
- `package.json`, `tsconfig.json`, `next.config.js`
- `prisma/schema.prisma`
- `src/lib/schemas/` (deck.ts, slide.ts, block.ts)
- `docker-compose.yml`

**Milepæl:** `pnpm dev` starter uten feil, Prisma migrering kjører.

---

### Fase 2: AI Pipeline (Kjerne)
**Mål:** Outline-first generering med strukturert JSON output og validering.

**Leveranser:**
- LLM-abstraksjon (OpenAI SDK, konfigurerbar)
- Outline-generering (prompt + schema)
- Content-generering per slide
- Layout-assignment basert på innhold
- Validation & repair (Zod + constraint-sjekk + repair-prompt)

**Kritiske filer:**
- `src/lib/ai/llm-client.ts`
- `src/lib/ai/prompts/` (outline.ts, content.ts, repair.ts)
- `src/lib/ai/pipeline.ts`
- `src/lib/validation/constraints.ts`

**Constraints (PRD §9):**
- cover: title ≤60, subtitle ≤120
- bullets: title ≤70, 3-6 bullets, hver ≤120
- two_column_text: hver kolonne ≤350
- text_plus_image: tekst ≤450
- decisions_list: 3-7 items, hver ≤140
- action_items_table: maks 8 rader, 3 kolonner
- summary_next_steps: 3-6 punkter

**Milepæl:** Unit-tester passerer for outline → content → validation pipeline med mock LLM.

---

### Fase 3: Jobbkø og API
**Mål:** Asynkron generering via API med status-polling.

**Leveranser:**
- BullMQ jobbkø-oppsett
- Worker for generering (outline → content → validate)
- `POST /v1/generations` endpoint
- `GET /v1/generations/{id}` endpoint
- API key auth + rate limiting middleware
- Feilkoder (PRD §14)

**Kritiske filer:**
- `src/lib/queue/generation-queue.ts`
- `src/lib/queue/generation-worker.ts`
- `src/app/api/v1/generations/route.ts`
- `src/app/api/v1/generations/[id]/route.ts`
- `src/middleware.ts` (auth + rate limit)

**Milepæl:** API kontrakttest passerer (POST → poll → completed/failed).

---

### Fase 4: Web Rendering
**Mål:** Viewer som rendrer Deck JSON til premium slides.

**Leveranser:**
- 10 slide-type komponenter (PRD §5.3):
  - cover, agenda, section_header, bullets
  - two_column_text, text_plus_image
  - decisions_list, action_items_table
  - summary_next_steps, quote_callout
- 5 temaer med CSS variables:
  - nordic_light, nordic_dark, corporate_blue
  - minimal_warm, modern_contrast
- Brand kit støtte (logo, primær/sekundærfarge)
- Responsive slide canvas (16:9)

**Kritiske filer:**
- `src/components/slides/` (én fil per type)
- `src/components/viewer/SlideViewer.tsx`
- `src/lib/themes/` (theme-config.ts + 5 tema-filer)
- `src/styles/themes/`

**Milepæl:** Alle 10 slide-typer rendrer korrekt med alle 5 temaer.

---

### Fase 5: Eksport (PDF + PPTX)
**Mål:** Pixel-perfect PDF og redigerbar PPTX fra Deck JSON.

**Leveranser:**
- PDF-eksport via Playwright/Chromium
- PPTX-eksport via PptxGenJS
- Signed URL-generering (S3-kompatibel)
- Export-jobbkø (egen worker)

**Kritiske filer:**
- `src/lib/export/pdf-renderer.ts`
- `src/lib/export/pptx-renderer.ts`
- `src/lib/storage/s3-client.ts`
- `src/lib/queue/export-worker.ts`

**Smoketester:**
- PDF: sideantall = slideantall, nøkkeltekst finnes
- PPTX: slideantall korrekt, tekst redigerbar i PowerPoint

**Milepæl:** Eksport-smoketester passerer for alle 10 slide-typer.

---

### Fase 6: Webapp UI
**Mål:** Komplett brukerflyt fra input til ferdig deck.

**Leveranser:**
- Landing/Dashboard
- "Ny presentasjon" flyt:
  - Input-valg (prompt/paste notes)
  - Parametre (språk, tone, tema, bilder)
  - Outline-editor (drag/drop, rediger titler)
  - Generer-knapp
- Viewer/Editor:
  - Slide-liste (venstre)
  - Canvas (midt)
  - Inspector (høyre)
- Lettvekts redigering (tekst, bullets, tema-bytte)
- AI-handlinger (kortere, mer profesjonell, regenerer bilde)
- Delbar lenke (view-only)
- Eksport-knapper (PDF/PPTX)

**Kritiske filer:**
- `src/app/page.tsx` (landing)
- `src/app/new/page.tsx` (ny presentasjon)
- `src/app/deck/[id]/page.tsx` (viewer/editor)
- `src/app/view/[id]/page.tsx` (public view-only)
- `src/components/editor/`

**Milepæl:** E2E-test: prompt → outline → deck → eksport PDF/PPTX.

---

### Fase 7: Polish og Deploy
**Mål:** Produksjonsklar med alle MVP-krav oppfylt.

**Leveranser:**
- Logging med requestId/generationId
- Error boundaries og bruker-feedback
- Security review (multi-tenant isolasjon, signed URLs)
- README.md med setup-instruksjoner
- CI/CD pipeline
- Deployment

**Milepæl:** MVP DoD (PRD §13) oppfylt.

---

## Avhengigheter mellom faser

```
Fase 1 (Fundament)
    │
    ├──► Fase 2 (AI Pipeline)
    │         │
    │         └──► Fase 3 (API) ──► Fase 5 (Eksport)
    │
    └──► Fase 4 (Web Rendering) ──► Fase 6 (Webapp UI)
                                          │
                                          └──► Fase 7 (Polish)
```

**Anbefalt rekkefølge:** 1 → 2 → 3 → 4 → 5 → 6 → 7

---

## Risikoer (ref. PRD §12)

| Risiko | Mitigering |
|--------|------------|
| PPTX fidelity | Begrens til MVP slide-types, test tidlig |
| AI-kvalitet variasjon | Outline-first + schema + constraints + repair |
| Kostnad per generering | Rate limits, image off by default for API |
| Bilderettigheter | AI-bilder default, tydelig policy |
| Skalering | BullMQ + autoskalering av workers |

---

## Out of scope (MVP)

- Sanntidssamarbeid
- Template import fra PPTX/PDF
- Avanserte animasjoner
- Full chart-/diagrameditor
- Dokument-/nettside-/SoMe-formater
- Webhook callbackUrl (V1.1)
- Stock-bilder via Unsplash (V1.1)
