import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/shared/price";
import { getProductPlaceholder } from "@/features/products/placeholder";
import { AddToCartButton } from "./add-to-cart-button";
import type { ProductCardData } from "@/features/products/types";

/** Product card for grids. Hover-lift, image/placeholder, quick add-to-cart. */
export function ProductCard({ product }: { product: ProductCardData }) {
  const theme = getProductPlaceholder(product.categorySlug);
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 5;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_hsl(222_47%_16%/0.25)]">
      <Link
        href={`/productos/${product.slug}`}
        className="relative block aspect-square overflow-hidden"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              backgroundImage: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
            }}
          >
            <span className="text-6xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
              {theme.emoji}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.is_featured && <Badge tone="accent">Destacado</Badge>}
          {soldOut && <Badge tone="neutral">Agotado</Badge>}
          {lowStock && <Badge tone="berry">¡Últimas {product.stock}!</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/productos/${product.slug}`} className="flex-1">
          <h3 className="line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-accent">
            {product.name}
          </h3>
        </Link>
        <div className="mt-3 flex items-end justify-between gap-2">
          <Price
            value={product.price}
            comparePrice={product.compare_price}
            size="md"
          />
          <AddToCartButton
            variant="icon"
            item={{
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              imageUrl: product.imageUrl,
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </article>
  );
}
