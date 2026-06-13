"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { stockMovementSchema, type StockMovementInput } from "./schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Register a manual stock movement (entrada/salida) and adjust product stock.
 * Runs the atomic DB function register_stock_movement with the cookie-bound
 * client so RLS applies and auth.uid() is recorded as created_by.
 */
export async function registerStockMovement(
  input: StockMovementInput,
): Promise<ActionResult> {
  const parsed = stockMovementSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  const { product_id, type, quantity, reason } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.rpc("register_stock_movement", {
    p_product_id: product_id,
    p_type: type,
    p_quantity: quantity,
    p_reason: reason || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/inventario");
  revalidatePath(`/admin/inventario/${product_id}`);
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${product_id}`);
  revalidatePath("/productos"); // public stock display
  return { ok: true };
}
