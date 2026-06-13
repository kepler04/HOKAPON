"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";
import { ORDER_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_KEYS = Object.keys(ORDER_STATUSES) as (keyof typeof ORDER_STATUSES)[];

export function OrdersFilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const activeStatus = params.get("status") ?? "";
  const [search, setSearch] = useState(params.get("search") ?? "");

  function applyStatus(status: string) {
    const next = new URLSearchParams(params.toString());
    if (status) next.set("status", status);
    else next.delete("status");
    router.push(`/admin/pedidos?${next.toString()}`);
  }

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (search.trim()) next.set("search", search.trim());
    else next.delete("search");
    router.push(`/admin/pedidos?${next.toString()}`);
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={applySearch}
        className="flex h-11 items-center gap-2 rounded-full border-2 border-border bg-card px-4 focus-within:border-accent"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por N° de pedido, nombre o correo…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => applyStatus("")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            !activeStatus ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-muted",
          )}
        >
          Todos
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
