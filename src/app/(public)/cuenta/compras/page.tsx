import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShoppingBag, PackageSearch } from "lucide-react";
import {
  requireCustomer,
  getCustomerOrders,
} from "@/features/customer-auth/queries";
import { formatPrice, formatDate } from "@/lib/format";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";

export const metadata: Metadata = {
  title: "Mis compras",
  robots: { index: false },
};

export default async function PurchasesPage() {
  await requireCustomer("/cuenta?next=/cuenta/compras");
  const orders = await getCustomerOrders();

  return (
    <Container className="max-w-3xl py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Inicio
      </Link>

      <div className="mt-4 mb-8 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
          <ShoppingBag className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-extrabold">Mis compras</h1>
          <p className="text-sm text-muted-foreground">
            Historial de tus pedidos en HOKAPON.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          emoji="🛍️"
          title="Aún no tienes compras"
          description="Cuando hagas un pedido aparecerá aquí."
        >
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            Ver productos
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">
                    {order.order_number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <ul className="mt-4 divide-y divide-border border-t border-border">
                {order.order_items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between gap-3 py-2.5 text-sm"
                  >
                    <span>
                      <span className="font-medium">{item.product_name}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.line_total)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-display text-xl font-bold">
                  {formatPrice(order.total)}
                </span>
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  href={`/seguimiento?codigo=${encodeURIComponent(
                    order.order_number,
                  )}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                >
                  <PackageSearch className="h-4 w-4" /> Seguir pedido
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </Container>
  );
}
