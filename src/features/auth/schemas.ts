import { z } from "zod";

/** Admin login form validation (username + password). */
export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Ingresa tu usuario")
    .max(40)
    .regex(/^[a-zA-Z0-9._-]+$/, "Usuario inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
