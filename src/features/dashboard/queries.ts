import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/features/orders/types";

export interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  confirmedSales: number;
  recentOrders: Order[];
}

/**
 * Aggregate metrics for the admin dashboard. RLS restricts all of this to
 * staff (the dashboard lives behind the /admin guard).
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [ordersCount, productsCount, pendingCount, salesRows, recent] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["pendiente", "esperando_pago", "pago_enviado"]),
      // Sales = total of orders whose payment is confirmed onward.
      supabase
        .from("orders")
        .select("total")
        .in("status", ["pago_confirmado", "en_preparacion", "entregado"]),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const confirmedSales = (salesRows.data ?? []).reduce(
    (sum, o) => sum + Number(o.total),
    0,
  );

  return {
    totalOrders: ordersCount.count ?? 0,
    totalProducts: productsCount.count ?? 0,
    pendingOrders: pendingCount.count ?? 0,
    confirmedSales: Number(confirmedSales.toFixed(2)),
    recentOrders: (recent.data as Order[]) ?? [],
  };
}
