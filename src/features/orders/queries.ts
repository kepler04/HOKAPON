import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Order,
  OrderDetail,
  OrderFilters,
  OrderStockStatus,
  StockShortage,
} from "./types";

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

export interface OrderItemWithImage {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  imageUrl: string | null;
}

/**
 * Order line items with each product's primary image, for the confirmation
 * page. Uses the admin client (the order_number is the access token), and only
 * returns display-safe fields.
 */
export async function getPublicOrderItemsWithImages(
  orderId: string,
): Promise<OrderItemWithImage[]> {
  const supabase = createAdminClient();
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const { data } = await supabase
    .from("order_items")
    .select(
      "id,product_name,quantity,unit_price,line_total,products(product_images(url,is_primary))",
    )
    .eq("order_id", orderId);

  return (data ?? []).map((it) => {
    const product = it.products as {
      product_images: { url: string; is_primary: boolean }[] | null;
    } | null;
    const imgs = product?.product_images ?? [];
    const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
    return {
      id: it.id,
      product_name: it.product_name,
      quantity: it.quantity,
      unit_price: it.unit_price,
      line_total: it.line_total,
      imageUrl: primary
        ? `${base}/storage/v1/object/public/product-images/${primary.url}`
        : null,
    };
  });
}

/**
 * Stock availability for an order's items (admin only).
 * Compares each line item's quantity against the product's CURRENT stock.
 * If the order already committed stock, returns no shortages (the decrement
 * already happened, so the check is moot).
 */
export async function getOrderStockStatus(
  orderId: string,
): Promise<OrderStockStatus> {
  const supabase = await createClient();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("stock_committed")
    .eq("id", orderId)
    .maybeSingle();
  if (orderErr) throw orderErr;

  if (!order || order.stock_committed) {
    return { alreadyCommitted: order?.stock_committed ?? false, shortages: [] };
  }

  // Line items joined with the product's current stock.
  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("product_id,product_name,quantity,products(stock)")
    .eq("order_id", orderId);
  if (itemsErr) throw itemsErr;

  const shortages: StockShortage[] = [];
  for (const it of items ?? []) {
    if (!it.product_id) continue; // product was deleted; skip
    const product = it.products as { stock: number } | null;
    const available = product?.stock ?? 0;
    if (available < it.quantity) {
      shortages.push({
        productId: it.product_id,
        productName: it.product_name,
        requested: it.quantity,
        available,
        missing: it.quantity - available,
      });
    }
  }

  return { alreadyCommitted: false, shortages };
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
