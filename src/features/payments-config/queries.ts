import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PaymentMethodConfig } from "@/types/database.types";

/** Active payment methods for the storefront (public read via RLS). */
export async function getActivePaymentMethods(): Promise<PaymentMethodConfig[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** All payment methods for the admin (incl. inactive). */
export async function getAllPaymentMethods(): Promise<PaymentMethodConfig[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
