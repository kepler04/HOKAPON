import { ORDER_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/features/orders/types";

const colorClasses: Record<string, string> = {
  gray: "bg-secondary text-secondary-foreground",
  amber: "bg-sun/20 text-[hsl(38_90%_36%)]",
  blue: "bg-blue-100 text-blue-700",
  violet: "bg-violet-100 text-violet-700",
  indigo: "bg-indigo-100 text-indigo-700",
  green: "bg-mint/15 text-mint",
  red: "bg-destructive/10 text-destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUSES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
        colorClasses[meta.color] ?? colorClasses.gray,
      )}
    >
      {meta.label}
    </span>
  );
}
