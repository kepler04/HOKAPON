import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { STORE_NAME } from "@/lib/constants";
import { AccountForms } from "@/features/customer-auth/components/account-forms";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: `Inicia sesión o crea tu cuenta en ${STORE_NAME}.`,
};

export default function AccountPage() {
  return (
    <div className="flex justify-center bg-background px-4 py-10 sm:px-6">
      {/* Centered card: image + form side by side, equal height. */}
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-2">
        {/* Left: brand image (same height as the form via items-stretch grid) */}
        <div className="relative hidden bg-[#0a0e1a] lg:block">
          <Image
            src="/auth-side.png"
            alt="HOKAPON — Tecnología sin límites"
            fill
            sizes="(max-width:1024px) 0px, 512px"
            className="object-cover"
            priority
          />
        </div>

        {/* Right: forms */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-sm">
            <div className="mb-7 text-center">
              {/* Mobile logo (image panel is hidden on mobile) */}
              <Link
                href="/"
                className="mb-5 inline-flex items-center gap-2 lg:hidden"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent font-display text-lg font-extrabold text-accent-foreground">
                  H
                </span>
                <span className="font-display text-xl font-extrabold">
                  HOKAPON
                </span>
              </Link>
              <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
                Bienvenido a <span className="text-accent">HOKAPON</span>
              </h1>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                Inicia sesión o crea tu cuenta para una experiencia de compra más
                rápida y segura.
              </p>
            </div>

            <Suspense fallback={<div className="h-96" />}>
              <AccountForms />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
