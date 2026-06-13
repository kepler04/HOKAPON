"use client";

import Link from "next/link";
import { useState } from "react";
import { LogIn, UserPlus, UserRound, ArrowRight } from "lucide-react";
import {
  CheckoutForm,
  type CheckoutPrefill,
} from "@/features/checkout/components/checkout-form";

interface Props {
  /** True when a customer is already logged in. */
  loggedIn: boolean;
  /** Prefill values from the logged-in customer's profile/account. */
  prefill?: CheckoutPrefill;
}

/**
 * Before the details form, an unauthenticated buyer chooses to sign in / create
 * an account, or continue as a guest. A logged-in customer skips straight to
 * the (prefilled) form.
 */
export function CheckoutGate({ loggedIn, prefill }: Props) {
  const [asGuest, setAsGuest] = useState(false);

  if (loggedIn || asGuest) {
    return <CheckoutForm prefill={prefill} />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-lg font-bold">¿Cómo quieres comprar?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Inicia sesión para una compra más rápida y para ver tu historial, o
          continúa como invitado.
        </p>
      </div>

      {/* Account options */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/cuenta?next=/checkout"
          className="flex items-center gap-3 rounded-2xl border-2 border-accent bg-accent/5 p-4 transition-colors hover:bg-accent/10"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
            <LogIn className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold">Iniciar sesión</p>
            <p className="text-xs text-muted-foreground">Ya tengo cuenta</p>
          </div>
        </Link>

        <Link
          href="/cuenta?next=/checkout"
          className="flex items-center gap-3 rounded-2xl border border-border p-4 transition-colors hover:border-accent hover:bg-accent/5"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold">Crear una cuenta</p>
            <p className="text-xs text-muted-foreground">Es rápido y gratis</p>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          o
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Guest */}
      <button
        type="button"
        onClick={() => setAsGuest(true)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border p-4 text-left transition-colors hover:border-accent hover:bg-accent/5"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
            <UserRound className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold">
              Continuar como invitado
            </span>
            <span className="block text-xs text-muted-foreground">
              Compra sin crear cuenta
            </span>
          </span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-accent" />
      </button>
    </div>
  );
}
