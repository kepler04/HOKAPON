import "server-only";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { ProductCardData } from "@/features/products/types";

/** Set of product IDs the current user has favorited (empty if not logged in). */
export async function getFavoriteIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", user.id);
  return new Set((data ?? []).map((r) => r.product_id));
}

interface RawFav {
  product_id: string;
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_price: number | null;
    stock: number;
    is_featured: boolean;
    is_active: boolean;
    product_images: { url: string; is_primary: boolean }[] | null;
    categories: { slug: string; name: string } | null;
  } | null;
}

/** The current user's favorite products as card data (newest first). */
export async function getFavoriteProducts(): Promise<ProductCardData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const { data, error } = await supabase
    .from("favorites")
    .select(
      "product_id,products(id,name,slug,price,compare_price,stock,is_featured,is_active,product_images(url,is_primary),categories(slug,name))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as RawFav[])
    .map((row) => row.products)
    .filter((p): p is NonNullable<RawFav["products"]> => !!p && p.is_active)
    .map((p) => {
      const primary =
        p.product_images?.find((i) => i.is_primary) ?? p.product_images?.[0];
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        compare_price: p.compare_price,
        stock: p.stock,
        is_featured: p.is_featured,
        imageUrl: primary
          ? `${base}/storage/v1/object/public/${STORAGE_BUCKETS.PRODUCTS}/${primary.url}`
          : null,
        categorySlug: p.categories?.slug ?? null,
        categoryName: p.categories?.name ?? null,
      };
    });
}

/** Count of favorites for the current user. */
export async function getFavoriteCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from("favorites")
    .select("product_id", { count: "exact", head: true })
    .eq("user_id", user.id);
  return count ?? 0;
}
