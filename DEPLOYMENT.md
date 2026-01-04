# Deployment Guide - Gamma Klone

**Stack:** Vercel (Frontend) + Railway (Backend/Workers/Database)
**Status:** ✅ Dag 1 Complete - Docker + CI/CD setup ferdig
**Neste:** Dag 2-3 - Deploy til staging

---

## Oversikt

```
┌─────────────┐
│   Vercel    │ ← Next.js SSR (API routes + frontend)
│  (Frontend) │
└──────┬──────┘
       │
       ├─── API calls ───→ ┌──────────────┐
       │                   │   Railway    │
       │                   │  (Backend)   │
       │                   ├──────────────┤
       │                   │  Postgres    │ ← Database
       │                   │  Redis       │ ← Queue
       │                   │  Workers     │ ← BullMQ (generation/export)
       │                   │  S3 Storage  │ ← Files (PDF/PPTX)
       └───────────────────┴──────────────┘
```

---

## Dag 1: ✅ FULLFØRT

**Hva er oppnådd:**
- ✅ `Dockerfile.web` - Next.js multi-stage build med standalone output
- ✅ `Dockerfile.worker` - BullMQ workers med Playwright/Chromium
- ✅ `.dockerignore` - Build context redusert fra ~1GB til <100MB
- ✅ `.github/workflows/ci-cd.yml` - CI/CD pipeline (lint/test/build/deploy)
- ✅ `railway.toml` - Railway service configuration
- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `/api/health` endpoint for healthchecks
- ✅ Docker build verifisert (gamma-web:latest image)

**Files opprettet:**
- `Dockerfile.web` (100 linjer)
- `Dockerfile.worker` (117 linjer)
- `.dockerignore` (72 linjer)
- `src/app/api/health/route.ts` (40 linjer)
- `.github/workflows/ci-cd.yml` (235 linjer)
- `railway.toml` (140 linjer)
- `vercel.json` (47 linjer)

**Files modifisert:**
- `next.config.ts` - La til `output: "standalone"`

---

## Dag 2: Vercel Setup (Frontend)

### 1. Opprett Vercel Project

```bash
# Install Vercel CLI (hvis ikke installert)
pnpm add -g vercel

# Login
vercel login

# Link project til Vercel
vercel link
```

**Eller via Vercel Dashboard:**
1. Gå til https://vercel.com/new
2. Koble til GitHub repo
3. Velg `main` branch
4. Framework preset: Next.js
5. Root directory: `.`
6. Build command: `pnpm build`
7. Output directory: `.next`

### 2. Konfigurer Environment Variables

**Vercel Dashboard → Settings → Environment Variables:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview |
| `DATABASE_URL` | Fra Railway (Step 3) | Production, Preview |
| `REDIS_URL` | Fra Railway (Step 3) | Production, Preview |
| `OPENAI_API_KEY` | `sk-...` | Production, Preview |
| `GEMINI_API_KEY` | `AIza...` | Production, Preview |
| `S3_ENDPOINT` | Fra Railway eller ekstern | Production, Preview |
| `S3_ACCESS_KEY` | Fra Railway eller ekstern | Production, Preview |
| `S3_SECRET_KEY` | Fra Railway eller ekstern | Production, Preview |
| `S3_BUCKET` | `gamma-klone-prod` | Production, Preview |
| `APP_SECRET` | Generer 256-bit random string | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://gamma-klone.vercel.app` | Production |
| `NEXT_PUBLIC_BASE_URL` | `https://gamma-klone.vercel.app` | Production |

**Generer APP_SECRET:**
```bash
openssl rand -hex 32
```

### 3. Deploy til Vercel

```bash
# Deploy til staging (preview)
vercel

# Deploy til production (kun når staging er testet)
vercel --prod
```

**Verifiser deployment:**
```bash
curl https://gamma-klone-staging.vercel.app/api/health
# Expected: {"status":"healthy","timestamp":"...","service":"gamma-klone-web"}
```

---

## Dag 3: Railway Setup (Backend)

### 1. Opprett Railway Project

1. Gå til https://railway.app/new
2. Velg "Deploy from GitHub repo"
3. Koble til `Gamma-klone` repo
4. Railway vil auto-detektere `railway.toml`

### 2. Sett opp Database Services

**Postgres:**
```bash
# Railway Dashboard → New → Database → PostgreSQL
# Railway auto-genererer DATABASE_URL
```

**Redis:**
```bash
# Railway Dashboard → New → Database → Redis
# Railway auto-genererer REDIS_URL
```

**Object Storage:**
- Enten bruk Railway S3-kompatibel storage
- Eller koble til ekstern (AWS S3, Backblaze B2, etc.)

### 3. Sett opp Worker Service

**Railway Dashboard → New → Service → Deploy from Dockerfile:**
- Dockerfile path: `Dockerfile.worker`
- Service name: `gamma-klone-worker`

**Environment Variables (Worker):**
| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | Auto fra Postgres service | Railway |
| `REDIS_URL` | Auto fra Redis service | Railway |
| `OPENAI_API_KEY` | `sk-...` | Manual |
| `GEMINI_API_KEY` | `AIza...` | Manual |
| `S3_ENDPOINT` | Fra object storage | Manual |
| `S3_ACCESS_KEY` | Fra object storage | Manual |
| `S3_SECRET_KEY` | Fra object storage | Manual |
| `S3_BUCKET` | `gamma-klone-prod` | Manual |
| `NODE_ENV` | `production` | Manual |
| `WORKER_CONCURRENCY` | `2` | Manual |

### 4. Kjør Database Migrations

```bash
# Via Railway CLI
railway run pnpm prisma migrate deploy

# Eller via Railway dashboard terminal
pnpm prisma migrate deploy
```

