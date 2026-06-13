"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileImage,
  Landmark,
  Loader2,
  UploadCloud,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitPaymentProof } from "@/features/orders/payment-proof-actions";
import {
  canUploadPaymentProof,
  PROOF_METHOD_LABELS,
  PROOF_STATUS_LABELS,
  type ProofPaymentMethod,
} from "@/features/orders/payment-proof-utils";
import type { OrderStatus, PaymentStatus } from "@/features/orders/types";

const METHODS: {
  value: ProofPaymentMethod;
  icon: typeof Wallet;
  tone: string;
}[] = [
  {
    value: "yape",
    icon: Wallet,
    tone: "border-violet-200 bg-violet-50 text-violet-700",
  },
  {
    value: "plin",
    icon: Wallet,
    tone: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    value: "transferencia",
    icon: Landmark,
    tone: "border-blue-200 bg-blue-50 text-blue-800",
  },
];

export function PaymentProofUploader({
  orderNumber,
  contact,
  orderStatus,
  proofStatus,
  hasProof,
}: {
  orderNumber: string;
  contact?: string;
  orderStatus: OrderStatus;
  proofStatus?: PaymentStatus;
  hasProof: boolean;
}) {
  const router = useRouter();
  const inputId = useId();
  const [method, setMethod] = useState<ProofPaymentMethod>("yape");
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const canUpload = canUploadPaymentProof(orderStatus);
  const isRejected = proofStatus === "rechazado";
  const isConfirmed = proofStatus === "confirmado";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      toast.error("Selecciona una imagen del comprobante");
      return;
    }

    const formData = new FormData();
    formData.set("orderNumber", orderNumber);
    if (contact) formData.set("contact", contact);
    formData.set("method", method);
    formData.set("proof", file);

    startTransition(async () => {
      const result = await submitPaymentProof(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Comprobante enviado");
      setFile(null);
      router.refresh();
    });
  }

  if (!canUpload) {
    return (
      <div className="rounded-2xl border border-mint/20 bg-mint/5 p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint/15 text-mint">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">
              {orderStatus === "cancelado"
                ? "Pedido cancelado"
                : "Pago ya revisado"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              No necesitas subir otro comprobante para este pedido.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {hasProof && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl border p-4",
            isRejected
              ? "border-destructive/25 bg-destructive/5"
              : "border-mint/20 bg-mint/5",
          )}
        >
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
              isRejected
                ? "bg-destructive/10 text-destructive"
                : "bg-mint/15 text-mint",
            )}
          >
            {isRejected ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </span>
          <div>
            <p className="font-semibold">
              {proofStatus ? PROOF_STATUS_LABELS[proofStatus] : "Recibido"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isConfirmed
                ? "Tu pago fue validado."
                : isRejected
                  ? "Puedes subir una nueva imagen corregida."
                  : "Lo revisaremos desde el panel de pedidos."}
            </p>
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Metodo usado
        </p>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map(({ value, icon: Icon, tone }) => (
            <button
              key={value}
              type="button"
              aria-pressed={method === value}
              onClick={() => setMethod(value)}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all",
                method === value
                  ? tone
                  : "border-border bg-card text-muted-foreground hover:border-accent hover:text-accent",
              )}
            >
              <Icon className="h-4 w-4" />
              {PROOF_METHOD_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      <label
        htmlFor={inputId}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed p-4 transition-colors",
          file
            ? "border-mint/40 bg-mint/5"
            : "border-border bg-secondary/40 hover:border-accent hover:bg-accent/5",
        )}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-card text-accent">
          {file ? <FileImage className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            {file ? file.name : "Selecciona la imagen del comprobante"}
          </span>
          <span className="text-xs text-muted-foreground">JPG, PNG o WEBP</span>
        </span>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>

      <Button
        type="submit"
        className="w-full rounded-2xl"
        disabled={isPending || !file}
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Enviando
          </>
        ) : (
          <>
            <UploadCloud className="h-5 w-5" /> Subir comprobante
          </>
        )}
      </Button>
    </form>
  );
}
