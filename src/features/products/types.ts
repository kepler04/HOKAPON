import type {
  Product,
  ProductImage,
  Category,
} from "@/types/database.types";

export type { Product, ProductImage } from "@/types/database.types";

/** A product with its images and (optionally) its category joined. */
export interface ProductWithRelations extends Product {
  product_images: ProductImage[];
  categories: Category | null;
}

/** Lightweight product shape used in grids/cards. */
export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  stock: number;
  max_per_order: number | null;
  is_featured: boolean;
  imageUrl: string | null;
  categorySlug: string | null;
  categoryName: string | null;
}
