"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileImage,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { reviewPaymentProof } from "@/features/orders/payment-proof-actions";
import {
  PROOF_METHOD_LABELS,
  PROOF_STATUS_LABELS,
  type ProofPaymentMethod,
} from "@/features/orders/payment-proof-utils";
import type { OrderStatus, Payment } from "@/features/orders/types";

function statusTone(status: Payment["status"]) {
  if (status === "confirmado") return "mint";
  if (status === "rechazado") return "berry";
  return "sun";
}

export function PaymentProofReview({
  orderId,
  orderStatus,
  latestPayment,
  proofUrl,
  hasShortage,
}: {
  orderId: string;
  orderStatus: OrderStatus;
  latestPayment?: Payment;
  proofUrl: string | null;
  hasShortage: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmForce, setConfirmForce] = useState(false);
  const canReview =
    !!latestPayment &&
    latestPayment.status === "pendiente" &&
    orderStatus === "pago_enviado";

  function run(decision: "confirm" | "reject", force = false) {
    if (!latestPayment) return;
    startTransition(async () => {
      const result = await reviewPaymentProof({
        orderId,
        paymentId: latestPayment.id,
        decision,
        force,
      });
      if (!result.ok) {
        if (
          decision === "confirm" &&
          result.code === "insufficient_stock" &&
          !force
        ) {
          setConfirmForce(true);
          return;
        }
        toast.error(result.error);
        return;
      }
      setConfirmForce(false);
      toast.success(
        decision === "confirm"
          ? "Pago confirmado"
          : "Comprobante rechazado",
      );
      router.refresh();
    });
  }

  if (!latestPayment) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <FileImage className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold">Comprobante</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Aun no hay comprobante subido para este pedido.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const method = latestPayment.method as ProofPaymentMethod;

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Comprobante</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {PROOF_METHOD_LABELS[method]} · {formatPrice(latestPayment.amount)}
          </p>
        </div>
        <Badge tone={statusTone(latestPayment.status)}>
          {PROOF_STATUS_LABELS[latestPayment.status]}
        </Badge>
      </div>

      <div
        className={cn(
          "mt-5 overflow-hidden rounded-2xl border bg-secondary/40",
          latestPayment.status === "rechazado"
            ? "border-destructive/30"
            : "border-border",
        )}
      >
        {proofUrl ? (
          <Image
            src={proofUrl}
            alt="Comprobante de pago"
            width={900}
            height={1200}
            unoptimized
            className="max-h-[560px] w-full object-contain"
          />
        ) : (
          <div className="grid min-h-52 place-items-center p-6 text-center text-sm text-muted-foreground">
            No se pudo generar la vista del comprobante.
          </div>
        )}
      </div>

      {canReview && hasShortage && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Este pedido tiene faltante de stock. Si confirmas el pago, te
            pediremos confirmacion antes de dejar stock en negativo.
          </p>
        </div>
      )}

      {canReview && (
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => run("reject")}
            disabled={isPending}
            className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            Rechazar
          </Button>
          <Button
            type="button"
            onClick={() => run("confirm")}
            disabled={isPending}
            className="rounded-xl"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
            Confirmar pago
          </Button>
        </div>
      )}

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
                  Puedes confirmar igual y el stock quedara en negativo para
                  reponerlo despues.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="soft"
                onClick={() => setConfirmForce(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => run("confirm", true)}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Confirmando
                  </>
                ) : (
                  "Confirmar igual"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
