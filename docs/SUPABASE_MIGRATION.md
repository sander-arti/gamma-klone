# Supabase Migration Guide

This guide documents the migration from self-hosted PostgreSQL + Prisma to Supabase managed PostgreSQL + Supabase Auth.

## Migration Overview

**Date:** 2026-01-04
**Duration:** Phase 8 (Supabase Auth & Production Readiness)
**Strategy:** Hybrid auth - Supabase Auth for webapp, custom API keys for API

### What Changed

| Component | Before | After |
|-----------|--------|-------|
| Database | Self-hosted PostgreSQL | Supabase managed PostgreSQL |
| ORM | Prisma Client | Supabase Client (PostgREST) |
| Auth (Webapp) | Mock/simulate | Supabase Auth (email/password) |
| Auth (API) | Custom API keys | Custom API keys (unchanged) |
| Multi-tenant | Application-level | RLS policies (database-level) |
| Session Management | N/A | Supabase SSR (secure cookies) |

### What Stayed the Same

- Database schema (tables, columns, relationships)
- API contract (`POST /v1/generations`, `GET /v1/generations/{id}`)
- API key authentication mechanism (SHA-256 hash storage)
- Frontend components and UI
- Export pipelines (PDF, PPTX)
- Job queue (BullMQ + Redis)

## Pre-Migration State

### Database Access Pattern

```typescript
// Before (Prisma)
import { prisma } from '@/lib/db/prisma';

const decks = await prisma.deck.findMany({
  where: { workspace_id: workspaceId },
  include: { slides: { include: { blocks: true } } },
});
```

### Auth Pattern

```typescript
// Before (Mock)
// No real auth - users created manually in database
```

## Migration Steps

### 1. Supabase Project Setup

```bash
# Install Supabase CLI
pnpm add -D supabase

# Install Supabase dependencies
pnpm add @supabase/supabase-js @supabase/ssr

# Create project via Supabase Dashboard
# (or via MCP: mcp__supabase__create_project)

# Get credentials from Supabase Dashboard → Settings → API
# - Project URL
# - Anon key
# - Service role key
```

### 2. Environment Variables

Update `.env.local`:

```bash
# Add Supabase variables
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Keep DATABASE_URL for migration phase (can remove later)
DATABASE_URL="postgresql://..."
```

### 3. Database Migration

#### Generate Migration SQL

```bash
# Export existing schema from Prisma
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > supabase/migrations/20260104000000_initial_schema.sql
```

#### Add RLS Policies

Edit `supabase/migrations/20260104000000_initial_schema.sql` and append:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
-- ... (see migration file for complete policies)

-- Users: Can read/update own user
CREATE POLICY "Users can read own user"
ON users FOR SELECT
USING (id = auth.uid()::text);

-- Workspaces: Members can read workspaces they belong to
CREATE POLICY "Members can read own workspaces"
ON workspaces FOR SELECT
USING (
  id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()::text
  )
);

-- ... (see migration file for all policies)
```

**Critical:** Use `auth.uid()::text` for TEXT-based ID columns (not UUID).

#### Push Migration

```bash
# Link to Supabase project
npx supabase link --project-ref <your-project-ref>

# Push migration
npx supabase db push

# Verify tables created
npx supabase db pull --dry-run
```

#### Generate TypeScript Types

```bash
npx supabase gen types typescript --linked > src/types/supabase.ts
```

### 4. Create Supabase Clients

#### Admin Client (Service Role)

File: `src/lib/db/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

**Usage:** Server-side operations that need to bypass RLS (team management, API key management, job creation).

#### Server Components Client (RLS-aware)

File: `src/lib/db/supabase-server.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

**Usage:** Server Components and API routes that respect RLS.

#### Browser Client (RLS-aware)

File: `src/lib/db/supabase-client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Usage:** Client Components and browser-side operations.

### 5. Auth Implementation

#### Signup Endpoint

File: `src/app/api/auth/signup/route.ts`

```typescript
import { createClient } from '@/lib/db/supabase-server';
import { supabaseAdmin } from '@/lib/db/supabase';

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json();

  const supabase = await createClient();

  // Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Create default workspace (using service role)
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .insert({ id: crypto.randomUUID(), name: `${name}'s Workspace` })
    .select()
    .single();

  // Add user as owner
  await supabaseAdmin.from('workspace_members').insert({
    id: crypto.randomUUID(),
    user_id: data.user!.id,
    workspace_id: workspace!.id,
    role: 'owner',
  });

  return NextResponse.json({ user: data.user });
}
```

#### Login Endpoint

File: `src/app/api/auth/login/route.ts`

```typescript
import { createClient } from '@/lib/db/supabase-server';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ user: data.user });
}
```

#### Middleware (Route Protection)

File: `src/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip /api/v1 (API key auth)
  if (request.nextUrl.pathname.startsWith('/api/v1')) {
    return NextResponse.next();
  }

  // Skip public routes
  const publicPaths = ['/', '/login', '/signup', '/view', '/preview'];
  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
```

### 6. Update Database Access Patterns

#### Before (Prisma)

```typescript
import { prisma } from '@/lib/db/prisma';

const decks = await prisma.deck.findMany({
  where: { workspace_id: workspaceId },
});
```

#### After (Supabase)

```typescript
import { createClient } from '@/lib/db/supabase-server';

