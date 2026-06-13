"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";

/**
 * Cart icon with a live item-count badge.
 * Guards against hydration mismatch: the count only renders after mount,
 * since the cart is hydrated from localStorage on the client.
 */
export function CartButton() {
  const [mounted, setMounted] = useState(false);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/carrito"
      aria-label="Ver carrito"
      className="relative grid h-11 w-11 place-items-center rounded-full bg-secondary transition-colors hover:bg-muted"
    >
      <ShoppingBag className="h-5 w-5" />
      {mounted && count > 0 && (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
