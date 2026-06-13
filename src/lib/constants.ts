import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types/database.types";

/** Order status: label, color hint, and allowed forward transitions. */
export const ORDER_STATUSES: Record<
  OrderStatus,
  { label: string; color: string }
> = {
  pendiente: { label: "Pendiente", color: "gray" },
  esperando_pago: { label: "Esperando pago", color: "amber" },
  pago_enviado: { label: "Pago enviado", color: "blue" },
  pago_confirmado: { label: "Pago confirmado", color: "violet" },
  en_preparacion: { label: "En preparación", color: "indigo" },
  entregado: { label: "Entregado", color: "green" },
  cancelado: { label: "Cancelado", color: "red" },
};

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  "pendiente",
  "esperando_pago",
  "pago_enviado",
  "pago_confirmado",
  "en_preparacion",
  "entregado",
];

/** Valid forward transitions; "cancelado" is reachable from any non-final state. */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pendiente: ["esperando_pago", "cancelado"],
  esperando_pago: ["pago_enviado", "cancelado"],
  pago_enviado: ["pago_confirmado", "cancelado"],
  pago_confirmado: ["en_preparacion", "cancelado"],
  en_preparacion: ["entregado", "cancelado"],
  entregado: [],
  cancelado: [],
};

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  yape: "Yape",
  plin: "Plin",
  transferencia: "Transferencia bancaria",
  whatsapp: "WhatsApp",
};

export const PAYMENT_STATUSES: Record<PaymentStatus, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  rechazado: "Rechazado",
};

/** Supabase Storage bucket names. */
export const STORAGE_BUCKETS = {
  PRODUCTS: "product-images", // public
  PROOFS: "payment-proofs", // private
} as const;

/** Public payment data, sourced from env (shown on the success page). */
export const PAYMENT_INFO = {
  yape: {
    number: process.env.NEXT_PUBLIC_YAPE_NUMBER ?? "",
    name: process.env.NEXT_PUBLIC_YAPE_NAME ?? "",
  },
  plin: {
    number: process.env.NEXT_PUBLIC_PLIN_NUMBER ?? "",
    name: process.env.NEXT_PUBLIC_PLIN_NAME ?? "",
  },
  bank: {
    name: process.env.NEXT_PUBLIC_BANK_NAME ?? "",
    holder: process.env.NEXT_PUBLIC_BANK_HOLDER ?? "",
    account: process.env.NEXT_PUBLIC_BANK_ACCOUNT ?? "",
    cci: process.env.NEXT_PUBLIC_BANK_CCI ?? "",
  },
} as const;

export const STORE_NAME =
  process.env.NEXT_PUBLIC_STORE_NAME ?? "Tienda YienKid";

/**
 * Internal domain used to map a username to a Supabase Auth email.
 * The admin logs in with a plain username (e.g. "yienkid"); under the hood we
 * authenticate against "{username}@{AUTH_USERNAME_DOMAIN}". Not a real domain.
 */
export const AUTH_USERNAME_DOMAIN = "yienkid.local";

/** Convert a username into the internal auth email. */
export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${AUTH_USERNAME_DOMAIN}`;
}
export const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";
export const CURRENCY_SYMBOL =
  process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? "S/";
