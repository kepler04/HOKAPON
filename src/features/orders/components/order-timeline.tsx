import { Check, XCircle } from "lucide-react";
import { ORDER_STATUSES, ORDER_STATUS_ORDER } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/features/orders/types";

/**
 * Vertical progress timeline for an order status.
 * Walks ORDER_STATUS_ORDER, marking steps done/current/upcoming. A cancelled
 * order is shown as a single red state instead of the progress track.
 */
export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelado") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
        <XCircle className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-bold">Pedido cancelado</p>
          <p className="text-sm text-destructive/80">
            Si crees que es un error, escríbenos por WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_ORDER.indexOf(status);

  return (
    <ol className="relative space-y-6">
      {ORDER_STATUS_ORDER.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        const meta = ORDER_STATUSES[step];
        const isLast = i === ORDER_STATUS_ORDER.length - 1;

        return (
          <li key={step} className="relative flex gap-4">
            {/* Connector line */}
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%+0.5rem)] w-0.5",
                  done ? "bg-accent" : "bg-border",
                )}
              />
            )}
            {/* Dot */}
            <span
              className={cn(
                "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors",
                done && "border-accent bg-accent text-accent-foreground",
                current &&
                  "border-accent bg-accent/15 text-accent ring-4 ring-accent/15",
                !done && !current && "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? (
                <Check className="h-4 w-4" />
              ) : (
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    current ? "bg-accent" : "bg-muted-foreground/40",
                  )}
                />
              )}
            </span>
            {/* Label */}
            <div className="pt-1">
              <p
                className={cn(
                  "font-semibold leading-tight",
                  current ? "text-accent" : done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {meta.label}
              </p>
              {current && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Estado actual de tu pedido.
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
