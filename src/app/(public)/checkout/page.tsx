import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Container } from "@/components/shared/container";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { CheckoutSummary } from "@/features/checkout/components/checkout-summary";

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <Container className="py-10">
      <Link
        href="/carrito"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver al carrito
      </Link>

      <h1 className="mb-8 text-3xl font-bold sm:text-4xl">Finalizar compra</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="mb-6 font-display text-lg font-bold">Tus datos</h2>
          <CheckoutForm />
        </div>
        <CheckoutSummary />
      </div>
    </Container>
  );
}
