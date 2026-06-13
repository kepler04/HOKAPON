"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Loader2,
  LogIn,
  UserPlus,
  CheckCircle2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  customerSignIn,
  customerSignUp,
  verifySignupOtp,
  resendSignupOtp,
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
  // OTP step: when a registration needs email confirmation, we show a 6-digit
  // code screen instead of asking the user to click an email link.
  const [otpEmail, setOtpEmail] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const r = await customerSignIn({
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    });
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    toast.success("¡Bienvenido de nuevo!");
    // Full reload so the header (and SSR) come back already authenticated,
    // avoiding the brief "Inicia sesión" flash.
    window.location.assign(redirectTo);
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const r = await customerSignUp({
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    });
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    if (r.needsConfirmation) {
      // Switch to the 6-digit code screen (Supabase already emailed the code).
      setOtpEmail(String(fd.get("email") ?? "").trim());
      return;
    }
    toast.success("¡Cuenta creada!");
    window.location.assign(redirectTo);
  }

  async function handleGoogle() {
    setError(null);
    setGoogleBusy(true);
    const supabase = createClient();
    const { error: gErr } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          redirectTo,
        )}`,
      },
    });
    if (gErr) {
      setGoogleBusy(false);
      setError(
        "El inicio con Google no está disponible aún. Usa tu correo y contraseña.",
      );
    }
  }

  const isLogin = tab === "login";

  // ── OTP confirmation screen ───────────────────────────────────────────────
  if (otpEmail) {
    return (
      <OtpStep
        email={otpEmail}
        redirectTo={redirectTo}
        onBack={() => {
          setOtpEmail(null);
          setTab("login");
        }}
      />
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1">
        <button
          onClick={() => {
            setTab("login");
            setError(null);
          }}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors",
            isLogin
              ? "bg-card text-accent shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <LogIn className="h-4 w-4" /> Iniciar sesión
        </button>
        <button
          onClick={() => {
            setTab("register");
            setError(null);
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
        {/* Email */}
        <div>
          <label htmlFor="acc-email" className="mb-1.5 block text-sm font-medium">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="acc-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Ingresa tu correo electrónico"
              required
              className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="acc-password"
            className="mb-1.5 block text-sm font-medium"
          >
            Contraseña
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="acc-password"
              name="password"
              type={showPass ? "text" : "password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={
                isLogin ? "Ingresa tu contraseña" : "Mínimo 6 caracteres"
              }
              required
              className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-11 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
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

        {/* Forgot password (login only) */}
        {isLogin && (
          <div className="-mt-1 text-right">
            <Link
              href="/cuenta/recuperar"
              className="text-sm font-medium text-accent hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={busy}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_hsl(351_84%_49%/0.7)] transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />{" "}
              {isLogin ? "Ingresando…" : "Creando cuenta…"}
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

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          O continúa con
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Google */}
      <button
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

      {/* Terms */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Al continuar, aceptas nuestros{" "}
        <a href="/ayuda#terminos" className="font-semibold text-accent hover:underline">
          Términos y Condiciones
        </a>
      </p>
    </div>
  );
}

/** Step shown after registration: enter the 6-digit code Supabase emailed. */
function OtpStep({
  email,
  redirectTo,
  onBack,
}: {
  email: string;
  redirectTo: string;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const r = await verifySignupOtp({ email, token: code });
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    toast.success("¡Cuenta confirmada!");
    window.location.assign(redirectTo);
  }

  async function handleResend() {
    setError(null);
    setResending(true);
    const r = await resendSignupOtp(email);
    setResending(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    toast.success("Te enviamos un código nuevo.");
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
          <ShieldCheck className="h-7 w-7" />
        </span>
        <h2 className="font-display text-xl font-extrabold">Verifica tu correo</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
          Te enviamos un código de 6 dígitos a{" "}
          <span className="font-semibold text-foreground">{email}</span>.
          Escríbelo aquí para activar tu cuenta.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label htmlFor="otp-code" className="mb-1.5 block text-sm font-medium">
            Código de verificación
          </label>
          <input
            id="otp-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            autoFocus
            className="h-14 w-full rounded-xl border border-border bg-background text-center font-display text-2xl font-bold tracking-[0.5em] outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <button
          type="submit"
          disabled={busy || code.length !== 6}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_hsl(351_84%_49%/0.7)] transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Verificando…
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" /> Confirmar y entrar
            </>
          )}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-semibold text-accent hover:underline disabled:opacity-60"
        >
          {resending ? "Enviando…" : "Reenviar código"}
        </button>
      </div>
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
