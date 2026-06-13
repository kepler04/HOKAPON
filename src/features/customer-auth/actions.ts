"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  customerLoginSchema,
  customerRegisterSchema,
  customerProfileSchema,
  changePasswordSchema,
  verifySignupOtpSchema,
  type CustomerLoginInput,
  type CustomerRegisterInput,
  type CustomerProfileInput,
  type ChangePasswordInput,
  type VerifySignupOtpInput,
} from "./schemas";

export type AuthResult =
  | { ok: true; needsConfirmation?: boolean }
  | { ok: false; error: string };

/**
 * Customer sign-out. Runs on the server so the auth cookies (httpOnly) are
 * actually cleared — a browser-only signOut() leaves the SSR session alive and
 * the header keeps showing the user as logged in.
 */
export async function customerSignOut(): Promise<{ ok: true }> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { ok: true };
}

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
    if (/rate limit|too many|over_email_send_rate/i.test(error.message)) {
      return {
        ok: false,
        error:
          "Se alcanzó el límite de correos por ahora. Espera unos minutos e inténtalo de nuevo.",
      };
    }
    return { ok: false, error: error.message };
  }

  // If confirmation is required, Supabase returns a user but no active session.
  const needsConfirmation = !data.session;
  return { ok: true, needsConfirmation };
}

/**
 * Verify the 6-digit signup code that Supabase emailed. On success this
 * establishes the session (cookies) so the user is logged in immediately —
 * no link to click. Requires the Supabase "Confirm signup" email template to
 * include the {{ .Token }} code (see docs/otp-signup.md).
 */
export async function verifySignupOtp(
  input: VerifySignupOtpInput,
): Promise<AuthResult> {
  const parsed = verifySignupOtpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "signup",
  });

  if (error) {
    if (/expired/i.test(error.message)) {
      return { ok: false, error: "El código expiró. Pide uno nuevo." };
    }
    return { ok: false, error: "Código incorrecto. Revísalo e intenta de nuevo." };
  }

  return { ok: true };
}

/** Re-send the signup confirmation code to the user's email. */
export async function resendSignupOtp(email: string): Promise<AuthResult> {
  const parsed = customerRegisterSchema.shape.email.safeParse(email);
  if (!parsed.success) {
    return { ok: false, error: "Correo inválido." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
  });
  if (error) {
    if (/rate limit|too many/i.test(error.message)) {
      return { ok: false, error: "Espera un momento antes de pedir otro código." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
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

/** Verify the current customer's password without changing anything. */
export async function verifyCurrentPassword(
  currentPassword: string,
): Promise<AuthResult> {
  if (!currentPassword) {
    return { ok: false, error: "Ingresa tu contraseña actual." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { ok: false, error: "Inicia sesión para continuar." };
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (error) return { ok: false, error: "La contraseña actual es incorrecta." };
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
