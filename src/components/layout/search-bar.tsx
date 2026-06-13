"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Search input that navigates to /buscar?q=... on submit. */
export function SearchBar({
  className,
  placeholder = "Busca polos, juguetes, mochilas…",
}: {
  className?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) router.push(`/buscar?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "group flex h-12 items-center gap-2 rounded-full border-2 border-border bg-card px-4 transition-colors focus-within:border-accent",
        className,
      )}
      role="search"
    >
      <Search className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-focus-within:text-accent" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar productos"
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        className="hidden shrink-0 rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-accent-foreground transition-all hover:brightness-105 active:scale-95 sm:block"
      >
        Buscar
      </button>
    </form>
  );
}
