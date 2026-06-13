import { z } from "zod";

/** Product create/update validation (admin forms + server actions). */
export const productSchema = z
  .object({
    name: z.string().trim().min(2, "Nombre requerido").max(160),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]+$/, "Slug inválido (solo minúsculas, números y guiones)")
      .max(160),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    category_id: z.string().uuid().nullable().optional(),
    price: z.coerce.number().min(0, "El precio no puede ser negativo"),
    compare_price: z.coerce.number().min(0).nullable().optional(),
    stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
    sku: z.string().trim().max(60).optional().or(z.literal("")),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
  })
  .refine(
    (d) =>
      d.compare_price == null ||
      d.compare_price === 0 ||
      d.compare_price > d.price,
    {
      message: "El precio tachado debe ser mayor al precio actual",
      path: ["compare_price"],
    },
  );

export type ProductInput = z.infer<typeof productSchema>;
