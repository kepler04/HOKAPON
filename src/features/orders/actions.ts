"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS_TRANSITIONS } from "@/lib/constants";
import {
  updateOrderStatusSchema,
  type UpdateOrderStatusInput,
} from "./schemas";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; code?: "insufficient_stock" };

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
  const { orderId, status, force } = parsed.data;

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
    if (force) {
      // Admin override: decrement stock even if insufficient (may go negative).
      const { error: stockErr } = await supabase.rpc(
        "commit_order_stock_force",
        { p_order_id: orderId },
      );
      if (stockErr) {
        return { ok: false, error: `No se pudo confirmar: ${stockErr.message}` };
      }
    } else {
      const { error: stockErr } = await supabase.rpc("commit_order_stock", {
        p_order_id: orderId,
      });
      if (stockErr) {
        // The DB raises when any product lacks stock. Surface a typed code so
        // the UI can offer a "confirm anyway" override.
        const insufficient = /stock insuficiente/i.test(stockErr.message);
        return {
          ok: false,
          error: insufficient
            ? "No hay stock suficiente para este pedido."
            : `No se pudo confirmar: ${stockErr.message}`,
          ...(insufficient ? { code: "insufficient_stock" as const } : {}),
        };
      }
    }
    // Log a 'salida' movement per line item for the inventory ledger.
    // Stock was already adjusted by the commit function above, so we only
    // record the movement here (no further stock change).
    await logSaleMovements(supabase, orderId);
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

  if (status === "pago_confirmado") {
    await markLatestPaymentConfirmed(supabase, orderId);
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin"); // dashboard stats
  revalidatePath("/admin/inventario"); // ledger
  revalidatePath("/admin/productos");
  revalidatePath("/productos"); // public stock display
  return { ok: true };
}

async function markLatestPaymentConfirmed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
): Promise<void> {
  const { data: latest } = await supabase
    .from("payments")
    .select("id,status")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!latest || latest.status === "confirmado") return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("payments")
    .update({
      status: "confirmado",
      confirmed_by: user?.id ?? null,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", latest.id);
}

/**
 * Record one 'salida' stock movement per order line item, referencing the
 * order. Idempotent: skips if movements for this order already exist (avoids
 * duplicates if the status is somehow re-applied). Best-effort — a logging
 * failure must not block the status change.
 */
async function logSaleMovements(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
): Promise<void> {
  const { count } = await supabase
    .from("stock_movements")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId);
  if ((count ?? 0) > 0) return; // already logged

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id,quantity")
    .eq("order_id", orderId);

  const rows = (items ?? [])
    .filter((i) => i.product_id)
    .map((i) => ({
      product_id: i.product_id as string,
      type: "salida" as const,
      quantity: i.quantity,
      reason: "Venta",
      order_id: orderId,
    }));

  if (rows.length > 0) {
    await supabase.from("stock_movements").insert(rows);
  }
}
