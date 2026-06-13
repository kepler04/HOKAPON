import { CURRENCY_SYMBOL, WHATSAPP_PHONE } from "./constants";

export interface WhatsAppOrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface WhatsAppOrderPayload {
  orderNumber: string;
  items: WhatsAppOrderItem[];
  total: number;
}

/**
 * Build the pre-filled WhatsApp message a customer sends to confirm an order
 * and attach their payment proof.
 */
export function buildWhatsAppMessage(order: WhatsAppOrderPayload): string {
  const lines: string[] = [];
  lines.push(`Hola! Quiero confirmar mi pedido *${order.orderNumber}*`);
  lines.push("");
  lines.push("🛍️ Productos:");
  for (const item of order.items) {
    lines.push(
      `• ${item.product_name} (x${item.quantity}) — ${CURRENCY_SYMBOL} ${item.unit_price.toFixed(2)} c/u`,
    );
  }
  lines.push("");
  lines.push(`💰 *Total: ${CURRENCY_SYMBOL} ${order.total.toFixed(2)}*`);
  lines.push("");
  lines.push("Adjunto mi comprobante de pago 👇");
  return lines.join("\n");
}

/**
 * Build a full wa.me deep link with the pre-filled message.
 * Uses the admin phone from env (digits only, international format).
 */
export function buildWhatsAppUrl(order: WhatsAppOrderPayload): string {
  const phone = WHATSAPP_PHONE.replace(/\D/g, "");
  const text = encodeURIComponent(buildWhatsAppMessage(order));
  return `https://wa.me/${phone}?text=${text}`;
}
