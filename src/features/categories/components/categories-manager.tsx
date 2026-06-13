"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { categorySchema, type CategoryInput } from "@/features/categories/schemas";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/features/categories/actions";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CategoryImageField } from "./category-image-field";
import type { Category } from "@/features/categories/types";

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Derive the live category from props so the image preview reflects the
  // latest server state after router.refresh() (instead of a stale snapshot).
  const editing = categories.find((c) => c.id === editingId) ?? null;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { is_active: true, sort_order: 0 },
  });

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setServerError(null);
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      is_active: cat.is_active,
      sort_order: cat.sort_order,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setServerError(null);
    reset({ name: "", slug: "", description: "", is_active: true, sort_order: 0 });
  }

  async function onSubmit(values: CategoryInput) {
    setServerError(null);
    const result = editing
      ? await updateCategory(editing.id, values)
      : await createCategory(values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    toast.success(editing ? "Categoría actualizada" : "Categoría creada");
    cancelEdit();
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("¿Eliminar esta categoría? Los productos quedarán sin categoría."))
      return;
    const r = await deleteCategory(id);
    if (!r.ok) return toast.error(r.error);
    toast.success("Categoría eliminada");
    if (editing?.id === id) cancelEdit();
    router.refresh();
  }

  const field = "mb-1.5 block text-sm font-medium";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* List */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        {categories.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No hay categorías todavía.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Orden</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3">
                    <span className="font-semibold">{cat.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">/{cat.slug}</span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{cat.sort_order}</td>
                  <td className="px-5 py-3">
                    {cat.is_active ? (
                      <Badge tone="mint">Activa</Badge>
                    ) : (
                      <Badge tone="neutral">Inactiva</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => startEdit(cat)}
                        aria-label="Editar"
                        className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(cat.id)}
                        aria-label="Eliminar"
                        className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form */}
      <aside className="h-fit rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-24">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">
            {editing ? "Editar categoría" : "Nueva categoría"}
          </h2>
          {editing && (
            <button onClick={cancelEdit} aria-label="Cancelar edición" className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="cat-name" className={field}>Nombre</label>
            <Input
              id="cat-name"
              {...register("name", {
                onChange: (e) => {
                  if (!editing) setValue("slug", slugify(e.target.value));
                },
              })}
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="cat-slug" className={field}>Slug</label>
            <Input id="cat-slug" {...register("slug")} />
            {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <div>
            <label htmlFor="cat-desc" className={field}>Descripción</label>
            <Textarea id="cat-desc" {...register("description")} />
          </div>

          {/* Image: only available once the category exists (needs an id). */}
          <div>
            <span className={field}>Imagen</span>
            {editing ? (
              <CategoryImageField
                categoryId={editing.id}
                imagePath={editing.image_url}
              />
            ) : (
              <p className="rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
                Crea la categoría primero; luego podrás subir su imagen al
                editarla.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="cat-order" className={field}>Orden</label>
            <Input id="cat-order" type="number" min="0" {...register("sort_order")} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" {...register("is_active")} className="h-4 w-4 accent-[hsl(var(--accent))]" />
            Activa
          </label>

          {serverError && (
            <p className="rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Guardando…</>
            ) : editing ? "Guardar cambios" : <><Plus className="h-5 w-5" /> Crear categoría</>}
          </Button>
        </form>
      </aside>
    </div>
  );
}
