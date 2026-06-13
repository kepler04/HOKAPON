import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { STORE_NAME } from "@/lib/constants";
import { Container } from "@/components/shared/container";
import { NewPasswordForm } from "@/features/customer-auth/components/new-password-form";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  description: `Crea una nueva contraseña para tu cuenta en ${STORE_NAME}.`,
  robots: { index: false },
};

export default function NewPasswordPage() {
  return (
    <Container className="flex justify-center py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent font-display text-lg font-extrabold text-accent-foreground">
            H
          </span>
          <span className="font-display text-xl font-extrabold">HOKAPON</span>
        </Link>

        <div className="mb-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/10 text-accent">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold">
            Nueva contraseña
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            Crea una contraseña nueva para tu cuenta.
          </p>
        </div>

        <NewPasswordForm />
      </div>
    </Container>
  );
}
