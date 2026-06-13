import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { STORE_NAME } from "@/lib/constants";
import { Container } from "@/components/shared/container";
import { ResetRequestForm } from "@/features/customer-auth/components/reset-request-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description: `Restablece la contraseña de tu cuenta en ${STORE_NAME}.`,
};

export default function RecoverPage() {
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
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold">
            Recuperar contraseña
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            Escribe tu correo y te enviaremos un enlace para crear una nueva
            contraseña.
          </p>
        </div>

        <ResetRequestForm />
      </div>
    </Container>
  );
}
