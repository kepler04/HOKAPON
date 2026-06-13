import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProductPlaceholder } from "@/features/products/placeholder";
import { categoryImageUrl } from "@/features/categories/image";
import type { Category } from "@/features/categories/types";

/**
 * "Compra por categoría HOKAPON" showcase.
 * Renders the REAL categories from the database (intro on the left, grid on the
 * right). Each tile uses a themed emoji placeholder until a real image exists.
 */
export function CategoryShowcase({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[300px_1fr]">
      {/* Left intro */}
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
          Categorías
        </p>
        <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.05]">
          Compra por
          <br />
          categoría <span className="text-accent">HOKAPON</span>
        </h2>
        <p className="mt-4 max-w-xs text-muted-foreground">
          Encuentra todo lo que buscas, organizado por categoría en un solo
          lugar.
        </p>
        <Link
          href="/productos"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent transition-colors hover:underline"
        >
          Ver todas las categorías <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Right grid (real categories) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {categories.map((cat) => {
          const theme = getProductPlaceholder(cat.slug);
          return (
            <Link
              key={cat.id}
              href={`/categorias/${cat.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary/60">
                {cat.image_url ? (
                  <Image
                    src={categoryImageUrl(cat.image_url)}
                    alt={cat.name}
                    fill
                    sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 200px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-5xl transition-transform duration-300 group-hover:scale-105">
                    {theme.emoji}
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-semibold leading-tight">{cat.name}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
