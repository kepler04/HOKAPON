"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Code input for the public order-tracking page. Submitting navigates to
 * /seguimiento?codigo=XXX, where the server fetches and renders the status.
 */
export function TrackOrderForm({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = code.trim();
    if (!value) return;
    router.push(`/seguimiento?codigo=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Ej. YK-2026-000012"
        aria-label="Código de pedido"
        className="flex-1"
        autoFocus
      />
      <Button type="submit" size="lg" className="shrink-0">
        <Search className="h-5 w-5" /> Ver mi pedido
      </Button>
    </form>
  );
}
