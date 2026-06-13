"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/features/orders/actions";
import { ORDER_STATUSES, ORDER_STATUS_TRANSITIONS } from "@/lib/constants";
import type { OrderStatus } from "@/features/orders/types";

/** Lets the admin advance an order to an allowed next status. */
export function StatusChanger({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const nextStates = ORDER_STATUS_TRANSITIONS[current];

  function change(status: OrderStatus) {
    startTransition(async () => {
      const r = await updateOrderStatus({ orderId, status });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(`Estado: ${ORDER_STATUSES[status].label}`);
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
    <div className="flex flex-wrap items-center gap-2">
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      {nextStates.map((status) => {
        const isCancel = status === "cancelado";
        return (
          <button
            key={status}
            onClick={() => change(status)}
            disabled={isPending}
            className={
              isCancel
                ? "rounded-full border-2 border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                : "rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105 active:scale-95"
            }
          >
            {isCancel ? "Cancelar pedido" : `Marcar: ${ORDER_STATUSES[status].label}`}
          </button>
        );
      })}
    </div>
  );
}
