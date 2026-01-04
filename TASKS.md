# TASKS.md — Aktive oppgaver

> **Aktiv fase:** Fase 8 (Supabase Auth & Production Readiness)
> **Sist oppdatert:** 2026-01-04

---

## Fase 8: Supabase Auth & Production Readiness (Aktiv)

**Mål:** Implementer produksjonsklar autentisering, workspace management, API key management og team collaboration.

**Strategi:** Hybrid auth - Supabase Auth for webapp, custom API keys for API (bevarer eksisterende API-kontrakt).

**Plan-referanse:** `/Users/sanderhelmers-olsen/.claude/plans/sprightly-swinging-boot.md`

### 8.1 Supabase Setup & Database Migration (Komplett)
- [x] **T8.1.1** Opprett Supabase-prosjekt via MCP (region: eu-central-1)
- [x] **T8.1.2** Installer Supabase dependencies (@supabase/supabase-js, @supabase/ssr, @supabase/auth-helpers-nextjs)
- [x] **T8.1.3** Generer initial migration fra Prisma schema med RLS policies
- [x] **T8.1.4** Oppdater environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.)
- [x] **T8.1.5** Generer TypeScript types fra Supabase schema

### 8.2 Supabase Auth Integration (Komplett)
- [x] **T8.2.1** Opprett Supabase clients (admin, server, browser) - src/lib/db/supabase*.ts
- [x] **T8.2.2** Implementer auth endpoints (signup, login, logout) - src/app/api/auth/
- [x] **T8.2.3** Oppdater login/signup pages med faktisk auth - src/app/login/, src/app/signup/
- [x] **T8.2.4** Implementer middleware for protected routes - src/middleware.ts

### 8.3 Workspace Management (Komplett)
- [x] **T8.3.1** Workspace Context Provider - src/lib/context/WorkspaceContext.tsx
- [x] **T8.3.2** Workspace Switcher Component - src/components/workspace/WorkspaceSwitcher.tsx
- [x] **T8.3.3** Workspace Settings Page - src/app/settings/workspace/page.tsx
- [x] **T8.3.4** Workspace API endpoints - src/app/api/workspaces/[id]/route.ts

### 8.4 API Key Management UI (Komplett)
- [x] **T8.4.1** API Key Settings Page - src/app/settings/api-keys/page.tsx
- [x] **T8.4.2** API Key endpoints (list, create, revoke) - src/app/api/workspaces/[workspaceId]/api-keys/

### 8.5 Team Management (Komplett)
- [x] **T8.5.1** Team Settings Page - src/app/settings/team/page.tsx
- [x] **T8.5.2** Team API endpoints - src/app/api/workspaces/[workspaceId]/members/
- [x] **T8.5.3** Invitation acceptance route - src/app/invite/[token]/page.tsx

### 8.6 Settings Layout & Polish (Komplett)
- [x] **T8.6.1** Settings Layout med sidebar og responsive mobile menu - src/app/settings/layout.tsx
- [x] **T8.6.2** Account Settings Page med name update - src/app/settings/account/page.tsx
- [x] **T8.6.3** Responsive design og loading states (verified existing pages)
- [x] **T8.6.4** Form validation og error handling (Zod validation + success/error states)

### 8.7 Testing, Security & Documentation (Komplett)
- [x] **T8.7.1** Security audit (RLS policies, middleware, auth patterns) - Completed 2026-01-04
- [x] **T8.7.2** Security testing documentation (32 test cases) - docs/SECURITY_TESTING.md
- [x] **T8.7.3** README.md med komplett Supabase setup guide
- [x] **T8.7.4** Migration guide fra Prisma til Supabase - docs/SUPABASE_MIGRATION.md
- [x] **T8.7.5** Build verification (all routes compile cleanly)
- [ ] **T8.7.6** Manual security test execution (documented, pending)
- [ ] **T8.7.7** Rate limiting implementation (production requirement)
- [ ] **T8.7.8** Audit logging implementation (production requirement)

