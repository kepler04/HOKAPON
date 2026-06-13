import type {
  Order,
  OrderItem,
  Payment,
  OrderStatus,
} from "@/types/database.types";

export type {
  Order,
  OrderItem,
  Payment,
  OrderStatus,
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
}
