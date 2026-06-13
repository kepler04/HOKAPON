import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProductByIdAdmin } from "@/features/products/queries";
import { getAllCategories } from "@/features/categories/queries";
import { ProductForm } from "@/features/products/components/product-form";
import { ImageUploader } from "@/features/products/components/image-uploader";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductByIdAdmin(id),
    getAllCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Productos
      </Link>
      <h1 className="font-display text-3xl font-bold">{product.name}</h1>

      {/* Images */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="mb-4 font-display text-lg font-bold">Imágenes</h2>
        <ImageUploader
          productId={product.id}
          images={(product.product_images ?? []).map((i) => ({
            id: i.id,
            url: i.url,
            is_primary: i.is_primary,
          }))}
        />
      </section>

      {/* Details */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="mb-4 font-display text-lg font-bold">Detalles</h2>
        <ProductForm
          categories={categories}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            category_id: product.category_id,
            price: product.price,
            compare_price: product.compare_price,
            stock: product.stock,
            max_per_order: product.max_per_order,
            sku: product.sku,
            is_active: product.is_active,
            is_featured: product.is_featured,
          }}
        />
      </section>
    </div>
  );
}
