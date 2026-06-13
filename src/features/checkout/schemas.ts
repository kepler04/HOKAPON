import { z } from "zod";

/**
 * Checkout validation.
 *
 * Security: only product IDs and quantities are accepted from the client.
 * Prices and totals are NEVER trusted — the server recomputes them from the
 * database in the createOrder action.
 */

// Customer details only — what the FORM validates. Cart items are not part of
// the form (they come from the cart store), so they must not gate submission.
export const customerDetailsSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(2, "Ingresa tu nombre completo")
    .max(120, "Nombre demasiado largo"),
  customer_phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{6,20}$/, "Número de teléfono inválido"),
  customer_email: z.string().trim().email("Correo electrónico inválido").max(160),
  notes: z.string().trim().max(500).optional(),
});

export type CustomerDetailsInput = z.infer<typeof customerDetailsSchema>;

// Full payload validated SERVER-SIDE in createOrder (details + cart items).
export const checkoutSchema = customerDetailsSchema.extend({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "El carrito está vacío"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
