import { z } from "zod";

/** Roles a user can have. "customer" = no admin access. */
export const userRoleSchema = z.enum(["customer", "staff", "admin"]);
export type ManageableRole = z.infer<typeof userRoleSchema>;

/** Admin creates a user by hand (email + password + optional name/role). */
export const createUserSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  full_name: z.string().trim().max(120).optional().or(z.literal("")),
  role: userRoleSchema.default("customer"),
});

/** Change a user's role (grant/revoke admin access). */
export const setRoleSchema = z.object({
  userId: z.string().uuid(),
  role: userRoleSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type SetRoleInput = z.infer<typeof setRoleSchema>;
