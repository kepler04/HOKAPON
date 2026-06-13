import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Cookie-less Supabase client for build-time use (generateStaticParams,
 * generateMetadata during static generation) where cookies() is unavailable.
 *
 * Uses the public ANON/publishable key, so it only sees data permitted by RLS
 * to anonymous users (active products/categories) — exactly what we need for
 * pre-rendering public routes.
 */
export function createStaticClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
