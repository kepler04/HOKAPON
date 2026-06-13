import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Admin Supabase client (service_role).
 *
 * ⚠️ SECURITY: This client BYPASSES Row Level Security. It uses the
 * SUPABASE_SERVICE_ROLE_KEY and must ONLY ever run on the server.
 *
 * The `import "server-only"` guard above causes a build error if this module
 * is ever imported into a Client Component. Use it strictly inside trusted
 * Server Actions / Route Handlers (e.g. creating an order after server-side
 * stock & price validation).
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. The admin client cannot be created.",
    );
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
