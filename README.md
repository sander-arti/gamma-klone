# ARTI Slides

AI-powered presentation generator with premium design and export capabilities.

## Features

- **AI Generation**: Create presentations from text, meeting notes, or uploaded files
- **Premium Design**: 10 professional slide types with nordic_light theme
- **Inline Editing**: Edit any text, bullet, or table cell directly in the canvas
- **Smart Constraints**: Automatic overflow detection and AI-powered fixes
- **Export**: High-quality PDF and editable PPTX exports
- **Team Collaboration**: Multi-tenant workspaces with role-based access
- **API Access**: RESTful API with API key authentication

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, BullMQ job queue
- **Database**: Supabase (managed PostgreSQL with RLS)
- **Auth**: Supabase Auth (email/password)
- **AI**: OpenAI GPT-4o (structured output)
- **Export**: Playwright (PDF), PptxGenJS (PPTX)
- **Storage**: S3-compatible object storage

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL (via Supabase)
- Redis (for job queue)
- S3-compatible storage (AWS S3, MinIO, or similar)
- OpenAI API key

## Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd Gamma-klone
pnpm install
```

### 2. Supabase Setup

#### Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create new project (choose region closest to your users)
3. Wait for database provisioning (~2 minutes)

#### Get Credentials

From your Supabase project dashboard:

1. **Project URL**: Settings → API → Project URL
2. **Anon Key**: Settings → API → Project API keys → `anon` `public`
3. **Service Role Key**: Settings → API → Project API keys → `service_role` (⚠️ Keep secret!)
4. **Database URL**: Settings → Database → Connection string → URI (mode: Session)

#### Run Database Migration

```bash
# Link to your Supabase project
npx supabase link --project-ref <your-project-ref>

# Push migration (creates tables + RLS policies)
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --linked > src/types/supabase.ts
```

Your project ref is the subdomain in your project URL (e.g., `yeaxjmilwjhudojybqak` from `https://yeaxjmilwjhudojybqak.supabase.co`)

### 3. Environment Variables

Create `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Database (optional - for Prisma if still using)
DATABASE_URL="postgresql://..."

# Redis (for job queue)
REDIS_URL="redis://localhost:6379"

# S3 Storage
S3_ENDPOINT="https://s3.amazonaws.com"
S3_REGION="us-east-1"
S3_BUCKET="arti-slides"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI
OPENAI_API_KEY="sk-..."
```

⚠️ **Security**: Never commit `.env.local` to git. The `.env.example` file shows required variables without secrets.

### 4. Start Development Server

