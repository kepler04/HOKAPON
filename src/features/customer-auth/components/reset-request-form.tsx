"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Step 1 of password recovery: ask for the email and send the reset link. */
export function ResetRequestForm() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    if (!email) return;

    setBusy(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/cuenta/nueva-clave`,
    });
    setBusy(false);
    if (err) {
      setError("No se pudo enviar el correo. Intenta de nuevo.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mint/15 text-mint">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold">Revisa tu correo</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Si existe una cuenta con ese correo, te enviamos un enlace para
          restablecer tu contraseña. Revisa también tu carpeta de spam.
        </p>
        <Link
          href="/cuenta"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Ingresa tu correo electrónico"
            required
            className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_hsl(351_84%_49%/0.7)] transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Enviando…
          </>
        ) : (
          "Enviar enlace de recuperación"
        )}
      </button>

      <Link
        href="/cuenta"
        className="flex items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesión
      </Link>
    </form>
  );
}
