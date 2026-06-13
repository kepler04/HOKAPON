import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AdminSession } from "./types";

/**
 * Resolve the current admin session (Server Components / layouts).
 * Returns null if not authenticated or not staff/admin.
 *
 * Note: route protection is already enforced by middleware; this is for
 * reading the session inside admin pages (e.g. greeting, role checks).
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,full_name")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: profile.role,
    fullName: profile.full_name,
  };
}
