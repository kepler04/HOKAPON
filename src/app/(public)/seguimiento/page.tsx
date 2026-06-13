import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, ChevronRight, MessageCircle } from "lucide-react";
import { getPublicOrderByNumber } from "@/features/orders/queries";
import { WHATSAPP_PHONE } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { TrackOrderForm } from "@/features/orders/components/track-order-form";
import { OrderTimeline } from "@/features/orders/components/order-timeline";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";

export const metadata: Metadata = {
  title: "Seguimiento de pedido",
  description:
    "Ingresa el código de tu pedido para ver en qué estado se encuentra.",
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ codigo?: string }>;
}

export default async function TrackingPage({ searchParams }: Props) {
  const { codigo } = await searchParams;
  const code = codigo?.trim();
  const order = code ? await getPublicOrderByNumber(code) : null;
  const waUrl = `https://wa.me/${WHATSAPP_PHONE.replace(/\D/g, "")}`;

  return (
    <Container className="max-w-3xl py-10">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/10 text-accent">
          <PackageSearch className="h-9 w-9" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">
          Sigue tu pedido
        </h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Ingresa el código que recibiste al hacer tu compra y revisa el estado
          de tu pedido.
        </p>
      </div>

      {/* Search form */}
      <div className="mt-8 rounded-3xl border border-border bg-card p-6">
        <TrackOrderForm initialCode={code ?? ""} />
      </div>

      {/* Results */}
      {code && !order && (
        <div className="mt-8">
          <EmptyState
            emoji="🔎"
            title="No encontramos ese pedido"
            description={`No hay ningún pedido con el código "${code}". Revisa que esté bien escrito (tal cual te lo dimos al comprar).`}
          >
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1ebe5b]"
            >
              <MessageCircle className="h-5 w-5" /> Consultar por WhatsApp
            </a>
          </EmptyState>
        </div>
      )}

      {order && (
        <div className="mt-8 space-y-8">
          {/* Status card */}
          <section className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Pedido</p>
                <p className="font-display text-xl font-bold tracking-wide">
                  {order.order_number}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <OrderTimeline status={order.status} />
          </section>

          {/* Summary */}
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Resumen</h2>
            <ul className="divide-y divide-border">
              {order.order_items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-3 py-3 text-sm"
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
            <div className="mt-2 flex items-baseline justify-between border-t border-border pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-display text-2xl font-bold">
                {formatPrice(order.total)}
              </span>
            </div>
          </section>

          {/* Help */}
          <div className="flex flex-col items-center gap-4 text-center">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1ebe5b]"
            >
              <MessageCircle className="h-5 w-5" /> ¿Dudas? Escríbenos por WhatsApp
            </a>
            <Link
              href="/productos"
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
            >
              Seguir comprando <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
}
