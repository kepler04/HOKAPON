import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ChevronLeft, Mail, Phone, User } from "lucide-react";
import {
  getOrderById,
  getOrderStockStatus,
  getPaymentProofSignedUrl,
} from "@/features/orders/queries";
import { formatPrice, formatDate } from "@/lib/format";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { StatusChanger } from "@/features/orders/components/status-changer";
import { PaymentProofReview } from "@/features/orders/components/payment-proof-review";
import { getLatestPayment } from "@/features/orders/payment-proof-utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const stockStatus = await getOrderStockStatus(id);
  const latestPayment = getLatestPayment(order.payments);
  const proofUrl = latestPayment?.proof_url
    ? await getPaymentProofSignedUrl(latestPayment.proof_url)
    : null;
  const hasShortage = stockStatus.shortages.length > 0;
  // The stock warning only matters while the order hasn't been paid/committed.
  const showStockWarning =
    hasShortage &&
    !["pago_confirmado", "en_preparacion", "entregado", "cancelado"].includes(
      order.status,
    );

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

      {/* Stock shortage warning */}
      {showStockWarning && (
        <section className="rounded-3xl border-2 border-destructive/40 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h2 className="font-display text-lg font-bold text-destructive">
                No hay stock disponible
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                No puedes completar esta venta con el stock actual. Revisa los
                productos faltantes o cancela la venta.
              </p>
              <ul className="mt-4 space-y-2">
                {stockStatus.shortages.map((s) => (
                  <li
                    key={s.productId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-2.5 text-sm"
                  >
                    <span className="font-medium">{s.productName}</span>
                    <span className="text-muted-foreground">
                      Pedido: <b className="text-foreground">{s.requested}</b> ·
                      Disponible: <b className="text-foreground">{s.available}</b>{" "}
                      · Faltan:{" "}
                      <b className="text-destructive">{s.missing}</b>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Status changer */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="mb-3 font-display text-lg font-bold">Cambiar estado</h2>
        <StatusChanger
          orderId={order.id}
          current={order.status}
          hasShortage={showStockWarning}
        />
      </section>

      <PaymentProofReview
        orderId={order.id}
        orderStatus={order.status}
        latestPayment={latestPayment}
        proofUrl={proofUrl}
        hasShortage={showStockWarning}
      />

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
