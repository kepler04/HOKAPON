"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  customerSignIn,
  customerSignUp,
} from "@/features/customer-auth/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Tab = "login" | "register";

export function AccountForms() {
  const params = useSearchParams();
  const redirectTo = params.get("next") || "/";
  const [tab, setTab] = useState<Tab>("login");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isLogin = tab === "login";

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const result = await customerSignIn({
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    });
    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.success("Bienvenido de nuevo");
    window.location.assign(redirectTo);
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const result = await customerSignUp({
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    });
    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.success("Cuenta creada");
    window.location.assign(redirectTo);
  }

  async function handleGoogle() {
    setError(null);
    setGoogleBusy(true);
    const supabase = createClient();
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          redirectTo,
        )}`,
      },
    });

    if (googleError) {
      setGoogleBusy(false);
      setError(
        "El inicio con Google no esta disponible aun. Usa tu correo y contrasena.",
      );
    }
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1">
        <button
          type="button"
          onClick={() => {
            setTab("login");
            setError(null);
            setInfo(null);
          }}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors",
            isLogin
              ? "bg-card text-accent shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <LogIn className="h-4 w-4" /> Iniciar sesion
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("register");
            setError(null);
            setInfo(null);
          }}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors",
            !isLogin
              ? "bg-card text-accent shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <UserPlus className="h-4 w-4" /> Registrarme
        </button>
      </div>

      {info && (
        <p className="mb-4 flex items-start gap-2 rounded-2xl bg-mint/10 px-4 py-3 text-sm text-mint">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {info}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <form
        onSubmit={isLogin ? handleLogin : handleRegister}
        className="space-y-4"
        noValidate
      >
        <div>
          <label htmlFor="acc-email" className="mb-1.5 block text-sm font-medium">
            Correo electronico
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="acc-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Ingresa tu correo electronico"
              required
              className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="acc-password"
            className="mb-1.5 block text-sm font-medium"
          >
            Contrasena
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="acc-password"
              name="password"
              type={showPass ? "text" : "password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={isLogin ? "Ingresa tu contrasena" : "Minimo 6 caracteres"}
              required
              className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-11 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="button"
              onClick={() => setShowPass((value) => !value)}
              aria-label={showPass ? "Ocultar contrasena" : "Mostrar contrasena"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPass ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {isLogin && (
          <div className="-mt-1 text-right">
            <Link
              href="/cuenta/recuperar"
              className="text-sm font-medium text-accent hover:underline"
            >
              Olvidaste tu contrasena?
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_hsl(351_84%_49%/0.7)] transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {isLogin ? "Ingresando..." : "Creando cuenta..."}
            </>
          ) : isLogin ? (
            <>
              <LogIn className="h-5 w-5" /> Entrar a mi cuenta
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5" /> Crear cuenta
            </>
          )}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          O continua con
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleBusy}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-60"
      >
        {googleBusy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <GoogleIcon className="h-5 w-5" />
        )}
        Continuar con Google
      </button>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Al continuar, aceptas nuestros{" "}
        <a
          href="/ayuda#terminos"
          className="font-semibold text-accent hover:underline"
        >
          Terminos y Condiciones
        </a>
      </p>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
