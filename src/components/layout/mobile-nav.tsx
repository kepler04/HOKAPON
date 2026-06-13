"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { Category } from "@/features/categories/types";

/** Hamburger menu for category navigation on mobile. */
export function MobileNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 animate-rise bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold">Categorías</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-1">
              <Link
                href="/productos"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-secondary"
              >
                Todos los productos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categorias/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
