import type { OrderStatus, Payment, PaymentStatus } from "@/features/orders/types";

export type ProofPaymentMethod = "yape" | "plin" | "transferencia";

export const PROOF_METHOD_LABELS: Record<ProofPaymentMethod, string> = {
  yape: "Yape",
  plin: "Plin",
  transferencia: "Transferencia",
};

export const PROOF_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendiente: "En revision",
  confirmado: "Pago confirmado",
  rechazado: "Comprobante rechazado",
};

const CLOSED_FOR_PROOF: OrderStatus[] = [
  "pago_confirmado",
  "en_preparacion",
  "entregado",
  "cancelado",
];

export function canUploadPaymentProof(status: OrderStatus) {
  return !CLOSED_FOR_PROOF.includes(status);
}

export function getLatestPayment(payments: Payment[]) {
  return [...payments].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];
}
