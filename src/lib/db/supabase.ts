/**
 * Supabase Admin Client (Service Role)
 *
 * SECURITY WARNING:
 * - This client uses the service role key which BYPASSES RLS
 * - Use ONLY on the server-side (never expose to client)
 * - Only use when you need to bypass RLS (e.g., creating default workspace on signup)
 *
 * For normal server-side operations that respect RLS, use supabase-server.ts
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY");
}

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
