"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { productSchema, type ProductInput } from "@/features/products/schemas";
import { createProduct, updateProduct } from "@/features/products/actions";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { Category } from "@/features/categories/types";

interface ProductFormProps {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category_id: string | null;
    price: number;
    compare_price: number | null;
    stock: number;
    max_per_order: number | null;
    sku: string | null;
    is_active: boolean;
    is_featured: boolean;
  };
}

const LOW_STOCK = 5;

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(isEdit);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          category_id: product.category_id,
          price: product.price,
          compare_price: product.compare_price,
          stock: product.stock,
          max_per_order: product.max_per_order ?? 0,
          sku: product.sku ?? "",
          is_active: product.is_active,
          is_featured: product.is_featured,
        }
      : {
          is_active: true,
          is_featured: false,
          stock: 0,
          price: 0,
          max_per_order: 0,
        },
  });

  const nameValue = watch("name");

  // Auto-fill slug from name until the user edits the slug manually.
  function onNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) setValue("slug", slugify(e.target.value));
  }

  async function onSubmit(values: ProductInput) {
    setServerError(null);
    const result = isEdit
      ? await updateProduct(product!.id, values)
      : await createProduct(values);

    if (!result.ok) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Producto actualizado" : "Producto creado");
    router.push(`/admin/productos/${result.id ?? product?.id}`);
    router.refresh();
  }

  const field = "mb-1.5 block text-sm font-medium";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={field}>Nombre</label>
          <Input id="name" {...register("name", { onChange: onNameChange })} value={nameValue ?? ""} />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="slug" className={field}>Slug (URL)</label>
          <Input
            id="slug"
            {...register("slug")}
            onFocus={() => setSlugEdited(true)}
          />
          {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className={field}>Descripción</label>
          <Textarea id="description" {...register("description")} />
        </div>

        <div>
          <label htmlFor="category_id" className={field}>Categoría</label>
          <select
            id="category_id"
            {...register("category_id")}
            className="h-12 w-full rounded-2xl border-2 border-input bg-card px-4 text-sm outline-none focus:border-accent"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sku" className={field}>SKU</label>
          <Input id="sku" {...register("sku")} placeholder="YK-XXX-001" />
        </div>

        <div>
          <label htmlFor="price" className={field}>Precio (S/)</label>
          <Input id="price" type="number" step="0.01" min="0" {...register("price")} />
          {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
        </div>

        <div>
          <label htmlFor="compare_price" className={field}>
            Precio tachado <span className="text-muted-foreground">(opcional)</span>
          </label>
          <Input id="compare_price" type="number" step="0.01" min="0" {...register("compare_price")} />
          {errors.compare_price && (
            <p className="mt-1 text-xs text-destructive">{errors.compare_price.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="stock" className={field}>Stock</label>
          <Input id="stock" type="number" min="0" {...register("stock")} />
          {errors.stock && <p className="mt-1 text-xs text-destructive">{errors.stock.message}</p>}
          {Number(watch("stock")) > 0 &&
            Number(watch("stock")) <= LOW_STOCK && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-accent">
                ⚠️ Stock bajo: quedan {Number(watch("stock"))}. Considera bajar el
                “Máximo por pedido”.
              </p>
            )}
        </div>

        <div>
          <label htmlFor="max_per_order" className={field}>
            Máximo por pedido{" "}
            <span className="text-muted-foreground">(0 = sin límite)</span>
          </label>
          <Input
            id="max_per_order"
            type="number"
            min="0"
            placeholder="0"
            {...register("max_per_order")}
          />
          {errors.max_per_order && (
            <p className="mt-1 text-xs text-destructive">
              {errors.max_per_order.message}
            </p>
          )}
          <p className="mt-1.5 text-xs text-muted-foreground">
            Tope de unidades que un cliente puede llevar en un solo pedido.
          </p>
        </div>

        <div className="flex items-center gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" {...register("is_active")} className="h-4 w-4 accent-[hsl(var(--accent))]" />
            Activo
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" {...register("is_featured")} className="h-4 w-4 accent-[hsl(var(--accent))]" />
            Destacado
          </label>
        </div>
      </div>

      {serverError && (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Guardando…</>
          ) : isEdit ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
