import { z } from "zod";

/** Validate an admin-configured payment method. */
export const paymentMethodSchema = z
  .object({
    kind: z.enum(["wallet", "bank"]),
    label: z.string().trim().min(1, "Nombre requerido").max(60),
    number: z.string().trim().max(60).optional().or(z.literal("")),
    holder: z.string().trim().max(120).optional().or(z.literal("")),
    bank_name: z.string().trim().max(60).optional().or(z.literal("")),
    account: z.string().trim().max(60).optional().or(z.literal("")),
    cci: z.string().trim().max(60).optional().or(z.literal("")),
    sort_order: z.coerce.number().int().min(0).default(0),
    is_active: z.boolean().default(true),
  })
  .refine(
    (d) => (d.kind === "wallet" ? !!d.number : !!d.account || !!d.bank_name),
    {
      message: "Completa los datos del método (número o cuenta).",
      path: ["number"],
    },
  );

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
