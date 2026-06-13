"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";

/** Mobile-only top bar with a slide-in sidebar drawer. */
export function AdminMobileBar({ storeName }: { storeName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 animate-rise bg-[#0d1117] p-5 text-white shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display font-bold text-white">{storeName}</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div onClick={() => setOpen(false)}>
              <AdminSidebar />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
