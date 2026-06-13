import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts } from "@/features/products/queries";
import {
  getCategoryBySlug,
  getCategorySlugsForStaticParams,
} from "@/features/categories/queries";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductGrid } from "@/features/products/components/product-grid";
import { getProductPlaceholder } from "@/features/products/placeholder";

interface Props {
  params: Promise<{ slug: string }>;
}

// Pre-render known categories at build time (cookie-less client).
export async function generateStaticParams() {
  return getCategorySlugsForStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Categoría no encontrada" };
  return {
    title: category.name,
    description: category.description ?? `Productos de ${category.name}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.is_active) notFound();

  const products = await getProducts({ categorySlug: slug, limit: 60 });
  const theme = getProductPlaceholder(slug);

  return (
    <Container className="py-10">
      <header
        className="mb-8 flex items-center gap-4 rounded-3xl border border-border p-6"
        style={{
          backgroundImage: `linear-gradient(150deg, ${theme.from}, ${theme.to})`,
        }}
      >
        <span className="text-5xl" aria-hidden>
          {theme.emoji}
        </span>
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{category.name}</h1>
          {category.description && (
            <p className="mt-1 text-foreground/70">{category.description}</p>
          )}
        </div>
      </header>

      {products.length === 0 ? (
        <EmptyState
          emoji={theme.emoji}
          title="Sin productos por ahora"
          description="Estamos sumando novedades a esta categoría."
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </Container>
  );
}