const supabase = await createClient();

const { data: decks } = await supabase
  .from('decks')
  .select('*')
  .eq('workspace_id', workspaceId);
```

**For joins:**

```typescript
const { data: decks } = await supabase
  .from('decks')
  .select(`
    *,
    slides (
      *,
      blocks (*)
    )
  `)
  .eq('workspace_id', workspaceId);
```

**For insert:**

```typescript
const { data: deck, error } = await supabase
  .from('decks')
  .insert({
    id: crypto.randomUUID(),
    workspace_id: workspaceId,
    user_id: userId,
    title: 'New Deck',
  })
  .select()
  .single();
```

### 7. Migration Testing Checklist

- [ ] All tables have RLS enabled (`rls_enabled = true`)
- [ ] Signup creates user + workspace + membership
- [ ] Login redirects to dashboard
- [ ] Logout clears session
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Workspace switcher lists only user's workspaces
- [ ] Decks filtered by active workspace
- [ ] API key auth still works for `/api/v1/*`
- [ ] Cross-workspace isolation (user A can't see user B's decks)

#### RLS Isolation Test

```sql
-- As user A (workspace W1), try to read user B's deck (workspace W2)
-- Should return 0 rows
SELECT * FROM decks WHERE id = '<user-b-deck-id>';
```

## Post-Migration Cleanup

### Remove Prisma (Optional)

If fully migrated to Supabase:

```bash
# Remove Prisma dependencies
pnpm remove @prisma/client prisma

# Remove Prisma schema and migrations
rm -rf prisma/

# Remove Prisma client imports
# (Search codebase for "from '@prisma/client'" and replace)
```

### Update DATABASE_URL

If keeping Prisma for other purposes, update `.env.local`:

```bash
# Use Supabase connection string
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

## Rollback Strategy

If migration fails, rollback to previous state:

### 1. Revert Environment Variables

```bash
# Remove Supabase variables
unset NEXT_PUBLIC_SUPABASE_URL
unset NEXT_PUBLIC_SUPABASE_ANON_KEY
unset SUPABASE_SERVICE_ROLE_KEY

# Ensure DATABASE_URL points to old database
DATABASE_URL="postgresql://localhost:5432/arti_slides"
```

### 2. Revert Code Changes

```bash
git checkout main  # Or previous stable tag
pnpm install
pnpm build
```

### 3. Restore Database (if needed)

```bash
# Restore from backup (assumed daily backups exist)
pg_restore -d arti_slides backup_2026-01-03.dump
```

### 4. Delete Supabase Project (optional)

If migration was unsuccessful and you want to start fresh:

1. Go to Supabase Dashboard → Settings → General
2. Click "Delete Project"
3. Confirm deletion

## Troubleshooting

### Issue: "relation does not exist"

**Cause:** Migration not pushed to Supabase.

**Fix:**

```bash
npx supabase db push
```

### Issue: "RLS policy denies access"

**Cause:** User not in workspace_members for the workspace they're trying to access.

**Fix:** Check workspace membership:

```sql
SELECT * FROM workspace_members WHERE user_id = '<user-id>';
```

### Issue: "auth.uid() returns null"

**Cause:** Using supabaseAdmin instead of createClient (RLS-aware).

**Fix:** Use `createClient()` from `supabase-server.ts` for user-scoped operations.

### Issue: "Migration fails with type casting error"

**Cause:** Supabase uses UUID for auth.uid(), but our schema uses TEXT for IDs.

**Fix:** Use `auth.uid()::text` in RLS policies.

### Issue: "Cookies not set"

**Cause:** Supabase SSR client not configured correctly.

**Fix:** Verify `createServerClient` in middleware has `getAll()` and `setAll()` cookie handlers.

## Performance Considerations

### RLS Policy Performance

RLS policies can impact query performance. Optimize with indexes:

```sql
-- Index on workspace_id for fast filtering
CREATE INDEX decks_workspace_id_idx ON decks(workspace_id);

-- Index on user_id for membership checks
CREATE INDEX workspace_members_user_id_idx ON workspace_members(user_id);
```

### Connection Pooling

Supabase uses PgBouncer for connection pooling (Transaction mode). For long-running transactions, use Direct connection:

```bash
# Transaction mode (pooled)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"

# Session mode (direct, for migrations)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres"
```

## Security Hardening

### 1. Rotate Service Role Key

Service role key grants full database access. Rotate regularly:

1. Supabase Dashboard → Settings → API
2. Generate new service role key
3. Update `SUPABASE_SERVICE_ROLE_KEY` in production
4. Revoke old key after verification

### 2. Enable Email Confirmation

In MVP, email confirmation is disabled. For production:

1. Supabase Dashboard → Authentication → Email Templates
2. Enable "Confirm signup"
3. Update signup flow to show "Check your email" message

### 3. Add Rate Limiting

Protect auth endpoints from brute force:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, try again later',
});

export async function POST(request: NextRequest) {
  // Apply rate limit
  // ... login logic
}
```

### 4. Monitor RLS Bypass

Alert on service role usage:

```sql
-- Log service role queries (Supabase Logs)
SELECT * FROM pg_stat_activity WHERE usename = 'service_role';
```

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Migration file](../supabase/migrations/20260104000000_initial_schema.sql)
- [Context log (Phase 8)](../kontekst/kontekst-fase8.md)
