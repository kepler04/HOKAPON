import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceProps {
  value: number;
  comparePrice?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
};

/** Price display with optional struck-through compare price + discount badge. */
export function Price({
  value,
  comparePrice,
  className,
  size = "md",
}: PriceProps) {
  const hasDiscount = comparePrice != null && comparePrice > value;
  const discount = hasDiscount
    ? Math.round((1 - value / (comparePrice as number)) * 100)
    : 0;

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn("font-display font-semibold text-foreground", sizes[size])}
      >
        {formatPrice(value)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(comparePrice as number)}
          </span>
          <span className="rounded-full bg-mint/15 px-2 py-0.5 text-xs font-bold text-mint">
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}