---

## Fase 7.x - Slide Count Inkonsistens Fix (Komplett)

**Problem:** Bruker velger 8 slides, men UI viser inkonsistente tall:
- Header: "6 / 8 slides" (blander faktisk og forventet)
- Status: "Genererer slide 1 av 8" (bruker forventet)
- Faktisk: 6 slides generert

**Rotårsak:** Flere kilder til slide-telling brukes inkonsistent:
- `request.numSlides` (brukerens valg)
- `outline.slides.length` (faktisk AI-output)
- Disse kan være ulike fordi AI ikke alltid følger instruksjoner

### 7.x.1 Types og Events (Komplett)
- [x] **T7.x.1.1** Legg til `requestedSlides` og `actualSlides` i StreamEventData
  - src/lib/streaming/types.ts
- [x] **T7.x.1.2** Send nye felter i alle SSE events
  - src/lib/queue/generation-worker.ts

### 7.x.2 Frontend State (Komplett)
- [x] **T7.x.2.1** Track requestedSlides og actualSlides i hook
  - src/hooks/useGenerationStream.ts
- [x] **T7.x.2.2** Bruk konsistent kilde i GenerateStep
  - src/components/wizard/GenerateStep.tsx
- [x] **T7.x.2.3** Bruk konsistent kilde i GenerationHeader
  - src/components/generation/GenerationHeader.tsx (mottar korrekte verdier via props)
- [x] **T7.x.2.4** Bruk konsistent kilde i LivePreview
  - src/components/wizard/LivePreview.tsx (mottar korrekte verdier via props)

### 7.x.3 Bruker-kommunikasjon (Komplett)
- [x] **T7.x.3.1** Vis toast/melding ved avvik mellom forespurt og faktisk
  - src/components/wizard/GenerateStep.tsx

### 7.x.4 Testing (Pending)
- [ ] **T7.x.4.1** Manuell test med ulike numSlides-verdier
- [ ] **T7.x.4.2** Verifiser konsistent visning i alle komponenter

---

## Fase 6 - Frontend Editor (Komplett)

### 6.1 UI Grunnmur (Komplett)
- [x] **T6.1.1** UI komponenter (Button, Dropdown, Modal, Toast, LoadingSpinner)
- [x] **T6.1.2** Deck CRUD operasjoner (src/lib/db/deck.ts)
- [x] **T6.1.3** EditorState types og reducer (src/lib/editor/)
- [x] **T6.1.4** EditorProvider context
- [x] **T6.1.5** Undo/redo history (integrert i reducer)

### 6.2 Sideruter og API (Komplett)
- [x] **T6.2.1** Dashboard page (src/app/page.tsx)
- [x] **T6.2.2** API-ruter for decks (src/app/api/decks/)
- [x] **T6.2.3** Public view page (src/app/view/[token]/page.tsx)
- [x] **T6.2.4** Editor page shell (src/app/deck/[id]/page.tsx)

### 6.3 Wizard (Komplett)
- [x] **T6.3.1** WizardStepper, InputStep, OutlineStep, GenerateStep
- [x] **T6.3.2** Wizard page (src/app/new/page.tsx)

### 6.4 Editor Layout (Komplett)
- [x] **T6.4.1** EditorLayout 3-panel komponent (SlideList, Canvas, Inspector)
- [x] **T6.4.2** SlideList med drag-and-drop reordering
- [x] **T6.4.3** Inspector panel med tema-selector og slide-properties

