"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Eye,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  WHATSAPP_PHONE,
} from "@/lib/constants";
import { updateOrderStatus } from "@/features/orders/actions";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/features/orders/types";

interface OrderRowActionsProps {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
}

function toWhatsAppPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 9) return `51${digits}`;
  return digits;
}

export function OrderRowActions({
  orderId,
  orderNumber,
  customerName,
  customerPhone,
  status,
}: OrderRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const nextStatus = ORDER_STATUS_TRANSITIONS[status].find(
    (candidate) => candidate !== "cancelado",
  );
  const phone =
    toWhatsAppPhone(customerPhone) || toWhatsAppPhone(WHATSAPP_PHONE);
  const waText = encodeURIComponent(
    `Hola ${customerName}, te escribimos por tu pedido ${orderNumber}.`,
  );
  const waUrl = `https://wa.me/${phone}?text=${waText}`;

  async function copyOrderNumber() {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast.success("Numero de pedido copiado");
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("No se pudo copiar el numero");
    }
  }

  function advanceStatus() {
    if (!nextStatus) return;
    startTransition(async () => {
      const result = await updateOrderStatus({
        orderId,
        status: nextStatus,
        force: false,
      });
      if (!result.ok) {
        toast.error(
          result.code === "insufficient_stock"
            ? "Sin stock suficiente. Revisa el detalle del pedido."
            : result.error,
        );
        return;
      }
      toast.success(`Estado: ${ORDER_STATUSES[nextStatus].label}`);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/pedidos/${orderId}`}
        aria-label={`Ver pedido ${orderNumber}`}
        title="Ver detalle"
        className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
      >
        <Eye className="h-4 w-4" />
      </Link>

      <button
        type="button"
        onClick={copyOrderNumber}
        aria-label={`Copiar numero ${orderNumber}`}
        title="Copiar numero"
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg border border-border transition-colors hover:border-accent hover:text-accent",
          copied ? "text-mint" : "text-muted-foreground",
        )}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Escribir por WhatsApp sobre ${orderNumber}`}
        title="WhatsApp"
        className="grid h-9 w-9 place-items-center rounded-lg border border-border text-[#16a34a] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/10"
      >
        <MessageCircle className="h-4 w-4" />
      </a>

      {nextStatus && (
        <button
          type="button"
          onClick={advanceStatus}
          disabled={isPending}
          title={`Marcar ${ORDER_STATUSES[nextStatus].label}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-accent-foreground transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" />
          )}
          {ORDER_STATUSES[nextStatus].label}
        </button>
      )}
    </div>
  );
}
