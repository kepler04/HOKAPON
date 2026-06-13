import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight, PackageSearch } from "lucide-react";
import { getPublicOrderByNumber } from "@/features/orders/queries";
import { formatPrice } from "@/lib/format";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { PaymentMethods } from "@/features/checkout/components/payment-methods";
import { WhatsAppButton } from "@/features/checkout/components/whatsapp-button";

export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false },
};

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export default async function SuccessPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await getPublicOrderByNumber(orderNumber);
  if (!order) notFound();

  const items = order.order_items.map((i) => ({
    product_name: i.product_name,
    quantity: i.quantity,
    unit_price: i.unit_price,
  }));

  return (
    <Container className="max-w-3xl py-10">
      {/* Confirmation header */}
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint/15 text-mint">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-5 text-3xl font-bold">¡Pedido confirmado!</h1>
        <p className="mt-2 text-muted-foreground">
          Guarda tu número de pedido. Te servirá para coordinar el pago.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2">
          <span className="text-sm text-muted-foreground">N° de pedido</span>
          <span className="font-display text-lg font-bold tracking-wide">
            {order.order_number}
          </span>
        </div>
      </div>

      {/* Order summary */}
      <section className="mt-8 rounded-3xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-bold">Resumen</h2>
        <ul className="divide-y divide-border">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
              <span>
                <span className="font-medium">{item.product_name}</span>
                <span className="text-muted-foreground"> × {item.quantity}</span>
              </span>
              <span className="font-medium">{formatPrice(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-baseline justify-between border-t border-border pt-4">
          <span className="font-semibold">Total a pagar</span>
          <span className="font-display text-2xl font-bold">
            {formatPrice(order.total)}
          </span>
        </div>
      </section>

      {/* Payment instructions */}
      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Badge tone="accent">Paso 1</Badge>
          <h2 className="font-display text-lg font-bold">Realiza tu pago</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Paga el total con cualquiera de estos métodos. Toca el ícono para
          copiar los datos.
        </p>
        <PaymentMethods />
      </section>

      {/* WhatsApp step */}
      <section className="mt-8 rounded-3xl border-2 border-dashed border-border bg-card/60 p-6">
        <div className="mb-3 flex items-center gap-2">
          <Badge tone="mint">Paso 2</Badge>
          <h2 className="font-display text-lg font-bold">Envía tu comprobante</h2>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          Ya hicimos el pedido por ti. Solo envíanos la captura de tu pago por
          WhatsApp con tu número de pedido y coordinamos la entrega.
        </p>
        <WhatsAppButton
          orderNumber={order.order_number}
          items={items}
          total={order.total}
        />
      </section>

      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <Link
          href={`/seguimiento?codigo=${encodeURIComponent(order.order_number)}`}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-accent px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <PackageSearch className="h-5 w-5" /> Seguir el estado de mi pedido
        </Link>
        <Link
          href="/productos"
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
        >
          Seguir comprando <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </Container>
  );
}