### 6.5 Inline Redigering (Komplett 2025-12-16)
- [x] **T6.5.1** Constraint-utilities (truncate, validate) - src/lib/editor/constraints.ts
- [x] **T6.5.2** TitleBlock med isEditing-modus (contentEditable, 120 tegn)
- [x] **T6.5.3** TextBlock med isEditing-modus (contentEditable, 500 tegn)
- [x] **T6.5.4** BulletsBlock med item-level editing (Enter/Backspace/Arrow nav)
- [x] **T6.5.5** CalloutBlock med isEditing-modus (contentEditable, 300 tegn)
- [x] **T6.5.6** TableBlock med celle-editing (Tab/Arrow nav, add/delete rows/cols)
- [x] **T6.5.7** EditableBlockRenderer factory - src/components/blocks/EditableBlockRenderer.tsx
- [x] **T6.5.8** SmartBlockRenderer + integrasjon i alle 10 slide-komponenter
- [x] **T6.5.9** Editor page integrasjon med editable={true}

### 6.6 Constraint-validering og Overflow (Komplett 2025-12-16)
- [x] **T6.6.1** useBlockValidation hook med real-time validering
- [x] **T6.6.2** CharacterCounter komponent (grønn→gul→orange→rød)
- [x] **T6.6.3** OverflowWarning og CompactOverflowWarning komponenter
- [x] **T6.6.4** Integrert validering i EditableBlockRenderer
- [x] **T6.6.5** Save-blokkering ved violations i editor page

### 6.7 AI-handlinger (Komplett 2025-12-19)
- [x] **T6.7.1** AI Edit Actions Utility (aiShortenSlide, aiSplitSlide)
- [x] **T6.7.2** AI_REPLACE_SLIDE og AI_SPLIT_SLIDE actions i reducer
- [x] **T6.7.3** API endpoint POST /api/decks/[id]/ai
- [x] **T6.7.4** useSlideAIActions hook
- [x] **T6.7.5** AIActionsMenu UI komponent
- [x] **T6.7.6** Integrasjon i SlideList med violation-indikator

### 6.8 Deling og Eksport UI (Komplett 2025-12-19)
- [x] **T6.8.1** Share API endpoint (POST/DELETE/GET) - src/app/api/decks/[id]/share/
- [x] **T6.8.2** Export API endpoints med polling - src/app/api/decks/[id]/export/
- [x] **T6.8.3** useShare hook - src/lib/hooks/useShare.ts
- [x] **T6.8.4** useExport hook med status-polling - src/lib/hooks/useExport.ts
- [x] **T6.8.5** ShareModal UI komponent - src/components/editor/ShareModal.tsx
- [x] **T6.8.6** ExportModal UI komponent - src/components/editor/ExportModal.tsx
- [x] **T6.8.7** Header-integrasjon med Del/Eksporter-knapper

### 6.9 Auto-save og Polish (Komplett 2025-12-19)
- [x] **T6.9.1** useDebounce utility hooks - src/lib/hooks/useDebounce.ts
- [x] **T6.9.2** useAutoSave hook med 3s debounce - src/lib/hooks/useAutoSave.ts
- [x] **T6.9.3** SaveStatus komponent - src/components/editor/SaveStatus.tsx
- [x] **T6.9.4** Fjernet duplikat Cmd+S handler
- [x] **T6.9.5** beforeunload advarsel ved ulagrede endringer

---

## Oppdaget under arbeid

- Tailwind CSS 4 krever @tailwindcss/postcss (ikke tailwindcss direkte)
- Prisma build-scripts må godkjennes manuelt: `pnpm approve-builds`
- Prisma 7 krever prisma.config.ts og @prisma/adapter-pg for PostgreSQL
- Playwright Chromium kreves for PDF-export: `npx playwright install chromium`

---

## Fullførte oppgaver

### Fase 5: Export - PDF & PPTX (Komplett 2025-12-15)

- [x] **T5.1.1** Installer AWS SDK v3 og opprett S3 klient
  - src/lib/storage/s3-client.ts med MinIO-støtte
  - uploadFile, generateSignedUrl, deleteFile, fileExists

- [x] **T5.1.2** Opprett signed URL generator
  - calculateExpiryDate, generateExportKey
  - Konfigurerbar utløpstid via EXPORT_URL_EXPIRY

