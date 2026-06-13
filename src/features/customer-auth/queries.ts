import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CustomerProfile, Order, OrderItem } from "@/types/database.types";

export interface CustomerSession {
  userId: string;
  email: string | null;
  metaName: string | null;
}

/**
 * Require a logged-in customer (any authenticated user). Redirects to /cuenta
 * if not signed in. Use at the top of customer account pages.
 */
export async function requireCustomer(
  redirectTo = "/cuenta",
): Promise<CustomerSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(redirectTo);
  return {
    userId: user.id,
    email: user.email ?? null,
    metaName:
      (user.user_metadata?.full_name as string) ??
      (user.user_metadata?.name as string) ??
      null,
  };
}

/** The current customer's editable profile (or null if not created yet). */
export async function getCustomerProfile(): Promise<CustomerProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("customer_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data ?? null;
}

export interface CustomerOrder extends Order {
  order_items: OrderItem[];
}

/**
 * Orders that belong to the current customer: matched by user_id OR by the
 * account email (covers guest orders made with the same email). RLS also
 * enforces this; the filter here keeps the result tidy.
 */
export async function getCustomerOrders(): Promise<CustomerOrder[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const email = user.email ?? "";
  const { data, error } = await supabase
    .from("orders")
    .select("*,order_items(*)")
    .or(`user_id.eq.${user.id},customer_email.ilike.${email}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as CustomerOrder[]) ?? [];
}
