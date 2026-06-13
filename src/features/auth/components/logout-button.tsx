"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logout } from "@/features/auth/actions";

/** Logout button with a confirmation step (avoids closing by accident). */
export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Salir</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busy) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
              <LogOut className="h-6 w-6" />
            </div>
            <h2 className="text-center font-display text-lg font-bold">
              ¿Cerrar sesión?
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Tendrás que volver a iniciar sesión para entrar al panel.
            </p>
            <form
              action={logout}
              onSubmit={() => setBusy(true)}
              className="mt-5 flex gap-2"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="h-11 flex-1 rounded-xl border border-border text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-all hover:brightness-105 disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Salir
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
