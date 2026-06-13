"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkoutSchema, type CheckoutInput } from "./schemas";
import type { CreateOrderResult } from "./types";

/**
 * Create an order from the checkout form.
 *
 * SECURITY MODEL:
 *  - `orders`/`order_items` have NO public INSERT policy (RLS). We use the
 *    admin (service_role) client here, which runs ONLY on the server.
 *  - The client sends only product IDs + quantities. We re-fetch each product
 *    from the DB and recompute unit_price / line_total / total server-side, so
 *    a malicious client cannot forge prices.
 *  - Stock is validated against the DB; out-of-stock items are rejected.
 *  - order_number is assigned by the DB trigger (atomic, see migration 0002).
 */
export async function createOrder(
  input: CheckoutInput,
): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  const data = parsed.data;

  const supabase = createAdminClient();

  // 1. Fetch the real products referenced by the cart.
  const productIds = data.items.map((i) => i.productId);
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id,name,price,stock,is_active")
    .in("id", productIds);

  if (prodErr) return { ok: false, error: prodErr.message };
  if (!products || products.length !== productIds.length) {
    return { ok: false, error: "Algún producto ya no está disponible." };
  }

  // 2. Validate availability + build line items with server-side prices.
  const lineItems = [];
  let subtotal = 0;
  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || !product.is_active) {
      return { ok: false, error: "Algún producto ya no está disponible." };
    }
    if (product.stock < item.quantity) {
      return {
        ok: false,
        error: `Stock insuficiente para "${product.name}" (disponible: ${product.stock}).`,
      };
    }
    const lineTotal = Number((product.price * item.quantity).toFixed(2));
    subtotal += lineTotal;
    lineItems.push({
      product_id: product.id,
      product_name: product.name, // snapshot
      unit_price: product.price, // snapshot
      quantity: item.quantity,
      line_total: lineTotal,
    });
  }
  subtotal = Number(subtotal.toFixed(2));
  const total = subtotal; // no shipping/discounts in the demo

  // 3. Insert the order (order_number filled by trigger).
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email,
      notes: data.notes || null,
      status: "pendiente",
      subtotal,
      total,
    })
    .select("id,order_number")
    .single();

  if (orderErr || !order) {
    return { ok: false, error: orderErr?.message ?? "No se pudo crear el pedido." };
  }

  // 4. Insert the line items.
  const { error: itemsErr } = await supabase.from("order_items").insert(
    lineItems.map((li) => ({ ...li, order_id: order.id })),
  );

  if (itemsErr) {
    // Best-effort rollback of the order row.
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, error: itemsErr.message };
  }

  return {
    ok: true,
    orderId: order.id,
    orderNumber: order.order_number,
  };
}
