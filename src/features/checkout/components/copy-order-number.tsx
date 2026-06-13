"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/** Order number pill with a copy-to-clipboard button. */
export function CopyOrderNumber({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="mx-auto mt-6 grid max-w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-[0_12px_30px_-24px_hsl(var(--foreground)/0.45)] sm:inline-grid sm:px-5">
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        N° de pedido
      </span>
      <span className="truncate font-display text-base font-bold tracking-wide text-accent sm:text-lg">
        {value}
      </span>
      <button
        onClick={copy}
        aria-label="Copiar número de pedido"
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg transition-colors",
          copied ? "bg-mint/20 text-mint" : "text-muted-foreground hover:bg-secondary",
        )}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