- [x] **T5.2.1** Opprett export job queue
  - src/lib/queue/export-queue.ts med BullMQ
  - ExportJobData interface med format, themeId, brandKit

- [x] **T5.2.2** Opprett ExportJob CRUD
  - src/lib/db/export-job.ts med full CRUD
  - getLatestCompletedExport, deleteExpiredExportJobs

- [x] **T5.2.3-4** Opprett export worker og script
  - src/lib/queue/export-worker.ts
  - src/lib/queue/start-export-worker.ts
  - package.json script: "export-worker"

- [x] **T5.3.1-2** PDF renderer og slide HTML generator
  - src/lib/export/pdf-renderer.ts med Playwright
  - src/lib/export/slide-html.ts med renderToStaticMarkup
  - pdf-lib for merging multi-page PDFs

- [x] **T5.3.3-4** PDF worker integration og smoketests
  - Integrert i export-worker.ts
  - Verifiserer sideantall matcher slideantall

- [x] **T5.4.1-4** PPTX renderer og mappere
  - src/lib/export/pptx-renderer.ts med PptxGenJS
  - src/lib/export/pptx-theme-mapper.ts
  - Alle 9 slide-typer støttet

- [x] **T5.4.5-6** PPTX worker integration og smoketests
  - Integrert i export-worker.ts
  - Verifiserer OOXML-struktur

- [x] **T5.5.1-4** API integrasjon og schema-oppdatering
  - GenerationJob.pdfUrl, pptxUrl, exportExpiresAt
  - GET /v1/generations/{id} returnerer export URLs
  - generation-worker trigger export jobs via exportAs

- [x] **T5.6.1** Opprett eksport integrasjonstester
  - src/lib/export/__tests__/pdf-renderer.test.ts
  - src/lib/export/__tests__/pptx-renderer.test.ts
  - src/lib/export/__tests__/integration.test.ts
  - 134 tester passerer

- [x] **T5.6.2** Golden test fixtures
  - testdata/fixtures/deck-example.json

- [x] **T5.6.3** Oppdater dokumentasjon
  - .env.example med S3 og export config
  - TASKS.md oppdatert

### Fase 4: Web Rendering (Komplett 2025-12-15)

- [x] **T4.1.1** Opprett 10 slide-type komponenter
  - src/components/slides/ med alle slide-typer
  - CoverSlide, AgendaSlide, BulletsSlide, etc.

- [x] **T4.2.1** Implementer 5 temaer med CSS variables
  - src/lib/themes/ med theme-config.ts
  - nordic_light, nordic_dark, corporate_blue, minimal_warm, modern_contrast

- [x] **T4.3.1** Opprett SlideViewer komponent
  - src/components/viewer/SlideViewer.tsx
  - 16:9 canvas med tema-støtte

### Fase 3: Jobbkø og API (Komplett 2025-12-15)

- [x] **T3.1.0** Opprett Prisma Client Singleton
  - src/lib/db/prisma.ts med Prisma 7 adapter pattern

- [x] **T3.1.1** Installer BullMQ og konfigurer Redis-tilkobling
  - src/lib/queue/redis.ts med IORedis singleton
  - src/lib/queue/generation-queue.ts med BullMQ kø

- [x] **T3.1.2** Opprett GenerationJob CRUD
  - src/lib/db/generation-job.ts med alle CRUD-funksjoner
  - Multi-tenant isolasjon via workspaceId

- [x] **T3.1.3** Opprett generation-worker
  - src/lib/queue/generation-worker.ts med progress callback
  - src/lib/queue/start-worker.ts for oppstart

- [x] **T3.2.0** Opprett API error types
  - src/lib/api/errors.ts med ApiError klasse og mapping

- [x] **T3.2.1** Opprett POST /v1/generations endpoint
  - src/app/api/v1/generations/route.ts
  - Validerer request, auth, rate limit, idempotency

