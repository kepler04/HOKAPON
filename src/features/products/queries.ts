import "server-only";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { ProductCardData, ProductWithRelations } from "./types";

/**
 * Read-side data access for products (Server Components).
 * Public reads are governed by RLS (only active products are visible to anon).
 *
 * Implementations are filled in during Fase 2. Signatures are defined now so
 * pages can be wired against a stable API.
 */

const PRODUCTS_BUCKET = STORAGE_BUCKETS.PRODUCTS;

type CategoryRefItem = { slug: string; name?: string };
type CategoryRef = CategoryRefItem | CategoryRefItem[] | null;

/** Normalize a Supabase embedded relation that may be object or array. */
function categoryOf(categories: CategoryRef): CategoryRefItem | null {
  if (!categories) return null;
  if (Array.isArray(categories)) return categories[0] ?? null;
  return categories;
}

/** Map a raw product row + its primary image into card data. */
function toCardData(p: {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  stock: number;
  is_featured: boolean;
  product_images?: { url: string; is_primary: boolean }[] | null;
  categories?: CategoryRef;
  supabaseUrl: string;
}): ProductCardData {
  const primary =
    p.product_images?.find((i) => i.is_primary) ?? p.product_images?.[0];
  const imageUrl = primary
    ? `${p.supabaseUrl}/storage/v1/object/public/${PRODUCTS_BUCKET}/${primary.url}`
    : null;
  const cat = categoryOf(p.categories ?? null);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compare_price: p.compare_price,
    stock: p.stock,
    is_featured: p.is_featured,
    imageUrl,
    categorySlug: cat?.slug ?? null,
    categoryName: cat?.name ?? null,
  };
}

/** Featured products for the home page. */
export async function getFeaturedProducts(
  limit = 8,
): Promise<ProductCardData[]> {
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,slug,price,compare_price,stock,is_featured,categories(slug,name),product_images(url,is_primary)",
    )
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((p) => toCardData({ ...p, supabaseUrl }));
}

/** Catalog listing (optionally filtered by category slug). */
export async function getProducts(opts?: {
  categorySlug?: string;
  limit?: number;
}): Promise<ProductCardData[]> {
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  let query = supabase
    .from("products")
    .select(
      "id,name,slug,price,compare_price,stock,is_featured,categories!inner(slug,name),product_images(url,is_primary)",
    )
    .eq("is_active", true);

  if (opts?.categorySlug) {
    query = query.eq("categories.slug", opts.categorySlug);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 50);

  if (error) throw error;
  return (data ?? []).map((p) => toCardData({ ...p, supabaseUrl }));
}

/** Single product detail by slug (with images + category). */
export async function getProductBySlug(
  slug: string,
): Promise<ProductWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*,product_images(*),categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return (data as ProductWithRelations | null) ?? null;
}

/** Admin: list ALL products (incl. inactive) with category + image count. */
export async function getAllProductsAdmin(): Promise<
  {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    is_active: boolean;
    is_featured: boolean;
    category_name: string | null;
    image_count: number;
  }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,slug,price,stock,is_active,is_featured,categories(name),product_images(id)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((p) => {
    const cat = Array.isArray(p.categories) ? p.categories[0] : p.categories;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      stock: p.stock,
      is_active: p.is_active,
      is_featured: p.is_featured,
      category_name: cat?.name ?? null,
      image_count: p.product_images?.length ?? 0,
    };
  });
}

/** Admin: full product by id for the edit form (with images). */
export async function getProductByIdAdmin(
  id: string,
): Promise<ProductWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*,product_images(*),categories(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as ProductWithRelations | null) ?? null;
}

/** Full-text search (Spanish) over name + description. */
export async function searchProducts(
  term: string,
): Promise<ProductCardData[]> {
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,slug,price,compare_price,stock,is_featured,categories(slug,name),product_images(url,is_primary)",
    )
    .eq("is_active", true)
    .textSearch("name", term, { type: "websearch", config: "spanish" })
    .limit(50);

  if (error) throw error;
  return (data ?? []).map((p) => toCardData({ ...p, supabaseUrl }));
}
