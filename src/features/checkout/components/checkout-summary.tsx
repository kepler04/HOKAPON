"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";

/** Read-only order summary shown beside the checkout form. */
export function CheckoutSummary() {
  const [mounted, setMounted] = useState(false);
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-3xl bg-secondary/60" />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Tu carrito está vacío.{" "}
        <Link href="/productos" className="font-semibold text-accent">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="h-fit rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-28">
      <h2 className="font-display text-lg font-bold">Tu pedido</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{item.name}</span>{" "}
              × {item.quantity}
            </span>
            <span className="shrink-0 font-medium">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <span className="font-semibold">Total</span>
        <span className="font-display text-2xl font-bold">
          {formatPrice(subtotal)}
        </span>
      </div>
    </div>
  );
}
