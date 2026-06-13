import { Suspense } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getOrders } from "@/features/orders/queries";
import { formatPrice, formatDateShort } from "@/lib/format";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { OrdersFilterBar } from "@/features/orders/components/orders-filter-bar";
import type { OrderStatus } from "@/features/orders/types";

interface Props {
  searchParams: Promise<{ status?: string; search?: string }>;
}

const VALID_STATUSES: OrderStatus[] = [
  "pendiente",
  "esperando_pago",
  "pago_enviado",
  "pago_confirmado",
  "en_preparacion",
  "entregado",
  "cancelado",
];

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status, search } = await searchParams;
  const validStatus = VALID_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;

  const orders = await getOrders({ status: validStatus, search });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">{orders.length} resultados</p>
      </div>

      <Suspense fallback={<div className="h-24" />}>
        <OrdersFilterBar />
      </Suspense>

      {orders.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border-2 border-dashed border-border py-16 text-center">
          <ShoppingCart className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-display text-lg font-semibold">Sin pedidos</p>
          <p className="text-sm text-muted-foreground">
            No hay pedidos que coincidan con el filtro.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Pedido</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Teléfono</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="font-semibold text-accent hover:underline"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{o.customer_name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.customer_phone}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {formatDateShort(o.created_at)}
                  </td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-3 text-right font-medium">
                    {formatPrice(o.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
