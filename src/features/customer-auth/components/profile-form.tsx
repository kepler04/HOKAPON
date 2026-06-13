"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
  saveCustomerProfile,
  changeCustomerPassword,
} from "@/features/customer-auth/actions";
import type { CustomerProfile } from "@/types/database.types";

interface Props {
  email: string | null;
  profile: CustomerProfile | null;
  /** False for Google accounts (no password to change). */
  canChangePassword: boolean;
}

export function ProfileForm({ email, profile, canChangePassword }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const r = await saveCustomerProfile({
      full_name: String(fd.get("full_name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address: String(fd.get("address") ?? ""),
      district: String(fd.get("district") ?? ""),
      city: String(fd.get("city") ?? ""),
      reference: String(fd.get("reference") ?? ""),
    });
    setBusy(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Perfil guardado");
    router.refresh();
  }

  async function onChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwMsg(null);
    const fd = new FormData(e.currentTarget);
    const currentPassword = String(fd.get("current_password") ?? "");
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password !== confirm) {
      setPwMsg("Las contraseñas no coinciden.");
      return;
    }
    setPwBusy(true);
    const r = await changeCustomerPassword({
      current_password: currentPassword,
      password,
    });
    setPwBusy(false);
    if (!r.ok) {
      setPwMsg(r.error);
      return;
    }
    toast.success("Contraseña actualizada");
    (e.target as HTMLFormElement).reset();
  }

  const label = "mb-1.5 block text-sm font-medium";
  const input =
    "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20";

  return (
    <div className="space-y-6">
      {/* Profile data */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Mis datos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Estos datos se usan para coordinar tus pedidos y envíos.
        </p>

        <form onSubmit={onSave} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-name" className={label}>
                Nombre
              </label>
              <input
                id="pf-name"
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                placeholder="Tu nombre"
                className={input}
              />
            </div>
            <div>
              <label htmlFor="pf-phone" className={label}>
                Teléfono / WhatsApp
              </label>
              <input
                id="pf-phone"
                name="phone"
                defaultValue={profile?.phone ?? ""}
                placeholder="999 999 999"
                className={input}
              />
            </div>
          </div>

          <div>
            <label className={label}>Correo</label>
            <input
              value={email ?? ""}
              disabled
              className={`${input} cursor-not-allowed bg-secondary/50 text-muted-foreground`}
            />
          </div>

          <div>
            <label htmlFor="pf-address" className={label}>
              Dirección de envío
            </label>
            <input
              id="pf-address"
              name="address"
              defaultValue={profile?.address ?? ""}
              placeholder="Av. / Calle y número"
              className={input}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-district" className={label}>
                Distrito
              </label>
              <input
                id="pf-district"
                name="district"
                defaultValue={profile?.district ?? ""}
                className={input}
              />
            </div>
            <div>
              <label htmlFor="pf-city" className={label}>
                Ciudad
              </label>
              <input
                id="pf-city"
                name="city"
                defaultValue={profile?.city ?? ""}
                className={input}
              />
            </div>
          </div>

          <div>
            <label htmlFor="pf-ref" className={label}>
              Referencia <span className="text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="pf-ref"
              name="reference"
              defaultValue={profile?.reference ?? ""}
              placeholder="Ej. frente al parque, casa azul…"
              className={input}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_hsl(351_84%_49%/0.7)] transition-all hover:brightness-105 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Guardando…
              </>
            ) : (
              <>
                <Save className="h-5 w-5" /> Guardar cambios
              </>
            )}
          </button>
        </form>
      </section>

      {/* Password */}
      {canChangePassword && (
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Cambiar contraseña</h2>
          {pwMsg && (
            <p className="mt-3 rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {pwMsg}
            </p>
          )}
          <form onSubmit={onChangePassword} className="mt-4 space-y-4">
            <div>
              <label htmlFor="pw-current" className={label}>
                Contraseña actual
              </label>
              <input
                id="pw-current"
                name="current_password"
                type="password"
                autoComplete="current-password"
                placeholder="Tu contraseña actual"
                required
                className={input}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pw-new" className={label}>
                  Nueva contraseña
                </label>
                <input
                  id="pw-new"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="pw-confirm" className={label}>
                  Confirmar
                </label>
                <input
                  id="pw-confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repite la contraseña"
                  required
                  className={input}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={pwBusy}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-accent px-6 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {pwBusy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Guardando…
                </>
              ) : (
                <>
                  <KeyRound className="h-5 w-5" /> Cambiar contraseña
                </>
              )}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
