"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  Wallet,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";
import {
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setPaymentMethodActive,
} from "@/features/payments-config/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PaymentMethodConfig } from "@/types/database.types";

type Kind = "wallet" | "bank";

export function PaymentMethodsManager({
  methods,
}: {
  methods: PaymentMethodConfig[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethodConfig | null>(null);
  const [kind, setKind] = useState<Kind>("wallet");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setKind("wallet");
    setError(null);
    setOpen(true);
  }
  function openEdit(m: PaymentMethodConfig) {
    setEditing(m);
    setKind(m.kind);
    setError(null);
    setOpen(true);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      kind,
      label: String(fd.get("label") ?? ""),
      number: String(fd.get("number") ?? ""),
      holder: String(fd.get("holder") ?? ""),
      bank_name: String(fd.get("bank_name") ?? ""),
      account: String(fd.get("account") ?? ""),
      cci: String(fd.get("cci") ?? ""),
      sort_order: Number(fd.get("sort_order") ?? 0),
      is_active: fd.get("is_active") === "on",
    };
    setBusy(true);
    const r = editing
      ? await updatePaymentMethod(editing.id, payload)
      : await createPaymentMethod(payload);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    toast.success(editing ? "Método actualizado" : "Método agregado");
    setOpen(false);
    router.refresh();
  }

  async function onToggle(m: PaymentMethodConfig) {
    const r = await setPaymentMethodActive(m.id, !m.is_active);
    if (!r.ok) return toast.error(r.error);
    toast.success(m.is_active ? "Método ocultado" : "Método visible");
    router.refresh();
  }

  async function onDelete(m: PaymentMethodConfig) {
    if (!confirm(`¿Eliminar "${m.label}"?`)) return;
    const r = await deletePaymentMethod(m.id);
    if (!r.ok) return toast.error(r.error);
    toast.success("Método eliminado");
    router.refresh();
  }

  const label = "mb-1.5 block text-sm font-medium";
  const input =
    "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-5 w-5" /> Agregar método
        </Button>
      </div>

      {methods.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border-2 border-dashed border-border py-16 text-center">
          <Wallet className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-display text-lg font-semibold">Sin métodos de pago</p>
          <p className="text-sm text-muted-foreground">
            Agrega Yape, Plin o una cuenta bancaria.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {methods.map((m) => (
            <div
              key={m.id}
              className={cn(
                "rounded-3xl border border-border bg-card p-5",
                !m.is_active && "opacity-60",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">
                    {m.kind === "bank" ? (
                      <Landmark className="h-5 w-5" />
                    ) : (
                      <Wallet className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <p className="font-display font-bold">{m.label}</p>
                    {m.is_active ? (
                      <Badge tone="mint">Visible</Badge>
                    ) : (
                      <Badge tone="neutral">Oculto</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onToggle(m)}
                    title={m.is_active ? "Ocultar" : "Mostrar"}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {m.is_active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(m)}
                    title="Editar"
                    className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(m)}
                    title="Eliminar"
                    className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <dl className="space-y-1 text-sm text-muted-foreground">
                {m.kind === "wallet" ? (
                  <>
                    {m.number && <p>Número: <b className="text-foreground">{m.number}</b></p>}
                    {m.holder && <p>Titular: <b className="text-foreground">{m.holder}</b></p>}
                  </>
                ) : (
                  <>
                    {m.bank_name && <p>Banco: <b className="text-foreground">{m.bank_name}</b></p>}
                    {m.holder && <p>Titular: <b className="text-foreground">{m.holder}</b></p>}
                    {m.account && <p>Cuenta: <b className="text-foreground">{m.account}</b></p>}
                    {m.cci && <p>CCI: <b className="text-foreground">{m.cci}</b></p>}
                  </>
                )}
              </dl>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          // Only close when the click STARTS and ENDS on the backdrop itself.
          // (Prevents closing when a text-selection drag ends outside the card.)
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busy) setOpen(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-card p-6 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">
                {editing ? "Editar método" : "Nuevo método de pago"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              {/* Kind toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setKind("wallet")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold transition-colors",
                    kind === "wallet"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <Wallet className="h-4 w-4" /> Billetera (Yape/Plin)
                </button>
                <button
                  type="button"
                  onClick={() => setKind("bank")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold transition-colors",
                    kind === "bank"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <Landmark className="h-4 w-4" /> Banco
                </button>
              </div>

              {error && (
                <p className="rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                  {error}
                </p>
              )}

              <div>
                <label htmlFor="pm-label" className={label}>
                  Nombre {kind === "wallet" ? "(ej. Yape, Plin)" : "(ej. BCP, BBVA)"}
                </label>
                <Input
                  id="pm-label"
                  name="label"
                  defaultValue={editing?.label ?? ""}
                  required
                />
              </div>

              {kind === "wallet" ? (
                <>
                  <div>
                    <label htmlFor="pm-number" className={label}>Número</label>
                    <input id="pm-number" name="number" defaultValue={editing?.number ?? ""} className={input} placeholder="999 999 999" />
                  </div>
                  <div>
                    <label htmlFor="pm-holder" className={label}>Titular</label>
                    <input id="pm-holder" name="holder" defaultValue={editing?.holder ?? ""} className={input} placeholder="Nombre del titular" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="pm-bank" className={label}>Banco</label>
                    <input id="pm-bank" name="bank_name" defaultValue={editing?.bank_name ?? ""} className={input} placeholder="BCP / BBVA / Interbank" />
                  </div>
                  <div>
                    <label htmlFor="pm-holder2" className={label}>Titular</label>
                    <input id="pm-holder2" name="holder" defaultValue={editing?.holder ?? ""} className={input} placeholder="Razón social o nombre" />
                  </div>
                  <div>
                    <label htmlFor="pm-account" className={label}>Número de cuenta</label>
                    <input id="pm-account" name="account" defaultValue={editing?.account ?? ""} className={input} />
                  </div>
                  <div>
                    <label htmlFor="pm-cci" className={label}>CCI</label>
                    <input id="pm-cci" name="cci" defaultValue={editing?.cci ?? ""} className={input} />
                  </div>
                </>
              )}

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label htmlFor="pm-order" className={label}>Orden</label>
                  <input id="pm-order" name="sort_order" type="number" min="0" defaultValue={editing?.sort_order ?? 0} className={input} />
                </div>
                <label className="mt-6 flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={editing ? editing.is_active : true}
                    className="h-4 w-4 accent-[hsl(var(--accent))]"
                  />
                  Visible en la tienda
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Guardando…</>
                ) : editing ? "Guardar cambios" : "Agregar método"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
