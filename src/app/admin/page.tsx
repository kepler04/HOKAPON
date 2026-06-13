import Link from "next/link";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  ArrowRight,
  Plus,
  Tags,
  ClipboardList,
  ArrowDownUp,
} from "lucide-react";
import { getDashboardStats } from "@/features/dashboard/queries";
import { getAdminSession } from "@/features/auth/queries";
import { formatPrice, formatDateShort } from "@/lib/format";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { SalesChart } from "@/features/dashboard/components/sales-chart";
import { StatusDonut } from "@/features/dashboard/components/status-donut";
import { TopProducts } from "@/features/dashboard/components/top-products";

const quickActions = [
  { href: "/admin/productos/nuevo", label: "Nuevo producto", desc: "Agregar producto", icon: Plus },
  { href: "/admin/categorias", label: "Nueva categoría", desc: "Crear categoría", icon: Tags },
  { href: "/admin/pedidos", label: "Ver pedidos", desc: "Gestionar pedidos", icon: ClipboardList },
  { href: "/admin/inventario", label: "Inventario", desc: "Entradas y salidas", icon: ArrowDownUp },
];

export default async function AdminDashboard() {
  const [stats, session] = await Promise.all([
    getDashboardStats(),
    getAdminSession(),
  ]);

  const firstName = (session?.fullName ?? session?.email ?? "Admin").split(
    " ",
  )[0];
  const salesSpark = stats.salesSeries.map((p) => p.total);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl font-extrabold">
          ¡Bienvenido, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground">Aquí tienes el resumen de tu tienda.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pedidos totales"
          value={String(stats.orders.value)}
          icon={ShoppingCart}
          tone="accent"
          deltaPct={stats.orders.deltaPct}
        />
        <StatCard
          label="Ventas totales"
          value={formatPrice(stats.sales.value)}
          icon={DollarSign}
          tone="mint"
          deltaPct={stats.sales.deltaPct}
          spark={salesSpark}
        />
        <StatCard
          label="Productos activos"
          value={String(stats.products.value)}
          icon={Package}
          tone="blue"
          deltaPct={stats.products.deltaPct}
        />
        <StatCard
          label="Clientes"
          value={String(stats.customers.value)}
          icon={Users}
          tone="sun"
          deltaPct={stats.customers.deltaPct}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Ventas últimos 30 días</h2>
          </div>
          <SalesChart data={stats.salesSeries} />
        </section>

        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Pedidos por estado</h2>
          <StatusDonut slices={stats.statusBreakdown} />
        </section>
      </div>

      {/* Recent orders + top products */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Pedidos recientes</h2>
            <Link
              href="/admin/pedidos"
              className="text-sm font-semibold text-accent hover:underline"
            >
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
                    <tr
                      key={order.id}
                      className="border-b border-border/60 last:border-0"
                    >
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

        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Productos más vendidos</h2>
            <Link
              href="/admin/productos"
              className="text-sm font-semibold text-accent hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <TopProducts products={stats.topProducts} />
        </section>
      </div>

      {/* Quick actions */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-bold">Acciones rápidas</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ href, label, desc, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-2xl border border-border p-4 transition-colors hover:border-accent hover:bg-accent/5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
