import type { StockMovement, StockMovementType } from "@/types/database.types";

export type { StockMovement, StockMovementType } from "@/types/database.types";

/** A movement joined with its product name (and order number if from a sale). */
export interface StockMovementRow extends StockMovement {
  product_name: string;
  order_number: string | null;
}
