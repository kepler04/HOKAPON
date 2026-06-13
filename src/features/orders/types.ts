import type {
  Order,
  OrderItem,
  Payment,
  OrderStatus,
  PaymentStatus,
} from "@/types/database.types";

export type {
  Order,
  OrderItem,
  Payment,
  OrderStatus,
  PaymentStatus,
} from "@/types/database.types";

/** An order with its line items joined. */
export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

/** Full order detail (items + payments) for the admin detail page. */
export interface OrderDetail extends Order {
  order_items: OrderItem[];
  payments: Payment[];
}

/** Filters for the admin orders table. */
export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  action?: "needs_action";
}

/** One line item that lacks enough current stock to fulfil the order. */
export interface StockShortage {
  productId: string;
  productName: string;
  requested: number;
  available: number;
  missing: number;
}

/**
 * Whether an order can be fulfilled with current stock.
 * `alreadyCommitted` is true when stock was already decremented for this order
 * (so the check no longer applies). `shortages` lists products short on stock.
 */
export interface OrderStockStatus {
  alreadyCommitted: boolean;
  shortages: StockShortage[];
}
