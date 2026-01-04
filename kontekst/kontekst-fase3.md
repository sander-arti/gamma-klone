# Kontekst — Fase 3: Jobbkø og API

> Logg for arbeid utført i Fase 3.

---

## 2025-12-15 - Fase 3 Komplett

**What:** Fullførte Fase 3: Jobbkø og API - BullMQ, Redis, REST API og worker

**Why:** Etablere asynkron genereringsflyt via API med status-polling

**How:**

### Database-lag (T3.1.0-T3.1.2)
- `src/lib/db/prisma.ts`: Prisma 7 singleton med adapter pattern
  - Krevde oppdatering til ny Prisma 7 konfigurasjon
  - prisma.config.ts opprettet for database URL
  - @prisma/adapter-pg for PostgreSQL-støtte
- `src/lib/db/generation-job.ts`: CRUD-funksjoner med multi-tenant isolasjon
  - createGenerationJob, getGenerationJobById, updateJobStatus
  - setJobResult, markJobFailed, getJobByIdempotencyKey

### Redis og Kø (T3.1.2-T3.1.3)
- `src/lib/queue/redis.ts`: IORedis singleton
  - Automatisk reconnect-logikk
  - Separate connections for main app og workers
- `src/lib/queue/generation-queue.ts`: BullMQ kø
  - GenerationJobData interface
  - Retry (3 forsøk) med eksponentiell backoff
  - Job cleanup (24h completed, 7d failed)

### API-infrastruktur (T3.2.0, T3.3.1-T3.3.2)
- `src/lib/api/errors.ts`: Standard feilkoder (PRD §14)
  - INVALID_REQUEST, UNAUTHORIZED, RATE_LIMITED, MODEL_ERROR, INTERNAL_ERROR
  - ApiError klasse med toResponse()
- `src/lib/api/auth.ts`: API key validering
  - SHA-256 hashing av keys
  - Støtter Bearer token og X-Api-Key header
  - Sjekker expiry og revoked status
- `src/lib/api/rate-limit.ts`: Redis-basert sliding window
  - Per-minute og per-day limits
  - X-RateLimit-* headers

### API Endpoints (T3.2.1-T3.2.2)
- `src/app/api/v1/generations/route.ts`: POST endpoint
  - Validerer auth, rate limit, request body
  - Støtter Idempotency-Key header
  - Returnerer generationId + status
- `src/app/api/v1/generations/[id]/route.ts`: GET endpoint
  - Multi-tenant isolasjon (404 for andre workspaces)
  - Returnerer status, progress, viewUrl, error

### Worker (T3.1.4-T3.1.5)
- `src/lib/queue/generation-worker.ts`: BullMQ worker
  - Prosesserer jobber med GenerationPipeline
  - Progress callback med debouncing (1/sek)
  - Oppretter Deck, Slide, Block i transaksjon
- `src/lib/queue/start-worker.ts`: Startup script
  - Graceful shutdown (SIGINT/SIGTERM)
  - `pnpm worker` for å starte

**Ny dependencies:**
- bullmq ^5.66.0
- ioredis ^5.8.2
- @prisma/adapter-pg ^7.1.0
- pg ^8.16.3
- dotenv ^17.2.3
- tsx ^4.21.0

**Environment variables (ny):**
- RATE_LIMIT_PER_MINUTE=10
- RATE_LIMIT_PER_DAY=100
- WORKER_CONCURRENCY=2
- NEXT_PUBLIC_BASE_URL

**Check:**
- `pnpm build` kompilerer uten feil
- `pnpm test` kjører 78 tester grønt
- API routes registrert: `/api/v1/generations`, `/api/v1/generations/[id]`

**Filstruktur:**
```
src/
├── lib/
│   ├── db/
│   │   ├── prisma.ts              # Prisma 7 singleton
│   │   └── generation-job.ts      # Job CRUD
│   ├── queue/
│   │   ├── redis.ts               # Redis connection
│   │   ├── generation-queue.ts    # BullMQ queue
│   │   ├── generation-worker.ts   # Worker logic
│   │   └── start-worker.ts        # Worker entrypoint
│   └── api/
│       ├── errors.ts              # Error types
│       ├── auth.ts                # API key validation
│       └── rate-limit.ts          # Rate limiting
└── app/
    └── api/
        └── v1/
            └── generations/
                ├── route.ts           # POST handler
                └── [id]/
                    └── route.ts       # GET handler

prisma.config.ts                       # Prisma 7 config (ny)
```

**Risks:**
- Worker krever kjørende Redis for å starte
- Ingen tester for API endpoints ennå (kun build-verifisering)
- Rate limiting bruker lokal Redis, ikke distribuert lock

**Neste:** Fase 4 - Web Rendering (slide-komponenter, temaer, viewer)
