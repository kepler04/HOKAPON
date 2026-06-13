"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { paymentMethodSchema, type PaymentMethodInput } from "./schemas";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

function normalize(input: PaymentMethodInput) {
  return {
    kind: input.kind,
    label: input.label,
    number: input.number || null,
    holder: input.holder || null,
    bank_name: input.bank_name || null,
    account: input.account || null,
    cci: input.cci || null,
    sort_order: input.sort_order,
    is_active: input.is_active,
  };
}

export async function createPaymentMethod(
  input: PaymentMethodInput,
): Promise<ActionResult> {
  const parsed = paymentMethodSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_methods")
    .insert(normalize(parsed.data))
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/pagos");
  return { ok: true, id: data.id };
}

export async function updatePaymentMethod(
  id: string,
  input: PaymentMethodInput,
): Promise<ActionResult> {
  const parsed = paymentMethodSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_methods")
    .update({ ...normalize(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/pagos");
  return { ok: true, id };
}

export async function deletePaymentMethod(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("payment_methods").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/pagos");
  return { ok: true, id };
}

export async function setPaymentMethodActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_methods")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/pagos");
  return { ok: true, id };
}
