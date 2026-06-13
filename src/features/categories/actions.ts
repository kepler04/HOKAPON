"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { categorySchema, type CategoryInput } from "./schemas";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

export async function createCategory(
  input: CategoryInput,
): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  // image_url is managed through uploadCategoryImage, not the text form.
  const { image_url: _ignore, ...fields } = parsed.data;
  void _ignore;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ ...fields, description: fields.description || null })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { ok: true, id: data.id };
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  // image_url is managed through uploadCategoryImage, not the text form.
  const { image_url: _ignore, ...fields } = parsed.data;
  void _ignore;

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ ...fields, description: fields.description || null })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { ok: true, id };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Best-effort cleanup of the category image before removing the row.
  const { data: cat } = await supabase
    .from("categories")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  if (cat?.image_url) {
    await supabase.storage.from(STORAGE_BUCKETS.CATEGORIES).remove([cat.image_url]);
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { ok: true, id };
}

// ----------------------- Category image (Storage) -----------------------

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Upload (and replace) the image for a category. */
export async function uploadCategoryImage(
  categoryId: string,
  formData: FormData,
): Promise<ActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No se recibió ningún archivo." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "Formato no permitido (usa JPG, PNG, WEBP o AVIF)." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "La imagen supera el límite de 5 MB." };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${categoryId}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(STORAGE_BUCKETS.CATEGORIES)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) return { ok: false, error: upErr.message };

  // Remove the previous image (if any) after the new one is in place.
  const { data: prev } = await supabase
    .from("categories")
    .select("image_url")
    .eq("id", categoryId)
    .maybeSingle();

  const { error: updErr } = await supabase
    .from("categories")
    .update({ image_url: path })
    .eq("id", categoryId);
  if (updErr) {
    await supabase.storage.from(STORAGE_BUCKETS.CATEGORIES).remove([path]);
    return { ok: false, error: updErr.message };
  }

  if (prev?.image_url && prev.image_url !== path) {
    await supabase.storage
      .from(STORAGE_BUCKETS.CATEGORIES)
      .remove([prev.image_url]);
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { ok: true, id: categoryId };
}

/** Remove a category's image (Storage object + clear the column). */
export async function removeCategoryImage(
  categoryId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: cat } = await supabase
    .from("categories")
    .select("image_url")
    .eq("id", categoryId)
    .maybeSingle();

  if (cat?.image_url) {
    await supabase.storage
      .from(STORAGE_BUCKETS.CATEGORIES)
      .remove([cat.image_url]);
  }

  const { error } = await supabase
    .from("categories")
    .update({ image_url: null })
    .eq("id", categoryId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { ok: true, id: categoryId };
}
