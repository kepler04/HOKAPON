"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ToggleFavoriteResult =
  | { ok: true; favorited: boolean }
  | { ok: false; reason: "unauthenticated" | "error"; error?: string };

/**
 * Add/remove a product from the current user's favorites.
 * Returns reason "unauthenticated" so the UI can prompt the guest to sign in.
 */
export async function toggleFavorite(
  productId: string,
): Promise<ToggleFavoriteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  // Is it already a favorite?
  const { data: existing } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) return { ok: false, reason: "error", error: error.message };
    revalidatePath("/favoritos");
    return { ok: true, favorited: false };
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, product_id: productId });
  if (error) return { ok: false, reason: "error", error: error.message };
  revalidatePath("/favoritos");
  return { ok: true, favorited: true };
}
