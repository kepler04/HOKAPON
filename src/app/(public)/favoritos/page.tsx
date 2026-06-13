import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { requireCustomer } from "@/features/customer-auth/queries";
import {
  getFavoriteProducts,
  getFavoriteIds,
} from "@/features/favorites/queries";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductGrid } from "@/features/products/components/product-grid";

export const metadata: Metadata = {
  title: "Mis favoritos",
  robots: { index: false },
};

export default async function FavoritesPage() {
  await requireCustomer("/cuenta?next=/favoritos");
  const [products, favoriteIds] = await Promise.all([
    getFavoriteProducts(),
    getFavoriteIds(),
  ]);

  return (
    <Container className="py-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
          <Heart className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-extrabold">Mis favoritos</h1>
          <p className="text-sm text-muted-foreground">
            Productos que guardaste para comprar más tarde.
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState
          emoji="❤️"
          title="Aún no tienes favoritos"
          description="Toca el corazón en cualquier producto para guardarlo aquí."
        >
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            Ver productos
          </Link>
        </EmptyState>
      ) : (
        <ProductGrid products={products} favoriteIds={favoriteIds} />
      )}
    </Container>
  );
}
