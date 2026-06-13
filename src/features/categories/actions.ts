"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ ...parsed.data, description: parsed.data.description || null })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categorias");
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ ...parsed.data, description: parsed.data.description || null })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categorias");
  return { ok: true, id };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categorias");
  return { ok: true, id };
}
