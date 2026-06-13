"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { PAYMENT_INFO } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/60 px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium tabular-nums">{value}</p>
      </div>
      <button
        onClick={copy}
        aria-label={`Copiar ${label}`}
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors",
          copied ? "bg-mint/20 text-mint" : "hover:bg-background",
        )}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function MethodCard({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <h3 className="font-display font-bold">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/** Displays the store's manual payment data with copy-to-clipboard fields. */
export function PaymentMethods() {
  const { yape, plin, bank } = PAYMENT_INFO;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MethodCard emoji="💜" title="Yape">
        <CopyField label="Número" value={yape.number} />
        {yape.name && <CopyField label="Titular" value={yape.name} />}
      </MethodCard>

      <MethodCard emoji="💙" title="Plin">
        <CopyField label="Número" value={plin.number} />
        {plin.name && <CopyField label="Titular" value={plin.name} />}
      </MethodCard>

      <MethodCard emoji="🏦" title="Transferencia bancaria">
        {bank.name && <CopyField label="Banco" value={bank.name} />}
        {bank.holder && <CopyField label="Titular" value={bank.holder} />}
        <CopyField label="Cuenta" value={bank.account} />
        <CopyField label="CCI" value={bank.cci} />
      </MethodCard>
    </div>
  );
}
