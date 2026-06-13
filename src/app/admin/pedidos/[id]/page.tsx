import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, Phone, User } from "lucide-react";
import { getOrderById } from "@/features/orders/queries";
import { formatPrice, formatDate } from "@/lib/format";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { StatusChanger } from "@/features/orders/components/status-changer";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/admin/pedidos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Pedidos
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.created_at)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status changer */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="mb-3 font-display text-lg font-bold">Cambiar estado</h2>
        <StatusChanger orderId={order.id} current={order.status} />
      </section>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* Items */}
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Productos</h2>
          <ul className="divide-y divide-border">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="font-medium">{item.product_name}</span>
                  <span className="text-muted-foreground">
                    {" "}× {item.quantity} · {formatPrice(item.unit_price)} c/u
                  </span>
                </span>
                <span className="font-medium">{formatPrice(item.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-bold">
              {formatPrice(order.total)}
            </span>
          </div>
          {order.notes && (
            <div className="mt-4 rounded-2xl bg-secondary/60 p-4 text-sm">
              <p className="mb-1 font-medium">Nota del cliente</p>
              <p className="text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </section>

        {/* Customer */}
        <aside className="h-fit rounded-3xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Cliente</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {order.customer_name}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${order.customer_phone}`} className="hover:text-accent">
                {order.customer_phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${order.customer_email}`} className="break-all hover:text-accent">
                {order.customer_email}
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
