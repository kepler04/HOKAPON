import Link from "next/link";
import { getProductPlaceholder } from "@/features/products/placeholder";
import type { Category } from "@/features/categories/types";

/** Colorful category tile linking to its listing. */
export function CategoryCard({ category }: { category: Category }) {
  const theme = getProductPlaceholder(category.slug);
  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border border-border p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
      style={{
        backgroundImage: `linear-gradient(150deg, ${theme.from}, ${theme.to})`,
      }}
    >
      <span className="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
        {theme.emoji}
      </span>
      <span className="font-display font-bold text-foreground/90">
        {category.name}
      </span>
    </Link>
  );
}
