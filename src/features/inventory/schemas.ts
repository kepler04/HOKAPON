import { z } from "zod";

/** Validate a manual stock movement (entrada/salida) from the admin form. */
export const stockMovementSchema = z.object({
  product_id: z.string().uuid("Producto inválido"),
  type: z.enum(["entrada", "salida"]),
  quantity: z.coerce
    .number()
    .int("Debe ser un número entero")
    .positive("La cantidad debe ser mayor a 0"),
  reason: z.string().trim().max(300).optional().or(z.literal("")),
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;
