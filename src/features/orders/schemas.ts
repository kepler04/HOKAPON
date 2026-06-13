import { z } from "zod";

const ORDER_STATUSES = [
  "pendiente",
  "esperando_pago",
  "pago_enviado",
  "pago_confirmado",
  "en_preparacion",
  "entregado",
  "cancelado",
] as const;

/** Validate an order status change (admin). */
export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(ORDER_STATUSES),
  // When confirming payment without enough stock, the admin may force it.
  // Stock is then decremented anyway (may go negative).
  force: z.boolean().optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
