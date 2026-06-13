import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getAllCategories } from "@/features/categories/queries";
import { ProductForm } from "@/features/products/components/product-form";

export default async function NewProductPage() {
  const categories = await getAllCategories();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Productos
      </Link>
      <h1 className="font-display text-3xl font-bold">Nuevo producto</h1>
      <p className="-mt-4 text-sm text-muted-foreground">
        Crea el producto y luego podrás subir sus imágenes.
      </p>
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
