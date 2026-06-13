import { Suspense } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ClipboardList,
  DollarSign,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { getOrders } from "@/features/orders/queries";
import { formatPrice, formatDateShort } from "@/lib/format";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { OrdersFilterBar } from "@/features/orders/components/orders-filter-bar";
import { OrderRowActions } from "@/features/orders/components/order-row-actions";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/features/orders/types";

interface Props {
  searchParams: Promise<{
    status?: string;
    search?: string;
    from?: string;
    to?: string;
    action?: string;
  }>;
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

const NEEDS_ACTION_STATUSES: OrderStatus[] = [
  "pendiente",
  "esperando_pago",
  "pago_enviado",
];

function isValidDateParam(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone: "accent" | "mint" | "blue" | "sun";
}) {
  const tones = {
    accent: "bg-accent/10 text-accent",
    mint: "bg-mint/15 text-mint",
    blue: "bg-blue-100 text-blue-700",
    sun: "bg-sun/20 text-[hsl(38_90%_36%)]",
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
        </div>
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status, search, from, to, action } = await searchParams;
  const validStatus = VALID_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;
  const dateFrom = isValidDateParam(from);
  const dateTo = isValidDateParam(to);
  const validAction = action === "needs_action" ? action : undefined;

  const orders = await getOrders({
    status: validStatus,
    search,
    dateFrom,
    dateTo,
    action: validAction,
  });
  const needsActionCount = orders.filter((order) =>
    NEEDS_ACTION_STATUSES.includes(order.status),
  ).length;
  const paymentSentCount = orders.filter(
    (order) => order.status === "pago_enviado",
  ).length;
  const filteredTotal = orders.reduce((sum, order) => sum + order.total, 0);
  const activeFilters = [
    validStatus,
    validAction,
    search?.trim(),
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">
            Gestiona pagos, seguimiento y estados desde una sola vista.
          </p>
        </div>
        <Link
          href="/seguimiento"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          <ClipboardList className="h-4 w-4" />
          Ver seguimiento publico
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Resultados"
          value={String(orders.length)}
          hint={
            activeFilters > 0
              ? `${activeFilters} filtro(s) activo(s)`
              : "Todos los pedidos recientes"
          }
          icon={ShoppingCart}
          tone="accent"
        />
        <SummaryCard
          label="Requieren accion"
          value={String(needsActionCount)}
          hint="Pendientes, esperando pago o con comprobante"
          icon={AlertCircle}
          tone="sun"
        />
        <SummaryCard
          label="Comprobantes"
          value={String(paymentSentCount)}
          hint="Pedidos listos para revisar pago"
          icon={ClipboardList}
          tone="blue"
        />
        <SummaryCard
          label="Total filtrado"
          value={formatPrice(filteredTotal)}
          hint="Suma de los pedidos visibles"
          icon={DollarSign}
          tone="mint"
        />
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
        <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-[0_18px_70px_-55px_hsl(var(--foreground)/0.55)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Pedido</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Contacto</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const needsAction = NEEDS_ACTION_STATUSES.includes(order.status);

                return (
                  <tr
                    key={order.id}
                    className={cn(
                      "border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40",
                      needsAction && "bg-accent/5",
                    )}
                  >
                    <td className="px-5 py-4 align-top">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="font-semibold text-accent hover:underline"
                      >
                        {order.order_number}
                      </Link>
                      {needsAction && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
                          <AlertCircle className="h-3 w-3" />
                          Atender
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer_email}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="font-medium hover:text-accent"
                      >
                        {order.customer_phone}
                      </a>
                      <p className="text-xs text-muted-foreground">WhatsApp</p>
                    </td>
                    <td className="px-5 py-4 align-top text-muted-foreground">
                      {formatDateShort(order.created_at)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 text-right align-top font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <OrderRowActions
                        orderId={order.id}
                        orderNumber={order.order_number}
                        customerName={order.customer_name}
                        customerPhone={order.customer_phone}
                        status={order.status}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
