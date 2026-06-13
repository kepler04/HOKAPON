"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { CartLine } from "./cart-line";

/** Full cart page body: line items + order summary. Client (reads store). */
export function CartView() {
  const [mounted, setMounted] = useState(false);
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());

  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch: render a stable shell until the store hydrates.
  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-3xl bg-secondary/60" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        emoji="🛒"
        title="Tu carrito está vacío"
        description="Agrega productos para empezar tu pedido."
      >
        <Button asChild>
          <Link href="/productos">
            <ShoppingBag className="h-5 w-5" /> Ver productos
          </Link>
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Line items */}
      <div className="divide-y divide-border rounded-3xl border border-border bg-card px-5">
        {items.map((item) => (
          <CartLine key={item.productId} item={item} />
        ))}
      </div>

      {/* Summary */}
      <aside className="h-fit rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-lg font-bold">Resumen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Envío</dt>
            <dd className="text-muted-foreground">A coordinar</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
          <span className="font-semibold">Total</span>
          <span className="font-display text-2xl font-bold">
            {formatPrice(subtotal)}
          </span>
        </div>
        <Button asChild size="lg" className="mt-6 w-full">
          <Link href="/checkout">
            Continuar <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <Link
          href="/productos"
          className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Seguir comprando
        </Link>
      </aside>
    </div>
  );
}
