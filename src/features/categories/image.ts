import { STORAGE_BUCKETS } from "@/lib/constants";

/**
 * Public URL for a category image path stored in the category-images bucket.
 * `path` is the value stored in categories.image_url (e.g. "<id>/<uuid>.webp").
 */
export function categoryImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${STORAGE_BUCKETS.CATEGORIES}/${path}`;
}
