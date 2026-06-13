"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/features/checkout/types";

interface AddToCartButtonProps {
  item: Omit<CartItem, "quantity">;
  quantity?: number;
  variant?: "icon" | "full";
  className?: string;
}

/** Adds a product to the cart with a brief confirmation state + toast. */
export function AddToCartButton({
  item,
  quantity = 1,
  variant = "full",
  className,
}: AddToCartButtonProps) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const soldOut = item.stock <= 0;

  function handleAdd() {
    if (soldOut) return;
    addItem(item, quantity);
    setAdded(true);
    toast.success(`${item.name} agregado al carrito`);
    setTimeout(() => setAdded(false), 1400);
  }

  if (variant === "icon") {
    return (
      <Button
        size="icon"
        variant="accent"
        onClick={handleAdd}
        disabled={soldOut}
        aria-label={`Agregar ${item.name} al carrito`}
        className={className}
      >
        {added ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={soldOut}
      variant={soldOut ? "soft" : "accent"}
      className={className}
    >
      {soldOut ? (
        "Agotado"
      ) : added ? (
        <>
          <Check className="h-5 w-5" /> Agregado
        </>
      ) : (
        <>
          <Plus className="h-5 w-5" /> Agregar al carrito
        </>
      )}
    </Button>
  );
}
