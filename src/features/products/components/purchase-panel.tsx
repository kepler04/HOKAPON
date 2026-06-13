"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { AddToCartButton } from "./add-to-cart-button";
import type { CartItem } from "@/features/checkout/types";

/** Quantity stepper + add-to-cart for the product detail page. */
export function PurchasePanel({
  item,
  maxPerOrder,
}: {
  item: Omit<CartItem, "quantity">;
  /** Per-product purchase cap (null/0 = no special limit). */
  maxPerOrder?: number | null;
}) {
  const [qty, setQty] = useState(1);
  const soldOut = item.stock <= 0;
  // Effective cap: the smaller of available stock and the configured limit.
  const limit = maxPerOrder && maxPerOrder > 0 ? maxPerOrder : Infinity;
  const max = Math.max(Math.min(item.stock, limit), 1);
  const limitReached = !soldOut && maxPerOrder != null && maxPerOrder > 0 && qty >= max;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-12 items-center rounded-full border-2 border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={soldOut || qty <= 1}
            aria-label="Disminuir cantidad"
            className="grid h-full w-12 place-items-center rounded-l-full transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-semibold tabular-nums">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={soldOut || qty >= max}
            aria-label="Aumentar cantidad"
            className="grid h-full w-12 place-items-center rounded-r-full transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <AddToCartButton
          item={item}
          quantity={qty}
          variant="full"
          className="h-12 flex-1"
        />
      </div>

      {limitReached && (
        <p className="mt-2 text-xs text-muted-foreground">
          Máximo {max} {max === 1 ? "unidad" : "unidades"} por pedido.
        </p>
      )}
    </div>
  );
}
