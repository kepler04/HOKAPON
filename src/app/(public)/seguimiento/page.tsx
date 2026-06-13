import type { Metadata } from "next";
import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Mail,
  MessageCircle,
  PackageSearch,
  Phone,
  ReceiptText,
} from "lucide-react";
import {
  getPublicOrderForTracking,
  getPublicOrderItemsWithImages,
} from "@/features/orders/queries";
import { WHATSAPP_PHONE } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/format";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { TrackOrderForm } from "@/features/orders/components/track-order-form";
import { OrderTimeline } from "@/features/orders/components/order-timeline";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";

export const metadata: Metadata = {
  title: "Seguimiento de pedido",
  description:
    "Ingresa tu numero de pedido y correo o telefono para ver el estado de tu compra.",
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ codigo?: string; contacto?: string }>;
}

export default async function TrackingPage({ searchParams }: Props) {
  const { codigo, contacto } = await searchParams;
  const code = codigo?.trim() ?? "";
  const contact = contacto?.trim() ?? "";
  const hasLookup = !!code && !!contact;
  const order = hasLookup
    ? await getPublicOrderForTracking({ orderNumber: code, contact })
    : null;
  const itemsWithImages = order
    ? await getPublicOrderItemsWithImages(order.id)
    : [];
  const displayItems =
    itemsWithImages.length > 0
      ? itemsWithImages
      : (order?.order_items.map((item) => ({
          id: item.id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
          imageUrl: null,
        })) ?? []);
  const whatsappPhone = WHATSAPP_PHONE.replace(/\D/g, "");
  const fallbackWaUrl = `https://wa.me/${whatsappPhone}`;
  const waUrl = order
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        `Hola! Quiero consultar sobre mi pedido ${order.order_number}.`,
      )}`
    : fallbackWaUrl;

  return (
    <Container className="max-w-5xl py-8 sm:py-12">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-accent/15 bg-[linear-gradient(120deg,hsl(var(--accent)/0.06),white_48%,hsl(var(--mint)/0.12))] px-5 py-8 shadow-[0_24px_80px_-56px_hsl(var(--foreground)/0.45)] sm:px-8">
        <div className="dot-grid absolute inset-0 opacity-[0.08]" aria-hidden />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
              <PackageSearch className="h-8 w-8" />
            </span>
            <h1 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">
              Sigue tu pedido
            </h1>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Ingresa tu numero de pedido y el correo o telefono usado en la
              compra. Asi protegemos tus datos y te mostramos solo tu pedido.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-[0_18px_60px_-48px_hsl(var(--foreground)/0.45)]">
            <TrackOrderForm initialCode={code} initialContact={contact} />
          </div>
        </div>
      </section>

      {code && !contact && (
        <section className="mt-6 rounded-3xl border border-sun/30 bg-sun/10 p-5 text-sm text-[hsl(38_90%_32%)]">
          Agrega el correo o telefono del pedido para ver el seguimiento.
        </section>
      )}

      {hasLookup && !order && (
        <div className="mt-8">
          <EmptyState
            emoji="?"
            title="No pudimos validar ese pedido"
            description={`Revisa que el numero "${code}" y el correo o telefono sean los mismos que usaste al comprar.`}
          >
            <a
              href={fallbackWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_-14px_rgba(37,211,102,0.85)] transition-colors hover:bg-[#1ebe5b]"
            >
              <MessageCircle className="h-5 w-5" /> Consultar por WhatsApp
            </a>
          </EmptyState>
        </div>
      )}

      {order && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-[1.4rem] border border-border bg-card p-5 shadow-[0_18px_60px_-48px_hsl(var(--foreground)/0.45)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pedido</p>
                  <p className="font-display text-2xl font-extrabold tracking-wide">
                    {order.order_number}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <TrackingFact
                  icon={CalendarDays}
                  label="Creado"
                  value={formatDate(order.created_at)}
                />
                <TrackingFact
                  icon={ReceiptText}
                  label="Total"
                  value={formatPrice(order.total)}
                />
                <TrackingFact
                  icon={CheckCircle2}
                  label="Verificado"
                  value="Contacto validado"
                />
              </div>
            </section>

            <section className="rounded-[1.4rem] border border-border bg-card p-5 shadow-[0_18px_60px_-48px_hsl(var(--foreground)/0.45)] sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold">
                    Estado del pedido
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    El admin actualiza este avance desde el panel de pedidos.
                  </p>
                </div>
              </div>
              <OrderTimeline status={order.status} />
            </section>

            <section className="rounded-[1.4rem] border border-border bg-card p-5 shadow-[0_18px_60px_-48px_hsl(var(--foreground)/0.45)] sm:p-6">
              <h2 className="font-display text-xl font-bold">
                Productos de tu pedido
              </h2>
              <ul className="mt-4 divide-y divide-border">
                {displayItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary/60">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.product_name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-muted-foreground">
                          <PackageSearch className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        x {item.quantity}{" "}
                        {item.quantity === 1 ? "unidad" : "unidades"}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-sm font-bold">
                      {formatPrice(item.line_total)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-1 flex items-baseline justify-between border-t border-border pt-5">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-extrabold text-accent">
                  {formatPrice(order.total)}
                </span>
              </div>
            </section>
          </div>

          <aside className="h-fit space-y-6 lg:sticky lg:top-28">
            <section className="rounded-[1.4rem] border border-mint/20 bg-mint/5 p-5">
              <h2 className="font-display text-lg font-bold">
                Necesitas ayuda?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Escribenos con tu numero de pedido y coordinamos el pago o la
                entrega.
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_-14px_rgba(37,211,102,0.85)] transition-colors hover:bg-[#1ebe5b]"
              >
                <MessageCircle className="h-5 w-5" /> Escribir por WhatsApp
              </a>
            </section>

            <section className="rounded-[1.4rem] border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold">Datos usados</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="min-w-0 truncate">{order.customer_email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer_phone}</span>
                </div>
              </div>
            </section>

            <Link
              href="/productos"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-accent px-5 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Seguir comprando <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      )}
    </Container>
  );
}

function TrackingFact({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-secondary/70 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-sm font-bold">{value}</p>
    </div>
  );
}
