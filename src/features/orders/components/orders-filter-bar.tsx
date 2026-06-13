"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CalendarDays, RotateCcw, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ORDER_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_KEYS = Object.keys(ORDER_STATUSES) as (keyof typeof ORDER_STATUSES)[];

export function OrdersFilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const activeStatus = params.get("status") ?? "";
  const activeAction = params.get("action") ?? "";
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [dateFrom, setDateFrom] = useState(params.get("from") ?? "");
  const [dateTo, setDateTo] = useState(params.get("to") ?? "");

  function push(next: URLSearchParams) {
    const query = next.toString();
    router.push(query ? `/admin/pedidos?${query}` : "/admin/pedidos");
  }

  function applyStatus(status: string) {
    const next = new URLSearchParams(params.toString());
    next.delete("action");
    if (status) next.set("status", status);
    else next.delete("status");
    push(next);
  }

  function applyNeedsAction() {
    const next = new URLSearchParams(params.toString());
    next.delete("status");
    if (activeAction === "needs_action") next.delete("action");
    else next.set("action", "needs_action");
    push(next);
  }

  function applySearch(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (search.trim()) next.set("search", search.trim());
    else next.delete("search");
    if (dateFrom) next.set("from", dateFrom);
    else next.delete("from");
    if (dateTo) next.set("to", dateTo);
    else next.delete("to");
    push(next);
  }

  function reset() {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    router.push("/admin/pedidos");
  }

  return (
    <div className="space-y-4 rounded-[1.4rem] border border-border bg-card p-4 shadow-[0_18px_60px_-48px_hsl(var(--foreground)/0.45)]">
      <form onSubmit={applySearch} className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto_auto]">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pedido, cliente, correo o telefono"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>

        <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Desde</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-transparent text-sm outline-none"
          />
        </label>

        <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Hasta</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-transparent text-sm outline-none"
          />
        </label>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105 active:scale-[0.98]"
        >
          <Search className="h-4 w-4" />
          Filtrar
        </button>

        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          <RotateCcw className="h-4 w-4" />
          Limpiar
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => applyStatus("")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            !activeStatus && !activeAction
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-muted",
          )}
        >
          Todos
        </button>

        <button
          onClick={applyNeedsAction}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            activeAction === "needs_action"
              ? "bg-accent text-accent-foreground"
              : "bg-accent/10 text-accent hover:bg-accent/15",
          )}
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Requiere accion
        </button>

        {STATUS_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => applyStatus(key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              activeStatus === key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-muted",
            )}
          >
            {ORDER_STATUSES[key].label}
          </button>
        ))}
      </div>
    </div>
  );
}
