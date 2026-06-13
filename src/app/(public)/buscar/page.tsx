import type { Metadata } from "next";
import { searchProducts } from "@/features/products/queries";
import { getFavoriteIds } from "@/features/favorites/queries";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductGrid } from "@/features/products/components/product-grid";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Buscar",
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";
  const results = term ? await searchProducts(term) : [];
  const favoriteIds = term ? await getFavoriteIds() : new Set<string>();

  return (
    <Container className="py-10">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">Resultados de búsqueda</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
          {term ? `“${term}”` : "Buscar productos"}
        </h1>
        {term && (
          <p className="mt-2 text-muted-foreground">
            {results.length}{" "}
            {results.length === 1 ? "resultado" : "resultados"}
          </p>
        )}
      </header>

      {!term ? (
        <EmptyState
          emoji="🔎"
          title="Escribe algo para buscar"
          description="Usa la barra de búsqueda para encontrar polos, juguetes, mochilas y más."
        />
      ) : results.length === 0 ? (
        <EmptyState
          emoji="🙈"
          title={`Sin resultados para “${term}”`}
          description="Prueba con otras palabras o explora todo el catálogo."
        >
          <Button asChild>
            <Link href="/productos">Ver todos los productos</Link>
          </Button>
        </EmptyState>
      ) : (
        <ProductGrid products={results} favoriteIds={favoriteIds} />
      )}
    </Container>
  );
}
