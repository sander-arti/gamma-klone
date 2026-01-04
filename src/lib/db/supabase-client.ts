/**
 * Supabase Browser Client (for Client Components)
 *
 * This client:
 * - Respects RLS policies based on logged-in user
 * - Handles cookies and session management in the browser
 * - Should be used in Client Components ('use client')
 *
 * Usage:
 * ```typescript
 * 'use client';
 *
 * import { createClient } from '@/lib/db/supabase-client';
 *
 * export function MyClientComponent() {
 *   const supabase = createClient();
 *   // ... queries respect RLS for logged-in user
 * }
 * ```
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
