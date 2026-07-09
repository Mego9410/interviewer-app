import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — BYPASSES RLS.
 *
 * Server-side ONLY (Engineering Rule #4). The `server-only` import above makes
 * the build fail if this module is ever imported into client code. Use this
 * strictly for privileged operations that a check has already authorized
 * (e.g. Stripe webhooks in M5). Prefer the session-bound `server.ts` client
 * everywhere else so RLS stays in force.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
