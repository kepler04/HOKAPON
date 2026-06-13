"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/features/orders/actions";
import { ORDER_STATUSES, ORDER_STATUS_TRANSITIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/features/orders/types";

/** Lets the admin advance an order to an allowed next status. */
export function StatusChanger({
  orderId,
  current,
  hasShortage = false,
}: {
  orderId: string;
  current: OrderStatus;
  /** True when the order can't be fulfilled with current stock. */
  hasShortage?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // When confirming payment is blocked by stock, we ask for an explicit
  // override before retrying with force.
  const [confirmForce, setConfirmForce] = useState(false);
  const nextStates = ORDER_STATUS_TRANSITIONS[current];

  function run(status: OrderStatus, force: boolean) {
    startTransition(async () => {
      const r = await updateOrderStatus({ orderId, status, force });
      if (!r.ok) {
        // Only offer the override dialog on the FIRST (non-forced) attempt.
        if (!force && r.code === "insufficient_stock") {
          setConfirmForce(true);
          return;
        }
        // Any other failure (incl. a forced attempt that still failed) is shown.
        setConfirmForce(false);
        toast.error(r.error);
        return;
      }
      setConfirmForce(false);
      toast.success(
        force
          ? "Pago confirmado (stock forzado)"
          : `Estado: ${ORDER_STATUSES[status].label}`,
      );
      router.refresh();
    });
  }

  if (nextStates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este pedido está en un estado final.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {isPending && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {nextStates.map((status) => {
          const isCancel = status === "cancelado";
          const isConfirmPay = status === "pago_confirmado";
          return (
            <button
              key={status}
              onClick={() => run(status, false)}
              disabled={isPending}
              className={
                isCancel
                  ? "rounded-full border-2 border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                  : "rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
              }
            >
              {isCancel
                ? "Cancelar pedido"
                : `Marcar: ${ORDER_STATUSES[status].label}`}
              {isConfirmPay && hasShortage && " ⚠️"}
            </button>
          );
        })}
      </div>

      {/* Confirm-anyway dialog (insufficient stock) */}
      {confirmForce && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isPending) setConfirmForce(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold">
                  No hay stock suficiente
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Este pedido no tiene stock disponible. Si confirmas el pago de
                  todas formas, el stock quedará en negativo para que sepas
                  cuánto debes reponer.
                </p>
                <p className="mt-3 text-sm font-semibold">
                  ¿Seguro que quieres proceder?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="soft"
                onClick={() => setConfirmForce(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => run("pago_confirmado", true)}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Confirmando…
                  </>
                ) : (
                  "Sí, confirmar igual"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
