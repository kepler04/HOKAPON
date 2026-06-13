"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  customerLoginSchema,
  customerRegisterSchema,
  customerProfileSchema,
  changePasswordSchema,
  type CustomerLoginInput,
  type CustomerRegisterInput,
  type CustomerProfileInput,
  type ChangePasswordInput,
} from "./schemas";

export type AuthResult =
  | { ok: true; needsConfirmation?: boolean }
  | { ok: false; error: string };

/**
 * Customer sign-in (email + password). A successful login establishes a normal
 * (non-staff) Supabase session; it does NOT grant admin access (the /admin
 * guard checks the profile role separately).
 */
export async function customerSignIn(
  input: CustomerLoginInput,
): Promise<AuthResult> {
  const parsed = customerLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Most common case: wrong credentials or unconfirmed email.
    if (/email not confirmed/i.test(error.message)) {
      return {
        ok: false,
        error: "Debes confirmar tu correo antes de iniciar sesión.",
      };
    }
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }

  return { ok: true };
}

/**
 * Customer registration (name + email + password). Stores the name in user
 * metadata. If the project requires email confirmation, no session is created
 * yet — we signal that back so the UI can tell the user to check their inbox.
 */
export async function customerSignUp(
  input: CustomerRegisterInput,
): Promise<AuthResult> {
  const parsed = customerRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (/already registered|already exists/i.test(error.message)) {
      return {
        ok: false,
        error: "Ya existe una cuenta con ese correo. Inicia sesión.",
      };
    }
    return { ok: false, error: error.message };
  }

  // If confirmation is required, Supabase returns a user but no active session.
  const needsConfirmation = !data.session;
  return { ok: true, needsConfirmation };
}

/** Save the current customer's profile (upsert) + sync display name to Auth. */
export async function saveCustomerProfile(
  input: CustomerProfileInput,
): Promise<AuthResult> {
  const parsed = customerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Inicia sesión para continuar." };

  const p = parsed.data;
  const { error } = await supabase.from("customer_profiles").upsert({
    id: user.id,
    full_name: p.full_name || null,
    phone: p.phone || null,
    address: p.address || null,
    district: p.district || null,
    city: p.city || null,
    reference: p.reference || null,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };

  // Keep the Auth display name in sync (used in the header greeting).
  if (p.full_name) {
    await supabase.auth.updateUser({ data: { full_name: p.full_name } });
  }

  revalidatePath("/cuenta/perfil");
  return { ok: true };
}

/** Change the current customer's password. */
export async function changeCustomerPassword(
  input: ChangePasswordInput,
): Promise<AuthResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Inicia sesión para continuar." };
  if (!user.email) {
    return { ok: false, error: "Tu cuenta no tiene contraseña (inició con Google)." };
  }

  // Verify the CURRENT password by re-authenticating before changing it.
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current_password,
  });
  if (verifyErr) {
    return { ok: false, error: "La contraseña actual es incorrecta." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
