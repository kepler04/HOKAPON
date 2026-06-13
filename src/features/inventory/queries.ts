import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { StockMovementRow } from "./types";

/** Shape returned by Supabase before we flatten the joins. */
interface RawMovement {
  id: string;
  product_id: string;
  type: "entrada" | "salida";
  quantity: number;
  reason: string | null;
  order_id: string | null;
  created_by: string | null;
  created_at: string;
  products: { name: string } | null;
  orders: { order_number: string } | null;
}

const SELECT = "*,products(name),orders(order_number)";

function flatten(rows: RawMovement[]): StockMovementRow[] {
  return rows.map((m) => ({
    ...m,
    product_name: m.products?.name ?? "(producto eliminado)",
    order_number: m.orders?.order_number ?? null,
  }));
}

/** All stock movements (admin), newest first. */
export async function getStockMovements(
  limit = 200,
): Promise<StockMovementRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stock_movements")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return flatten((data ?? []) as unknown as RawMovement[]);
}

/** Stock movements for a single product (admin), newest first. */
export async function getProductMovements(
  productId: string,
  limit = 200,
): Promise<StockMovementRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stock_movements")
    .select(SELECT)
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return flatten((data ?? []) as unknown as RawMovement[]);
}
