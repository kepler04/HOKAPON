"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS_TRANSITIONS } from "@/lib/constants";
import {
  updateOrderStatusSchema,
  type UpdateOrderStatusInput,
} from "./schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Change an order's status (admin only — enforced by RLS).
 * Validates the transition against the state machine in lib/constants.
 */
export async function updateOrderStatus(
  input: UpdateOrderStatusInput,
): Promise<ActionResult> {
  const parsed = updateOrderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos" };
  }
  const { orderId, status } = parsed.data;

  const supabase = await createClient();

  // Validate the transition is allowed from the current status.
  const { data: current, error: readErr } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (readErr) return { ok: false, error: readErr.message };

  const allowed = ORDER_STATUS_TRANSITIONS[current.status] ?? [];
  if (current.status !== status && !allowed.includes(status)) {
    return {
      ok: false,
      error: `Transición no permitida: ${current.status} → ${status}`,
    };
  }

  // Stock side-effects (atomic DB functions, idempotent via stock_committed):
  //  • Confirming payment commits (decrements) stock — abort if insufficient.
  //  • Cancelling restores stock if it was previously committed.
  if (status === "pago_confirmado") {
    const { error: stockErr } = await supabase.rpc("commit_order_stock", {
      p_order_id: orderId,
    });
    if (stockErr) {
      return {
        ok: false,
        error: `No se pudo confirmar: ${stockErr.message}`,
      };
    }
  } else if (status === "cancelado") {
    const { error: restoreErr } = await supabase.rpc("restore_order_stock", {
      p_order_id: orderId,
    });
    if (restoreErr) {
      return {
        ok: false,
        error: `No se pudo restaurar stock: ${restoreErr.message}`,
      };
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin"); // dashboard stats
  revalidatePath("/productos"); // public stock display
  return { ok: true };
}
