"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { productSchema, type ProductInput } from "./schemas";

/**
 * Write-side server actions for products (admin only).
 *
 * RLS enforces that only staff/admin can mutate products (see
 * 0003_rls_policies.sql), so these run with the cookie-bound server client.
 * Full implementation lands in Fase 4. Stubs validate input so the contract
 * is stable now.
 */

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

export async function createProduct(
  input: ProductInput,
): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      ...parsed.data,
      description: parsed.data.description || null,
      sku: parsed.data.sku || null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true, id: data.id };
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      ...parsed.data,
      description: parsed.data.description || null,
      sku: parsed.data.sku || null,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true, id };
}

export async function setProductActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true, id };
}

// ----------------------- Product images (Storage) -----------------------

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Upload an image file for a product and register it in product_images. */
export async function uploadProductImage(
  productId: string,
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
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(STORAGE_BUCKETS.PRODUCTS)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) return { ok: false, error: upErr.message };

  // First image of a product becomes primary.
  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  const { error: insErr } = await supabase.from("product_images").insert({
    product_id: productId,
    url: path,
    is_primary: (count ?? 0) === 0,
    sort_order: count ?? 0,
  });
  if (insErr) return { ok: false, error: insErr.message };

  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/productos");
  return { ok: true, id: productId };
}

/** Delete a product image (Storage object + DB row). */
export async function deleteProductImage(
  imageId: string,
  productId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: img } = await supabase
    .from("product_images")
    .select("url,is_primary")
    .eq("id", imageId)
    .single();

  if (img) {
    await supabase.storage.from(STORAGE_BUCKETS.PRODUCTS).remove([img.url]);
  }
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);
  if (error) return { ok: false, error: error.message };

  // If we removed the primary, promote another image to primary.
  if (img?.is_primary) {
    const { data: next } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (next) {
      await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", next.id);
    }
  }

  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/productos");
  return { ok: true, id: productId };
}
