import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, UserCog } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  requireCustomer,
  getCustomerProfile,
} from "@/features/customer-auth/queries";
import { Container } from "@/components/shared/container";
import { ProfileForm } from "@/features/customer-auth/components/profile-form";

export const metadata: Metadata = {
  title: "Mi perfil",
  robots: { index: false },
};

export default async function ProfilePage() {
  const session = await requireCustomer("/cuenta?next=/cuenta/perfil");
  const profile = await getCustomerProfile();

  // Google accounts authenticate via OAuth and have no password to change.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const provider = user?.app_metadata?.provider ?? "email";
  const canChangePassword = provider === "email";

  return (
    <Container className="max-w-2xl py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Inicio
      </Link>

      <div className="mt-4 mb-8 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
          <UserCog className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-extrabold">Mi perfil</h1>
          <p className="text-sm text-muted-foreground">
            Administra tus datos y tu contraseña.
          </p>
        </div>
      </div>

      <ProfileForm
        email={session.email}
        profile={profile}
        canChangePassword={canChangePassword}
      />
    </Container>
  );
}
