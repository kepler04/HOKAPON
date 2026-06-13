import type { Category } from "@/types/database.types";

export type { Category } from "@/types/database.types";

/** Category with the count of its active products (for nav badges). */
export interface CategoryWithCount extends Category {
  product_count: number;
}
