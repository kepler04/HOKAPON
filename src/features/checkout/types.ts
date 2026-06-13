/** A single line of the client-side cart (persisted in localStorage). */
export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  stock: number;
}

/** Result returned by the createOrder server action. */
export type CreateOrderResult =
  | { ok: true; orderNumber: string; orderId: string }
  | { ok: false; error: string };
