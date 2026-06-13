import Link from "next/link";
import { Package, ShoppingCart, Clock, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/features/dashboard/queries";
import { formatPrice, formatDateShort } from "@/lib/format";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu tienda</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pedidos totales"
          value={String(stats.totalOrders)}
          icon={ShoppingCart}
          tone="accent"
        />
        <StatCard
          label="Productos activos"
          value={String(stats.totalProducts)}
          icon={Package}
          tone="mint"
        />
        <StatCard
          label="Pedidos pendientes"
          value={String(stats.pendingOrders)}
          icon={Clock}
          tone="sun"
        />
        <StatCard
          label="Ventas confirmadas"
          value={formatPrice(stats.confirmedSales)}
          icon={TrendingUp}
          tone="berry"
        />
      </div>

      {/* Recent orders */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Pedidos recientes</h2>
          <Link href="/admin/pedidos" className="text-sm font-semibold text-accent hover:underline">
            Ver todos
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay pedidos.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Pedido</th>
                  <th className="pb-2 pr-4 font-medium">Cliente</th>
                  <th className="pb-2 pr-4 font-medium">Fecha</th>
                  <th className="pb-2 pr-4 font-medium">Estado</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="font-semibold text-accent hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{order.customer_name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatDateShort(order.created_at)}
                    </td>
                    <td className="py-3 pr-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
