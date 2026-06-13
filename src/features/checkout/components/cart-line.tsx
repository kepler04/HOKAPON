"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart, cartItemCap } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/features/checkout/types";

/** A single editable row in the cart. */
export function CartLine({ item }: { item: CartItem }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);

  const cap = cartItemCap(item);
  const atLimit = item.quantity >= cap;
  // True when the limit comes from the per-order cap (not just low stock).
  const limitedByOrder =
    !!item.maxPerOrder && item.maxPerOrder > 0 && cap === item.maxPerOrder;

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={`/productos/${item.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-secondary"
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-3xl">
            🛍️
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/productos/${item.slug}`}
            className="font-semibold leading-snug hover:text-accent"
          >
            {item.name}
          </Link>
          <button
            onClick={() => removeItem(item.productId)}
            aria-label={`Quitar ${item.name}`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {formatPrice(item.price)} c/u
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex h-9 items-center rounded-full border border-border">
            <button
              onClick={() => setQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Disminuir"
              className="grid h-full w-9 place-items-center rounded-l-full hover:bg-secondary disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => setQuantity(item.productId, item.quantity + 1)}
              disabled={atLimit}
              aria-label="Aumentar"
              className="grid h-full w-9 place-items-center rounded-r-full hover:bg-secondary disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="font-display text-lg font-semibold">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>

        {atLimit && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {limitedByOrder
              ? `Máximo ${cap} por pedido`
              : `Solo quedan ${cap} en stock`}
          </p>
        )}
      </div>
    </div>
  );
}
