import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { STORE_NAME } from "@/lib/constants";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Acceso administrador",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span
            className="grid h-10 w-10 place-items-center rounded-2xl bg-accent text-lg"
            aria-hidden
          >
            🧸
          </span>
          <span className="font-display text-2xl font-bold">{STORE_NAME}</span>
        </Link>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="font-display text-xl font-bold">Panel administrativo</h1>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">
            Ingresa con tu cuenta de administrador.
          </p>
          <Suspense fallback={<div className="h-72" />}>
            <LoginForm />
          </Suspense>
        </div>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver a la tienda
        </Link>
      </div>
    </main>
  );
}
