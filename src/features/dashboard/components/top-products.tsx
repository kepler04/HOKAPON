import { Package } from "lucide-react";
import type { TopProduct } from "@/features/dashboard/queries";

/** Best-selling products ranking with proportional bars. */
export function TopProducts({ products }: { products: TopProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="grid place-items-center py-10 text-center text-sm text-muted-foreground">
        <Package className="mb-2 h-8 w-8" />
        Aún no hay ventas registradas.
      </div>
    );
  }

  const max = Math.max(...products.map((p) => p.unitsSold), 1);

  return (
    <ol className="space-y-4">
      {products.map((p, i) => (
        <li key={p.productId ?? p.name} className="flex items-center gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-medium">{p.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {p.unitsSold} {p.unitsSold === 1 ? "vendido" : "vendidos"}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${(p.unitsSold / max) * 100}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
