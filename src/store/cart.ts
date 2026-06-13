"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/features/checkout/types";

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  // Derived helpers
  totalItems: () => number;
  subtotal: () => number;
}

/**
 * Client-side cart, persisted to localStorage (key: "yienkid-cart").
 *
 * Prices here are for display only. The authoritative total is recomputed
 * server-side in the createOrder action — never trust the cart for pricing.
 */
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId,
          );
          if (existing) {
            const next = Math.min(existing.quantity + quantity, item.stock);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: next } : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, item.stock) },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        Number(
          get()
            .items.reduce((sum, i) => sum + i.price * i.quantity, 0)
            .toFixed(2),
        ),
    }),
    { name: "yienkid-cart" },
  ),
);
