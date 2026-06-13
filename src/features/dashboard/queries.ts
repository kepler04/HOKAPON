import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderStatus } from "@/features/orders/types";

/** A point on the 30-day sales line chart. */
export interface SalesPoint {
  date: string; // ISO yyyy-mm-dd
  total: number;
}

/** One slice of the "orders by status" donut. */
export interface StatusSlice {
  status: OrderStatus;
  count: number;
}

/** One row in "best-selling products". */
export interface TopProduct {
  productId: string | null;
  name: string;
  unitsSold: number;
}

/**
 * A metric vs. the previous month.
 * `deltaPct` is null when there's no comparable previous-month data (so the UI
 * shows "—" instead of a fabricated percentage).
 */
export interface MetricWithTrend {
  value: number;
  deltaPct: number | null;
}

export interface DashboardStats {
  orders: MetricWithTrend;
  sales: MetricWithTrend;
  products: MetricWithTrend; // value = active products (no trend baseline)
  customers: MetricWithTrend;
  recentOrders: Order[];
  salesSeries: SalesPoint[]; // last 30 days
  statusBreakdown: StatusSlice[];
  topProducts: TopProduct[];
}

const SALES_STATUSES: OrderStatus[] = [
  "pago_confirmado",
  "en_preparacion",
  "entregado",
];

/** Percent change from previous→current. null if previous is 0 (no baseline). */
function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const now = new Date();
  const thisMonth = monthKey(now);
  const prevMonth = monthKey(
    new Date(now.getFullYear(), now.getMonth() - 1, 1),
  );

  // Pull the data we aggregate in memory. Orders are staff-only (RLS).
  const [allOrdersRes, productsCount, recentRes, itemsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("total,status,customer_email,created_at"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    // Best-sellers: aggregate confirmed-sale line items by product.
    supabase
      .from("order_items")
      .select("product_id,product_name,quantity,orders!inner(status)")
      .in("orders.status", SALES_STATUSES),
  ]);

  const allOrders = (allOrdersRes.data ?? []) as {
    total: number;
    status: OrderStatus;
    customer_email: string;
    created_at: string;
  }[];

  // ---- Totals + month-over-month trends ----
  let ordersThis = 0;
  let ordersPrev = 0;
  let salesAll = 0;
  let salesThis = 0;
  let salesPrev = 0;
  const customersAll = new Set<string>();
  const customersThis = new Set<string>();
  const customersPrev = new Set<string>();
  const statusCounts = new Map<OrderStatus, number>();

  // 30-day sales series scaffold (oldest → newest).
  const series: SalesPoint[] = [];
  const dayIndex = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayIndex.set(key, series.length);
    series.push({ date: key, total: 0 });
  }

  for (const o of allOrders) {
    const created = new Date(o.created_at);
    const mk = monthKey(created);
    const isSale = SALES_STATUSES.includes(o.status);
    const total = Number(o.total);

    // status donut
    statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);

    // orders count
    if (mk === thisMonth) ordersThis++;
    else if (mk === prevMonth) ordersPrev++;

    // customers (unique emails)
    if (o.customer_email) {
      customersAll.add(o.customer_email);
      if (mk === thisMonth) customersThis.add(o.customer_email);
      else if (mk === prevMonth) customersPrev.add(o.customer_email);
    }

    // sales (confirmed onward)
    if (isSale) {
      salesAll += total;
      if (mk === thisMonth) salesThis += total;
      else if (mk === prevMonth) salesPrev += total;

      const dkey = o.created_at.slice(0, 10);
      const idx = dayIndex.get(dkey);
      if (idx !== undefined) series[idx].total += total;
    }
  }

  // ---- Top products ----
  const itemRows = (itemsRes.data ?? []) as unknown as {
    product_id: string | null;
    product_name: string;
    quantity: number;
  }[];
  const topMap = new Map<string, TopProduct>();
  for (const it of itemRows) {
    const key = it.product_id ?? `name:${it.product_name}`;
    const existing = topMap.get(key);
    if (existing) existing.unitsSold += it.quantity;
    else
      topMap.set(key, {
        productId: it.product_id,
        name: it.product_name,
        unitsSold: it.quantity,
      });
  }
  const topProducts = [...topMap.values()]
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);

  const statusBreakdown: StatusSlice[] = [...statusCounts.entries()].map(
    ([status, count]) => ({ status, count }),
  );

  return {
    orders: {
      value: allOrders.length,
      deltaPct: pctChange(ordersThis, ordersPrev),
    },
    sales: {
      value: Number(salesAll.toFixed(2)),
      deltaPct: pctChange(salesThis, salesPrev),
    },
    products: { value: productsCount.count ?? 0, deltaPct: null },
    customers: {
      value: customersAll.size,
      deltaPct: pctChange(customersThis.size, customersPrev.size),
    },
    recentOrders: (recentRes.data as Order[]) ?? [],
    salesSeries: series,
    statusBreakdown,
    topProducts,
  };
}
