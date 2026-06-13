import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  PackageSearch,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  getPublicOrderByNumber,
  getPublicOrderItemsWithImages,
} from "@/features/orders/queries";
import { getActivePaymentMethods } from "@/features/payments-config/queries";
import { formatPrice } from "@/lib/format";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { PaymentMethods } from "@/features/checkout/components/payment-methods";
import { WhatsAppButton } from "@/features/checkout/components/whatsapp-button";
import { CopyOrderNumber } from "@/features/checkout/components/copy-order-number";

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

  const [paymentMethods, itemsWithImages] = await Promise.all([
    getActivePaymentMethods(),
    getPublicOrderItemsWithImages(order.id),
  ]);

  const items = order.order_items.map((i) => ({
    product_name: i.product_name,
    quantity: i.quantity,
    unit_price: i.unit_price,
  }));

  return (
    <Container className="max-w-5xl py-8 sm:py-12">
      {/* Confirmation header */}
      <div className="relative overflow-hidden rounded-[1.75rem] border border-mint/20 bg-[linear-gradient(115deg,hsl(var(--mint)/0.08),white_45%,hsl(var(--mint)/0.12))] px-5 py-9 text-center shadow-[0_22px_70px_-46px_hsl(var(--mint)/0.65)] sm:px-8 sm:py-11">
        <div className="dot-grid absolute inset-0 opacity-[0.08]" aria-hidden />
        <span className="absolute left-[31%] top-9 h-1.5 w-1.5 rounded-full bg-mint/35" aria-hidden />
        <span className="absolute left-[45%] top-8 h-1.5 w-2 rotate-12 rounded-sm bg-accent" aria-hidden />
        <span className="absolute right-[39%] top-10 h-1.5 w-1.5 rounded-full bg-mint/45" aria-hidden />
        <span className="absolute right-[32%] top-11 h-2 w-1 rotate-[-18deg] rounded-sm bg-accent/70" aria-hidden />
        <div className="relative">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#20bf63] text-white shadow-[0_14px_32px_-10px_rgba(32,191,99,0.85)] ring-8 ring-white/70">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">
            ¡Pedido <span className="text-accent">confirmado!</span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Guarda tu número de pedido. Te servirá para coordinar el pago y hacer
            seguimiento a tu compra.
          </p>
          <CopyOrderNumber value={order.order_number} />
        </div>
      </div>

      {/* Order summary (with product thumbnails) */}
      <section className="mt-6 rounded-[1.4rem] border border-border bg-card p-5 shadow-[0_18px_60px_-48px_hsl(var(--foreground)/0.45)] sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">
            <PackageSearch className="h-5 w-5" />
          </span>
          <h2 className="font-display text-lg font-bold">Resumen de tu pedido</h2>
        </div>
        <ul className="divide-y divide-border">
          {itemsWithImages.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-4 sm:gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary/50">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.product_name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-2xl">
                    📦
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {item.product_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  x {item.quantity} {item.quantity === 1 ? "unidad" : "unidades"}
                </p>
              </div>
              <span className="whitespace-nowrap font-semibold">
                {formatPrice(item.line_total)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-1 flex items-baseline justify-between border-t border-border pt-5">
          <span className="font-semibold">Total a pagar</span>
          <span className="font-display text-2xl font-extrabold text-accent">
            {formatPrice(order.total)}
          </span>
        </div>
      </section>

      {/* Payment + WhatsApp (two columns) */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Step 1: pay */}
        <section className="rounded-[1.4rem] border border-border bg-card p-5 shadow-[0_18px_60px_-48px_hsl(var(--foreground)/0.45)] sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Badge tone="accent">Paso 1</Badge>
            <h2 className="font-display text-lg font-bold">Realiza tu pago</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Paga el total con cualquiera de estos métodos. Toca el ícono para
            copiar los datos.
          </p>

          <div className="space-y-4">
            <PaymentMethods methods={paymentMethods} />
          </div>

          {/* Exact amount reminder */}
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-accent" />
            <p className="text-sm">
              Asegúrate de enviar el pago por el monto exacto:{" "}
              <span className="font-bold text-accent">
                {formatPrice(order.total)}
              </span>
            </p>
          </div>
        </section>

        {/* Step 2: WhatsApp */}
        <section className="rounded-[1.4rem] border border-border bg-card p-5 shadow-[0_18px_60px_-48px_hsl(var(--foreground)/0.45)] sm:p-6">
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
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-mint/10 px-4 py-2.5 text-sm text-mint">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Tu información está segura con nosotros
          </div>
        </section>
      </div>

      {/* Tracking banner */}
      <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.4rem] border border-accent/20 bg-accent/5 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/10 text-accent shadow-[0_10px_28px_-18px_hsl(var(--accent))]">
            <PackageSearch className="h-6 w-6" />
          </span>
          <div>
            <p className="font-bold">¿Quieres hacer seguimiento?</p>
            <p className="text-sm text-muted-foreground">
              Revisa el estado de tu pedido en tiempo real.
            </p>
          </div>
        </div>
        <Link
          href={`/seguimiento?codigo=${encodeURIComponent(order.order_number)}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-accent px-5 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground sm:w-auto"
        >
          Seguir el estado de mi pedido <ChevronRight className="h-4 w-4" />
        </Link>
      </section>

      <div className="mt-6 text-center">
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
