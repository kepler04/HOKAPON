import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import type { Category } from "./types";

/**
 * Active category slugs for generateStaticParams. Uses a cookie-less client
 * because cookies() is not available during static generation.
 */
export async function getCategorySlugsForStaticParams(): Promise<
  { slug: string }[]
> {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("categories")
    .select("slug")
    .eq("is_active", true);
  return (data ?? []).map((c) => ({ slug: c.slug }));
}

/** All active categories, ordered for navigation (Server Components). */
export async function getActiveCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Single category by slug. */
export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

/** All categories incl. inactive (admin listing). */
export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
