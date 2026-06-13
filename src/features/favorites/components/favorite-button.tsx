"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, X } from "lucide-react";
import { toast } from "sonner";
import { toggleFavorite } from "@/features/favorites/actions";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  initialFavorited?: boolean;
  /** Visual style: small icon (cards) or labelled button (product page). */
  variant?: "icon" | "button";
  className?: string;
}

/**
 * Heart toggle. Guests get a modal inviting them to sign in / register;
 * logged-in users save/remove the product from their wishlist.
 */
export function FavoriteButton({
  productId,
  initialFavorited = false,
  variant = "icon",
  className,
}: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const prev = favorited;
    setFavorited(!prev); // optimistic
    const r = await toggleFavorite(productId);
    setBusy(false);

    if (!r.ok) {
      setFavorited(prev); // revert
      if (r.reason === "unauthenticated") {
        setShowAuth(true);
      } else {
        toast.error("No se pudo guardar. Intenta de nuevo.");
      }
      return;
    }
    setFavorited(r.favorited);
    toast.success(
      r.favorited ? "Agregado a tus favoritos ❤️" : "Quitado de favoritos",
    );
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={onClick}
          aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-pressed={favorited}
          className={cn(
            "grid h-10 w-10 place-items-center rounded-full border border-border bg-card/90 backdrop-blur transition-colors hover:border-accent",
            favorited ? "text-accent" : "text-muted-foreground hover:text-accent",
            className,
          )}
        >
          <Heart className={cn("h-5 w-5", favorited && "fill-current")} />
        </button>
      ) : (
        <button
          onClick={onClick}
          aria-pressed={favorited}
          className={cn(
            "inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 px-5 text-sm font-semibold transition-colors",
            favorited
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-foreground hover:border-accent hover:text-accent",
            className,
          )}
        >
          <Heart className={cn("h-5 w-5", favorited && "fill-current")} />
          {favorited ? "Guardado" : "Guardar"}
        </button>
      )}

      {/* Guest prompt */}
      {showAuth && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowAuth(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuth(false)}
              aria-label="Cerrar"
              className="ml-auto block text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/10 text-accent">
              <Heart className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">
              Guarda tus favoritos
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Inicia sesión o crea una cuenta para guardar productos en tu lista
              de deseos y comprarlos cuando quieras.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/cuenta?next=/favoritos"
                className="flex h-11 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_hsl(351_84%_49%/0.7)] transition-all hover:brightness-105"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/cuenta?next=/favoritos"
                className="flex h-11 items-center justify-center rounded-xl border-2 border-border text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
              >
                Crear una cuenta
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
