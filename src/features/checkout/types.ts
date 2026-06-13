/** A single line of the client-side cart (persisted in localStorage). */
export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  stock: number;
  /** Per-order purchase limit (null/0 = only stock caps it). */
  maxPerOrder?: number | null;
}

/** Result returned by the createOrder server action. */
export type CreateOrderResult =
  | { ok: true; orderNumber: string; orderId: string }
  | { ok: false; error: string };