```bash
# Start Redis (in separate terminal)
redis-server

# Start Next.js dev server + worker
pnpm dev        # Next.js on :3000
pnpm worker     # BullMQ worker (generation jobs)
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Architecture

### Multi-Tenant Isolation

All tables use **Row Level Security (RLS)** to enforce workspace-level isolation:

- Users belong to workspaces via `workspace_members`
- All content (decks, slides, blocks, jobs, files) is scoped to a workspace
- RLS policies prevent cross-workspace data leakage
- Service role key bypasses RLS (use only server-side)

### Key Tables

- `users` - User profiles (synced with Supabase Auth)
- `workspaces` - Tenant/organization units
- `workspace_members` - User-workspace relationships (owner/admin/member roles)
- `api_keys` - Hashed API keys for API authentication
- `decks` - Presentations
- `slides` - Slides within presentations
- `blocks` - Content blocks within slides (title, text, bullets, etc.)
- `generation_jobs` - Async AI generation jobs
- `export_jobs` - Async PDF/PPTX export jobs
- `uploaded_files` - User-uploaded files with extracted text
- `workspace_invitations` - Team invitation tokens

### RLS Policies

See `supabase/migrations/20260104000000_initial_schema.sql` for complete policy definitions.

**Key patterns:**
- `auth.uid()::text` - Current authenticated user ID
- Service role can bypass RLS (API operations)
- Members can read workspace content
- Owners/admins can manage workspace settings
- Public shared decks accessible via `share_access = 'anyone_with_link_can_view'`

## Authentication

### Webapp (Supabase Auth)

- Email/password authentication
- Session cookies (HTTP-only, secure, SameSite)
- Middleware protects all routes except public pages
- OAuth (Google/Microsoft) planned for V2

### API (Custom API Keys)

- API keys stored as SHA-256 hashes
- Format: `ak_` prefix + random bytes
- Authenticated via `Authorization: Bearer <api-key>` header
- Scoped to workspace (multi-tenant safe)

**Endpoints:**
- `POST /api/v1/generations` - Create generation job
- `GET /api/v1/generations/{id}` - Get job status
- See API documentation for full reference

## Development Workflow

### Code Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── auth/           # Signup, login, logout
│   │   ├── decks/          # Deck CRUD
│   │   ├── generations/    # Generation jobs (webapp)
│   │   ├── v1/             # Public API (API key auth)
│   │   └── workspaces/     # Workspace/team management
│   ├── dashboard/          # Dashboard page
│   ├── deck/[id]/          # Editor page
│   ├── invite/[token]/     # Team invitation acceptance
│   ├── login/              # Login page
│   ├── new/                # Wizard (create presentation)
│   ├── settings/           # Account, workspace, API keys, team
│   ├── signup/             # Signup page
│   └── view/[token]/       # Public view page
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── ai/                 # AI prompts and schemas
│   ├── api/                # API helpers (auth, validation)
│   ├── db/                 # Database clients (Supabase)
│   ├── editor/             # Editor state and constraints
│   ├── export/             # PDF and PPTX renderers
│   ├── queue/              # BullMQ workers
│   └── validation/         # Zod schemas
├── types/                  # TypeScript types
└── middleware.ts           # Auth middleware
```

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests (requires running dev server)
pnpm test:e2e

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Building for Production

```bash
pnpm build
pnpm start     # Start production server
pnpm worker    # Start production worker
```

## Security Best Practices

### Secrets Management

- **Never commit** `.env.local` or `.env`
- Use environment variables for all secrets
- Rotate API keys regularly
- Service role key must never be exposed to browser

### RLS Verification

Test multi-tenant isolation:

```sql
-- As user A (workspace W1), try to access user B's deck (workspace W2)
SELECT * FROM decks WHERE id = '<user-b-deck-id>';
-- Should return 0 rows (blocked by RLS)
```

### Rate Limiting

⚠️ **MVP**: No rate limiting implemented yet. For production:

- Add rate limiting middleware to auth endpoints
- Implement per-API-key rate limits
- Monitor costs (OpenAI tokens, storage)

### Audit Logging

⚠️ **MVP**: No audit logging yet. For production:

- Log security events (login failures, API key usage, member changes)
- Store logs securely (not in console)
- Set up alerts for suspicious activity

## Deployment

### Environment Variables (Production)

All variables from `.env.local` plus:

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### Database Migration

```bash
# Prod database migration (use with caution)
npx supabase link --project-ref <prod-project-ref>
npx supabase db push
```

### Vercel Deployment (Recommended)

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

Worker must be deployed separately (e.g., Railway, Render, or serverless functions).

## API Documentation

### Authentication

```bash
# Get API key from webapp (Settings → API Keys)
curl -X POST https://api.artislides.com/v1/generations \
  -H "Authorization: Bearer ak_..." \
  -H "Content-Type: application/json" \
  -d '{
    "input_text": "Create a presentation about AI",
    "text_mode": "generate",
    "language": "no",
    "num_slides": 8
  }'
```

### Endpoints

- `POST /v1/generations` - Create generation job
- `GET /v1/generations/{id}` - Get job status and results
- See full API reference: `docs/API.md` (TODO)

## Troubleshooting

### Supabase Connection Issues

```bash
# Test connection
npx supabase db pull --dry-run

# Check project status
npx supabase projects list
```

### RLS Policy Debugging

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- List policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Migration Rollback

⚠️ Supabase migrations are append-only. To rollback:

1. Create new migration that reverts changes
2. Test in staging first
3. Apply to production

## Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

Proprietary - All rights reserved.

## Support

- GitHub Issues: [https://github.com/your-org/arti-slides/issues](https://github.com/your-org/arti-slides/issues)
- Email: support@artislides.com
