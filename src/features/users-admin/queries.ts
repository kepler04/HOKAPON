import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ManageableRole } from "./schemas";

export interface AdminUserRow {
  id: string;
  email: string | null;
  /** From auth user_metadata or the customer profile. */
  name: string | null;
  phone: string | null;
  /** "customer" when there is no staff/admin profile row. */
  role: ManageableRole;
  createdAt: string;
  /** Email confirmed (true) or still pending (false). */
  confirmed: boolean;
  /** Banned/blocked until this date (null = active). */
  bannedUntil: string | null;
  /** How many orders this user has placed. */
  orderCount: number;
}

/**
 * List every registered user (staff + customers) for the admin users page.
 *
 * Combines three sources via the service_role client:
 *  - Supabase Auth (the user list, email, confirmation, ban state)
 *  - `profiles` (staff/admin role — customers have no row here)
 *  - `customer_profiles` (name/phone) and an order count per user
 */
export async function listUsers(): Promise<AdminUserRow[]> {
  const admin = createAdminClient();

  // Auth users (paginated; 1000 covers this store comfortably).
  const { data: authData, error: authError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (authError) throw authError;
  const users = authData.users;

  // Staff/admin roles.
  const { data: profiles } = await admin.from("profiles").select("id,role,full_name");
  const roleById = new Map((profiles ?? []).map((p) => [p.id, p]));

  // Customer profiles (name/phone).
  const { data: custProfiles } = await admin
    .from("customer_profiles")
    .select("id,full_name,phone");
  const custById = new Map((custProfiles ?? []).map((c) => [c.id, c]));

  // Order counts per user.
  const { data: orders } = await admin.from("orders").select("user_id");
  const orderCountById = new Map<string, number>();
  for (const o of orders ?? []) {
    if (o.user_id) {
      orderCountById.set(o.user_id, (orderCountById.get(o.user_id) ?? 0) + 1);
    }
  }

  return users
    .map((u): AdminUserRow => {
      const profile = roleById.get(u.id);
      const cust = custById.get(u.id);
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      const name =
        (profile?.full_name as string | null | undefined) ||
        cust?.full_name ||
        (meta.full_name as string | undefined) ||
        (meta.name as string | undefined) ||
        null;
      const role: ManageableRole =
        profile?.role === "admin"
          ? "admin"
          : profile?.role === "staff"
            ? "staff"
            : "customer";
      // supabase-js types don't expose banned_until; read it defensively.
      const bannedUntil =
        (u as unknown as { banned_until?: string | null }).banned_until ?? null;
      return {
        id: u.id,
        email: u.email ?? null,
        name,
        phone: cust?.phone ?? null,
        role,
        createdAt: u.created_at,
        confirmed: !!u.email_confirmed_at,
        bannedUntil,
        orderCount: orderCountById.get(u.id) ?? 0,
      };
    })
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