- [x] **T3.2.2** Opprett GET /v1/generations/{id} endpoint
  - src/app/api/v1/generations/[id]/route.ts
  - Returnerer status, progress, viewUrl, error

- [x] **T3.3.1** Implementer API key auth
  - src/lib/api/auth.ts med SHA-256 hashing
  - Støtter Bearer token og X-Api-Key header

- [x] **T3.3.2** Implementer rate limiting
  - src/lib/api/rate-limit.ts med sliding window
  - Per-minute og per-day limits

### Fase 2: AI Pipeline (Komplett 2025-12-15)

- [x] **T2.1.1** Installer OpenAI SDK og opprett LLM-klient
  - src/lib/ai/llm-client.ts med OpenAIClient og LLMError

- [x] **T2.1.2** Opprett konfigurerbar AI-abstraksjon
  - FAKE_LLM=true støttet med MockLLMClient

- [x] **T2.1.3** Feilhåndtering og retry
  - Retry-logikk, rate limiting, JSON parse error håndtering

- [x] **T2.2.1** Opprett outline-generering prompt
  - src/lib/ai/prompts/outline.ts

- [x] **T2.2.2** Opprett content-generering prompt
  - src/lib/ai/prompts/content.ts

- [x] **T2.2.3** Opprett repair-prompt for constraint-brudd
  - src/lib/ai/prompts/repair.ts med shorten og split

- [x] **T2.3.1** Implementer genererings-pipeline
  - src/lib/ai/pipeline.ts med GenerationPipeline klasse

- [x] **T2.3.2** Implementer constraint-validering
  - src/lib/ai/validation.ts wrapper

- [x] **T2.3.3** Implementer layout assignment
  - src/lib/ai/layout.ts med assignLayoutVariant

- [x] **T2.4.1** Golden testdata
  - testdata/prompts/ og testdata/fixtures/

- [x] **T2.4.2-4** Unit og integrasjonstester
  - 78 tester i src/lib/ai/__tests__/
  - Vitest konfigurert med vitest.config.ts

### Fase 1: Fundament (Komplett 2025-12-15)

- [x] **T1.1.1** Initialiser Next.js 14+ med TypeScript, App Router
  - Next.js 16 med Tailwind CSS 4, ESLint, Prettier

- [x] **T1.1.2** Konfigurer ESLint og Prettier
  - .eslintrc.json og .prettierrc opprettet

- [x] **T1.1.3** Opprett .env.example med nødvendige variabler
  - DATABASE_URL, REDIS_URL, OPENAI_API_KEY, S3_* dokumentert

- [x] **T1.2.1** Opprett docker-compose.yml med Postgres og Redis
  - Postgres 16-alpine på 5432, Redis 7-alpine på 6379

- [x] **T1.2.2** Installer og konfigurer Prisma
  - prisma/schema.prisma opprettet

- [x] **T1.2.3** Definer database-schema
  - Alle 8 entiteter: User, Workspace, WorkspaceMember, ApiKey, Deck, Slide, Block, GenerationJob, ExportJob

- [x] **T1.3.1** Opprett Zod-schema for Deck
  - src/lib/schemas/deck.ts med DeckSchema, GenerationRequestSchema, GenerationResponseSchema

- [x] **T1.3.2** Opprett Zod-schema for Slide med alle 10 typer
  - src/lib/schemas/slide.ts med SlideType enum og OutlineSchema

- [x] **T1.3.3** Opprett Zod-schema for Block
  - src/lib/schemas/block.ts med 6 block-typer

- [x] **T1.3.4** Opprett constraints-konfigurasjon per slide-type
  - src/lib/validation/constraints.ts med alle PRD §9 begrensninger

- [x] **T1.4.1** Verifiser at dev-miljø kjører
  - `pnpm build` kompilerer uten feil