### 5. Verifiser Worker Deployment

**Railway Dashboard → gamma-klone-worker → Logs:**
```
Starting all workers...
Environment: production
[Generation] Worker started
[Export] Worker started
[Extraction] Worker started
All workers started and waiting for jobs...
```

---

## Dag 4: Integration Testing

### 1. Test Full Stack

**Test healthcheck (Vercel):**
```bash
curl https://gamma-klone-staging.vercel.app/api/health
```

**Test generering (Vercel → Railway):**
```bash
curl -X POST https://gamma-klone-staging.vercel.app/api/v1/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "inputText": "Test presentation about AI",
    "intent": "generate"
  }'
```

**Test eksport (PDF + PPTX):**
```bash
# Get deck ID fra generering response
curl https://gamma-klone-staging.vercel.app/api/decks/{deckId}/export \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"format": "pdf"}'
```

### 2. Smoke Tests

**Kjør smoke tests lokalt:**
```bash
# Pek til staging environment
export NEXT_PUBLIC_APP_URL=https://gamma-klone-staging.vercel.app
pnpm test:smoke
```

**Verifiser:**
- [ ] Healthcheck returnerer 200 OK
- [ ] Kan opprette workspace
- [ ] Kan generere outline
- [ ] Kan generere full presentasjon
- [ ] Kan eksportere til PDF
- [ ] Kan eksportere til PPTX
- [ ] Workers prosesserer jobber uten timeout
- [ ] Database migrasjoner kjørte uten feil

---

## Dag 5: Production Deploy

### 1. Pre-Deploy Checklist

- [ ] Alle staging smoke tests er grønne
- [ ] Database backup er tatt (Railway auto-backup)
- [ ] Rollback plan er klar
- [ ] Rate limiting er konfigurert
- [ ] Monitoring er satt opp (Railway + Vercel analytics)

### 2. Deploy til Production

**Vercel:**
```bash
# Deploy main branch to production
vercel --prod
```

**Railway:**
```bash
# Railway auto-deployer ved push til main
# Eller manuelt trigger deploy i Railway dashboard
```

### 3. Post-Deploy Verification

**Smoke tests på prod:**
```bash
export NEXT_PUBLIC_APP_URL=https://gamma-klone.vercel.app
pnpm test:smoke
```

**Monitor logs:**
- Vercel: https://vercel.com/dashboard/logs
- Railway: https://railway.app/project/{id}/logs

**Check feilrater:**
- Vercel Analytics → Error rate < 1%
- Railway Logs → Worker errors < 5 per hour

---

## Environment Variables - Full Liste

**Påkrevd for alle miljøer (staging + production):**

```bash
# Supabase (Auth + Database)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Railway Postgres)
DATABASE_URL=

# Redis (Railway Redis)
REDIS_URL=

# AI Services
OPENAI_API_KEY=
GEMINI_API_KEY=

# Object Storage (S3-compatible)
S3_ENDPOINT=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=

# App Config
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_BASE_URL=
APP_SECRET=
NODE_ENV=production

# Workers
WORKER_CONCURRENCY=2

# Optional
RATE_LIMIT_PER_MINUTE=10
RATE_LIMIT_PER_DAY=100
EXPORT_URL_EXPIRY=3600
```

---

## Troubleshooting

### Build Failures

**Docker build fails med "Missing env.XXX":**
- Sjekk at alle env vars i `Dockerfile.web` er satt
- Dette er placeholder-verdier for build time
- De overrides av Railway/Vercel ved runtime

**Next.js build fails:**
```bash
# Lokal test av build:
pnpm build

# Sjekk TypeScript errors:
pnpm tsc --noEmit
```

### Runtime Errors

**Database connection failed:**
- Verifiser `DATABASE_URL` er satt i Railway/Vercel
- Sjekk at database migrations kjørte: `pnpm prisma migrate deploy`
- Test connection: `pnpm prisma db pull`

**Worker ikke starter:**
- Sjekk Railway logs for stack traces
- Verifiser Playwright dependencies er installert (se Dockerfile.worker)
- Sjekk at `REDIS_URL` er satt

**PDF export fails:**
- Verifiser Chromium browser er installert i worker container
- Sjekk worker logs for Playwright errors
- Test lokalt: `pnpm test:pdf`

### Performance Issues

**Slow API responses:**
- Sjekk Railway metrics (CPU/memory)
- Scale workers: Railway → Settings → Replicas
- Enable connection pooling (Prisma)

**High costs:**
- Railway free tier = $5/month credit
- Monitor usage: Railway Dashboard → Billing
- Scale down workers når ikke i bruk

---

## Kostnader (Estimert)

**Minimal (MVP testing):**
- Vercel: Free (Hobby tier, <100GB bandwidth)
- Railway: $20-30/month (Postgres $10 + Redis $5 + Workers $10-15)
- **Total:** ~$25-40/month

**Moderate traffic:**
- Vercel: Free-$20 (under 100GB bandwidth)
- Railway: $80-130 (scaled DB + multiple workers)
- **Total:** ~$100-150/month

**Skalering:**
- Vercel: Auto-scales (pay per request)
- Railway: Manual scaling (workers + DB)

---

## Neste Steg

1. **Generer secrets:** APP_SECRET, API keys, Supabase credentials
2. **Sett opp Vercel:** Deploy frontend til staging
3. **Sett opp Railway:** Deploy workers + database til staging
4. **Kjør smoke tests:** Verifiser full stack fungerer
5. **Deploy til prod:** Kun når staging er grønn

**Spørsmål?** Se [kontekst/kontekst-deployment.md](kontekst/kontekst-deployment.md) for detaljert logg.
