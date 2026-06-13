import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { CartView } from "@/features/checkout/components/cart-view";

export const metadata: Metadata = {
  title: "Mi carrito",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <Container className="py-10">
      <h1 className="mb-8 text-3xl font-bold sm:text-4xl">Mi carrito</h1>
      <CartView />
    </Container>
  );
}
