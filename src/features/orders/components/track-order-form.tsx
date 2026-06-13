"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AtSign, Hash, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Public order tracking form. The contact field prevents exposing an order
 * only by guessing its number.
 */
export function TrackOrderForm({
  initialCode = "",
  initialContact = "",
}: {
  initialCode?: string;
  initialContact?: string;
}) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [contact, setContact] = useState(initialContact);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanCode = code.trim();
    const cleanContact = contact.trim();
    if (!cleanCode || !cleanContact) return;
    router.push(
      `/seguimiento?codigo=${encodeURIComponent(cleanCode)}&contacto=${encodeURIComponent(cleanContact)}`,
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
      <label className="relative block">
        <span className="mb-1.5 block text-sm font-semibold">
          Numero de pedido
        </span>
        <Hash className="pointer-events-none absolute bottom-3.5 left-3.5 h-5 w-5 text-muted-foreground" />
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ej. YK-2026-000015"
          aria-label="Numero de pedido"
          className="pl-11"
          autoFocus
          required
        />
      </label>

      <label className="relative block">
        <span className="mb-1.5 block text-sm font-semibold">
          Correo o telefono
        </span>
        <AtSign className="pointer-events-none absolute bottom-3.5 left-3.5 h-5 w-5 text-muted-foreground" />
        <Input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Ej. correo@email.com o 999999999"
          aria-label="Correo o telefono del pedido"
          className="pl-11"
          required
        />
      </label>

      <Button type="submit" size="lg" className="mt-auto h-12 shrink-0">
        <Search className="h-5 w-5" /> Ver pedido
      </Button>
    </form>
  );
}
