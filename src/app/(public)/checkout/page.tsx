import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCustomerProfile } from "@/features/customer-auth/queries";
import { Container } from "@/components/shared/container";
import { CheckoutGate } from "@/features/checkout/components/checkout-gate";
import { CheckoutSummary } from "@/features/checkout/components/checkout-summary";

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loggedIn = !!user;
  let prefill;
  if (user) {
    const profile = await getCustomerProfile();
    prefill = {
      customer_name:
        profile?.full_name ??
        (user.user_metadata?.full_name as string) ??
        (user.user_metadata?.name as string) ??
        "",
      customer_phone: profile?.phone ?? "",
      customer_email: user.email ?? "",
    };
  }

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
          <CheckoutGate loggedIn={loggedIn} prefill={prefill} />
        </div>
        <CheckoutSummary />
      </div>
    </Container>
  );
}
