"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  changePasswordSchema,
  customerLoginSchema,
  customerProfileSchema,
  customerRegisterSchema,
  type ChangePasswordInput,
  type CustomerLoginInput,
  type CustomerProfileInput,
  type CustomerRegisterInput,
} from "./schemas";

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string };

/** Customer sign-out. Clears the SSR auth cookies on the server. */
export async function customerSignOut(): Promise<{ ok: true }> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Customer sign-in (email + password). A successful login establishes a normal
 * customer Supabase session; it does not grant admin access.
 */
export async function customerSignIn(
  input: CustomerLoginInput,
): Promise<AuthResult> {
  const parsed = customerLoginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (/email not confirmed/i.test(error.message)) {
      return {
        ok: false,
        error:
          "Tu cuenta aun figura sin confirmar. Escribenos por WhatsApp para ayudarte.",
      };
    }
    return { ok: false, error: "Correo o contrasena incorrectos." };
  }

  return { ok: true };
}

/**
 * Customer registration without email verification.
 *
 * The server creates the user with `email_confirm: true` and then signs them in.
 * This avoids confirmation-email failures while the store has no verified
 * sending domain.
 */
export async function customerSignUp(
  input: CustomerRegisterInput,
): Promise<AuthResult> {
  const parsed = customerRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (error) {
    if (/already registered|already exists|duplicate/i.test(error.message)) {
      return {
        ok: false,
        error: "Ya existe una cuenta con ese correo. Inicia sesion.",
      };
    }
    if (/rate limit|too many/i.test(error.message)) {
      return {
        ok: false,
        error:
          "Se alcanzo el limite de registros por ahora. Espera unos minutos e intentalo de nuevo.",
      };
    }
    return { ok: false, error: error.message };
  }

  const supabase = await createClient();
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (loginError) {
    return {
      ok: false,
      error:
        "La cuenta fue creada, pero no se pudo iniciar sesion automaticamente.",
    };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Save the current customer's profile (upsert) + sync display name to Auth. */
export async function saveCustomerProfile(
  input: CustomerProfileInput,
): Promise<AuthResult> {
  const parsed = customerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Inicia sesion para continuar." };

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

  if (p.full_name) {
    await supabase.auth.updateUser({ data: { full_name: p.full_name } });
  }

  revalidatePath("/cuenta/perfil");
  return { ok: true };
}

/** Verify the current customer's password without changing anything. */
export async function verifyCurrentPassword(
  currentPassword: string,
): Promise<AuthResult> {
  if (!currentPassword) {
    return { ok: false, error: "Ingresa tu contrasena actual." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { ok: false, error: "Inicia sesion para continuar." };
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (error) return { ok: false, error: "La contrasena actual es incorrecta." };
  return { ok: true };
}

/** Change the current customer's password. */
export async function changeCustomerPassword(
  input: ChangePasswordInput,
): Promise<AuthResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Inicia sesion para continuar." };
  if (!user.email) {
    return {
      ok: false,
      error: "Tu cuenta no tiene contrasena (inicio con Google).",
    };
  }

  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current_password,
  });
  if (verifyErr) {
    return { ok: false, error: "La contrasena actual es incorrecta." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
