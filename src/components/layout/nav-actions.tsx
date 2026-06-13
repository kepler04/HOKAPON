"use client";

import Link from "next/link";
import { Heart, ShoppingCart, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";

/** Right-side cluster: cart (live badge), favorites (decorative),
 *  country selector and a welcome/user zone — marketplace style. */
export function NavActions() {
  const [mounted, setMounted] = useState(false);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      {/* Cart */}
      <Link
        href="/carrito"
        aria-label="Ver carrito"
        className="relative grid h-10 w-10 place-items-center text-foreground transition-colors hover:text-accent"
      >
        <ShoppingCart className="h-6 w-6" />
        {mounted && count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
            {count}
          </span>
        )}
      </Link>

      {/* Favorites (decorative for the demo) */}
      <button
        aria-label="Favoritos"
        className="relative hidden h-10 w-10 place-items-center text-foreground transition-colors hover:text-accent sm:grid"
      >
        <Heart className="h-6 w-6" />
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
          0
        </span>
      </button>

      {/* Country selector (decorative) */}
      <button className="hidden items-center gap-1.5 text-sm font-semibold lg:flex">
        <span aria-hidden>🇵🇪</span>
        Perú (PEN)
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* User zone (decorative welcome) */}
      <div className="hidden items-center gap-2 lg:flex">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-sm font-bold text-foreground">
          H
        </span>
        <div className="leading-tight">
          <p className="text-xs text-muted-foreground">¡Bienvenido!</p>
          <p className="text-sm font-bold">Inicia sesión</p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
