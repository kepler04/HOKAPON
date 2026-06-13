import type { Metadata } from "next";
import { getProducts } from "@/features/products/queries";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductGrid } from "@/features/products/components/product-grid";

export const metadata: Metadata = {
  title: "Todos los productos",
  description: "Explora todo el catálogo de ropa, juguetes y accesorios.",
};

export default async function CatalogPage() {
  const products = await getProducts({ limit: 60 });

  return (
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Todos los productos</h1>
        <p className="mt-2 text-muted-foreground">
          {products.length}{" "}
          {products.length === 1 ? "producto" : "productos"} disponibles
        </p>
      </header>

      {products.length === 0 ? (
        <EmptyState
          emoji="📦"
          title="Aún no hay productos"
          description="Vuelve pronto, estamos preparando el catálogo."
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </Container>
  );
}
