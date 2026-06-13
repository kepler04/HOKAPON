import { z } from "zod";

/** Customer sign-in (email + password). */
export const customerLoginSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

/** Customer registration (email + password). */
export const customerRegisterSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;
export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;

/** Editable customer profile. */
export const customerProfileSchema = z.object({
  full_name: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  district: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  reference: z.string().trim().max(200).optional().or(z.literal("")),
});

/** Change password (logged-in customer): verify current, then set new. */
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Ingresa tu contraseña actual"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
