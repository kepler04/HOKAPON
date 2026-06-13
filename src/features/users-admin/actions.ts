"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/features/auth/queries";
import { recordAudit } from "@/features/audit/log";
import {
  createUserSchema,
  setRoleSchema,
  type CreateUserInput,
  type SetRoleInput,
} from "./schemas";

export type UsersActionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Guard: every mutating action here requires an ADMIN actor (not just staff).
 * Managing accounts — granting admin, deleting, banning — is high-privilege.
 */
async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: "No autorizado." };
  if (session.role !== "admin") {
    return { ok: false, error: "Solo un administrador puede gestionar usuarios." };
  }
  return { ok: true, userId: session.userId };
}

/** Create a user by hand (email + password). Auto-confirmed (no email sent). */
export async function adminCreateUser(
  input: CreateUserInput,
): Promise<UsersActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { email, password, full_name, role } = parsed.data;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // created by an admin → no confirmation email needed
    user_metadata: full_name ? { full_name } : undefined,
  });
  if (error) {
    if (/already.*registered|already.*exists|duplicate/i.test(error.message)) {
      return { ok: false, error: "Ya existe una cuenta con ese correo." };
    }
    return { ok: false, error: error.message };
  }

  const newId = data.user?.id;
  if (newId && (role === "admin" || role === "staff")) {
    const { error: pErr } = await admin
      .from("profiles")
      .upsert({ id: newId, role, full_name: full_name || null });
    if (pErr) return { ok: false, error: pErr.message };
  }
  if (newId && full_name) {
    await admin
      .from("customer_profiles")
      .upsert({ id: newId, full_name, updated_at: new Date().toISOString() });
  }

  await recordAudit({
    action: "user.create",
    entity: "user",
    entityId: newId,
    summary: `Creó la cuenta ${email}${role !== "customer" ? ` (${role})` : ""}`,
  });
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

/** Grant or revoke admin/staff access (role = customer removes the profile). */
export async function adminSetUserRole(
  input: SetRoleInput,
): Promise<UsersActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = setRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }
  const { userId, role } = parsed.data;

  // Don't let an admin strip their own admin access (lockout protection).
  if (userId === guard.userId && role !== "admin") {
    return { ok: false, error: "No puedes quitarte tu propio acceso de administrador." };
  }

  const admin = createAdminClient();
  if (role === "customer") {
    const { error } = await admin.from("profiles").delete().eq("id", userId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin
      .from("profiles")
      .upsert({ id: userId, role });
    if (error) return { ok: false, error: error.message };
  }

  await recordAudit({
    action: "user.role",
    entity: "user",
    entityId: userId,
    summary:
      role === "customer"
        ? "Retiró el acceso de administrador"
        : `Asignó el rol ${role}`,
  });
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

/** Block (ban) or unblock a user. Blocked users cannot sign in. */
export async function adminSetUserBlocked(
  userId: string,
  blocked: boolean,
): Promise<UsersActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  if (userId === guard.userId) {
    return { ok: false, error: "No puedes bloquear tu propia cuenta." };
  }

  const admin = createAdminClient();
  // ban_duration: a long span to block, "none" to lift the ban.
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: blocked ? "876000h" : "none", // ~100 years
  });
  if (error) return { ok: false, error: error.message };

  await recordAudit({
    action: blocked ? "user.block" : "user.unblock",
    entity: "user",
    entityId: userId,
    summary: blocked ? "Bloqueó al usuario" : "Desbloqueó al usuario",
  });
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

/** Permanently delete a user account. Irreversible. */
export async function adminDeleteUser(
  userId: string,
): Promise<UsersActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  if (userId === guard.userId) {
    return { ok: false, error: "No puedes eliminar tu propia cuenta." };
  }

  const admin = createAdminClient();
  // Capture the email before deletion for a readable audit entry.
  const { data: target } = await admin.auth.admin.getUserById(userId);
  const targetEmail = target?.user?.email ?? userId;

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };

  await recordAudit({
    action: "user.delete",
    entity: "user",
    entityId: userId,
    summary: `Eliminó la cuenta ${targetEmail}`,
  });
  revalidatePath("/admin/usuarios");
  return { ok: true };
}
