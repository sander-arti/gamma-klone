# Kontekst - Fase 5: Export (PDF & PPTX)

## 2025-12-15 - Komplett eksport-implementasjon

**What:** Implementerte full eksport-pipeline med PDF og PPTX støtte, inkludert S3-lagring med signed URLs, asynkron jobbkjøring, og API-integrasjon.

**Why:** MVP-krav: PDF og PPTX eksport er førsteklasses funksjoner. Brukere må kunne laste ned presentasjonene sine i begge formater for bruk utenfor plattformen.

**How:**
1. **S3 Storage** - AWS SDK v3 med MinIO-støtte for lokal utvikling
   - `src/lib/storage/s3-client.ts` - upload, signed URL, delete, exists
   - Konfigurerbar utløpstid via `EXPORT_URL_EXPIRY`

2. **Export Queue** - BullMQ for asynkron eksport
   - `src/lib/queue/export-queue.ts` - job definitions
   - `src/lib/db/export-job.ts` - CRUD operations
   - `src/lib/queue/export-worker.ts` - job processor

3. **PDF Renderer** - Playwright + pdf-lib
   - `src/lib/export/slide-html.ts` - React → static HTML
   - `src/lib/export/pdf-renderer.ts` - HTML → PDF via Chromium
   - Multi-page PDF merging med pdf-lib

4. **PPTX Renderer** - PptxGenJS
   - `src/lib/export/pptx-theme-mapper.ts` - theme → PPTX styles
   - `src/lib/export/pptx-renderer.ts` - deck → PPTX buffer
   - Støtter alle 9 slide-typer med korrekt formatering

5. **API Integration**
   - `GET /v1/generations/{id}` returnerer `pdfUrl`, `pptxUrl`, `expiresAt`
   - `generation-worker` trigger export jobs via `exportAs` parameter
   - Signed URLs med konfigurerbar utløpstid

**Risks:**
- Playwright Chromium må installeres separat (`npx playwright install chromium`)
- PDF-rendering er ressurskrevende, kan trenge rate limiting i produksjon
- PPTX-fonter kan variere mellom systemer

**Key decisions:**
- Separate workers for generation og export (uavhengig skalering)
- Deck JSON er source-of-truth (web, PDF, PPTX deriverer fra samme data)
- Signed URLs istedenfor direkte S3-tilgang (sikkerhet)

**Tests:** 134 tester passerer, inkludert:
- PDF smoketests (sideantall, dimensjoner, format-validering)
- PPTX smoketests (OOXML-struktur, slide-innhold)
- Integrasjonstester for alle 9 slide-typer
