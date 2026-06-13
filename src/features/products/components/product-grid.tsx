import { ProductCard } from "./product-card";
import type { ProductCardData } from "@/features/products/types";

/** Responsive product grid with a staggered load-in animation. */
export function ProductGrid({
  products,
  favoriteIds,
}: {
  products: ProductCardData[];
  /** IDs the current user has favorited (to pre-fill the heart). */
  favoriteIds?: Set<string>;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="animate-rise"
          style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
        >
          <ProductCard
            product={product}
            favorited={favoriteIds?.has(product.id) ?? false}
          />
        </div>
      ))}
    </div>
  );
}
