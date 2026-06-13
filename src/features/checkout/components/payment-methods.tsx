"use client";

import { useState } from "react";
import { Check, Copy, Wallet, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethodConfig } from "@/types/database.types";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/70 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold tabular-nums">{value}</p>
      </div>
      <button
        onClick={copy}
        aria-label={`Copiar ${label}`}
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors",
          copied ? "bg-mint/20 text-mint" : "hover:bg-background",
        )}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function MethodCard({
  kind,
  title,
  children,
}: {
  kind: "wallet" | "bank";
  title: string;
  children: React.ReactNode;
}) {
  const normalizedTitle = title.toLowerCase();
  const walletTone = normalizedTitle.includes("yape")
    ? "bg-violet-100 text-violet-700"
    : normalizedTitle.includes("plin")
      ? "bg-sky-100 text-sky-700"
      : "bg-accent/10 text-accent";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_14px_40px_-34px_hsl(var(--foreground)/0.55)]">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            kind === "bank" ? "bg-mint/10 text-mint" : walletTone,
          )}
        >
          {kind === "bank" ? (
            <Landmark className="h-5 w-5" />
          ) : (
            <Wallet className="h-5 w-5" />
          )}
        </span>
        <h3 className="font-display font-bold">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/**
 * Store payment data with copy-to-clipboard fields. The methods are configured
 * by the admin (payment_methods table) and passed in from the server.
 */
export function PaymentMethods({
  methods,
}: {
  methods: PaymentMethodConfig[];
}) {
  if (methods.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-6 text-center text-sm text-muted-foreground">
        Los métodos de pago se coordinarán por WhatsApp.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {methods.map((m) => (
        <MethodCard key={m.id} kind={m.kind} title={m.label}>
          {m.kind === "wallet" ? (
            <>
              {m.number && <CopyField label="Número" value={m.number} />}
              {m.holder && <CopyField label="Titular" value={m.holder} />}
            </>
          ) : (
            <>
              {m.bank_name && <CopyField label="Banco" value={m.bank_name} />}
              {m.holder && <CopyField label="Titular" value={m.holder} />}
              {m.account && <CopyField label="Cuenta" value={m.account} />}
              {m.cci && <CopyField label="CCI" value={m.cci} />}
            </>
          )}
        </MethodCard>
      ))}
    </div>
  );
}
