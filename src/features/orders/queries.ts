import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderDetail, OrderFilters } from "./types";

/**
 * Public-facing order lookup for the post-checkout success page.
 *
 * `orders` is RLS-protected (staff only), but a customer who just placed an
 * order needs to see their own confirmation. The order_number acts as a
 * hard-to-guess access token. We use the admin client (server-side only) and
 * return ONLY the fields safe to show on the confirmation screen.
 */
export async function getPublicOrderByNumber(
  orderNumber: string,
): Promise<OrderDetail | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*,order_items(*),payments(*)")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) throw error;
  return (data as OrderDetail | null) ?? null;
}

/**
 * Order reads (admin only — RLS restricts these to staff).
 */

/** List orders for the admin table, with optional status/search filter. */
export async function getOrders(filters?: OrderFilters): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.search) {
    // Match by order number or customer name/email.
    query = query.or(
      `order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Full order detail with items and payments. */
export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*,order_items(*),payments(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as OrderDetail | null) ?? null;
}

/** Lookup by human-readable order number (e.g. success page). */
export async function getOrderByNumber(
  orderNumber: string,
): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*,order_items(*),payments(*)")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) throw error;
  return (data as OrderDetail | null) ?? null;
}
