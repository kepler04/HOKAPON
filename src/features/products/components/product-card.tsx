import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { getProductPlaceholder } from "@/features/products/placeholder";
import { FavoriteButton } from "@/features/favorites/components/favorite-button";
import { AddToCartButton } from "./add-to-cart-button";
import type { ProductCardData } from "@/features/products/types";

/** HOKAPON product card: NUEVO badge, red category, red price, stock pill. */
export function ProductCard({
  product,
  favorited = false,
}: {
  product: ProductCardData;
  favorited?: boolean;
}) {
  const theme = getProductPlaceholder(product.categorySlug);
  const soldOut = product.stock <= 0;
  const hasDiscount =
    product.compare_price != null && product.compare_price > product.price;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-border bg-card p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_hsl(222_47%_16%/0.25)]">
      {/* Image area */}
      <Link
        href={`/productos/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-xl bg-secondary/50"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
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

        {/* Top-left badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-accent-foreground">
              Nuevo
            </span>
          )}
          {hasDiscount && (
            <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
              Oferta
            </span>
          )}
          {soldOut && (
            <span className="rounded-md bg-muted-foreground px-2 py-0.5 text-[11px] font-bold text-white">
              Agotado
            </span>
          )}
        </div>
      </Link>

      {/* Favorite heart (outside the link so it doesn't navigate) */}
      <div className="absolute right-4 top-4 z-10">
        <FavoriteButton
          productId={product.id}
          initialFavorited={favorited}
          variant="icon"
          className="h-9 w-9 shadow-sm"
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-1 pt-3">
        {product.categoryName && (
          <span className="text-[11px] font-bold uppercase tracking-wide text-accent">
            {product.categoryName}
          </span>
        )}
        <Link href={`/productos/${product.slug}`} className="mt-1">
          <h3 className="line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-accent">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-xl font-extrabold text-accent">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compare_price as number)}
            </span>
          )}
        </div>

        {/* Footer: stock pill + cart button */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className={
              soldOut
                ? "inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground"
                : "inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent"
            }
          >
            <Package className="h-3.5 w-3.5" />
            {soldOut ? "Sin stock" : "Stock disponible"}
          </span>
          <AddToCartButton
            variant="icon"
            item={{
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              imageUrl: product.imageUrl,
              stock: product.stock,
              maxPerOrder: product.max_per_order,
            }}
          />
        </div>
      </div>
    </article>
  );
}
