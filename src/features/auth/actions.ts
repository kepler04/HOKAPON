"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { usernameToEmail } from "@/lib/constants";
import { loginSchema, type LoginInput } from "./schemas";

export type LoginResult = { ok: true } | { ok: false; error: string };

/**
 * Admin login (email/password). Verifies the user has a staff/admin role
 * before granting access. Returns a result; the client navigates on success.
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(parsed.data.username),
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { ok: false, error: "Credenciales incorrectas." };
  }

  // Gate on role — a valid login without a staff role must not get in.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    await supabase.auth.signOut();
    return { ok: false, error: "Tu cuenta no tiene acceso al panel." };
  }

  return { ok: true };
}

/** Sign the admin out and return to /login. */
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
