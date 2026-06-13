import { CURRENCY_SYMBOL } from "./constants";

/** Format a number as store currency, e.g. 39.9 → "S/ 39.90". */
export function formatPrice(value: number): string {
  return `${CURRENCY_SYMBOL} ${value.toFixed(2)}`;
}

/** Format an ISO timestamp as a localized date-time (es-PE). */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

/** Short date only, e.g. "12 jun 2026". */
export function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
  }).format(new Date(iso));
}
