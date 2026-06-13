import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nombre requerido").max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug inválido (solo minúsculas, números y guiones)")
    .max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;
