"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/** Step 2 of recovery: set a new password (needs the recovery session). */
export function NewPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The reset link lands here with a recovery code/token. Establish the
  // temporary recovery session, then allow setting a new password.
  useEffect(() => {
    let cancelled = false;

    // A recovery event fires when Supabase detects the token in the URL.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (
        !cancelled &&
        (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")
      ) {
        setHasSession(true);
        setChecking(false);
      }
    });

    (async () => {
      // PKCE links arrive as ?code=...; exchange it for a session.
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code).catch(() => null);
        window.history.replaceState({}, "", window.location.pathname);
      }
      const { data } = await supabase.auth.getUser();
      if (!cancelled) {
        setHasSession(!!data.user);
        setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    toast.success("Contraseña actualizada");
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1500);
  }

  if (checking) {
    return (
      <div className="grid place-items-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="text-center">
        <h2 className="font-display text-xl font-bold">Enlace inválido o vencido</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          El enlace para restablecer la contraseña no es válido o ya expiró.
          Solicita uno nuevo.
        </p>
        <a
          href="/cuenta/recuperar"
          className="mt-6 inline-block text-sm font-semibold text-accent hover:underline"
        >
          Solicitar nuevo enlace
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mint/15 text-mint">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold">¡Listo!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu contraseña fue actualizada. Te llevamos al inicio…
        </p>
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
        <label htmlFor="new-pass" className="mb-1.5 block text-sm font-medium">
          Nueva contraseña
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="new-pass"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            required
            className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-11 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="confirm-pass" className="mb-1.5 block text-sm font-medium">
          Confirmar contraseña
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="confirm-pass"
            name="confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repite la contraseña"
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
            <Loader2 className="h-5 w-5 animate-spin" /> Guardando…
          </>
        ) : (
          "Guardar nueva contraseña"
        )}
      </button>
    </form>
  );
}
