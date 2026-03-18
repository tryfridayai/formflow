import { createClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client with the service role key for admin operations.
 *
 * WARNING: This client bypasses Row Level Security (RLS). Only use it in
 * trusted server-side contexts (Server Actions, Route Handlers, background jobs).
 * Never expose the service role key to the browser.
 *
 * Use cases:
 * - Creating resources on behalf of users
 * - Admin dashboards and data migrations
 * - Webhook handlers that need unrestricted access
 * - Scheduled tasks and background processing
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
