import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { StockMovementRow } from "@/features/inventory/types";

/**
 * Inventory ledger table. Set `showProduct` to false on a per-product view
 * (the product column would be redundant there).
 */
export function MovementsTable({
  movements,
  showProduct = true,
}: {
  movements: StockMovementRow[];
  showProduct?: boolean;
}) {
  if (movements.length === 0) {
    return (
      <div className="grid place-items-center rounded-3xl border-2 border-dashed border-border py-16 text-center">
        <ArrowDownToLine className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-display text-lg font-semibold">Sin movimientos</p>
        <p className="text-sm text-muted-foreground">
          Registra una entrada o salida para empezar.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3 font-medium">Fecha</th>
            {showProduct && <th className="px-5 py-3 font-medium">Producto</th>}
            <th className="px-5 py-3 font-medium">Tipo</th>
            <th className="px-5 py-3 text-right font-medium">Cantidad</th>
            <th className="px-5 py-3 font-medium">Motivo</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => {
            const isIn = m.type === "entrada";
            return (
              <tr key={m.id} className="border-b border-border/60 last:border-0">
                <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                  {formatDate(m.created_at)}
                </td>
                {showProduct && (
                  <td className="px-5 py-3 font-medium">{m.product_name}</td>
                )}
                <td className="px-5 py-3">
                  <span
                    className={
                      isIn
                        ? "inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-2.5 py-1 text-xs font-semibold text-mint"
                        : "inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive"
                    }
                  >
                    {isIn ? (
                      <ArrowDownToLine className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpFromLine className="h-3.5 w-3.5" />
                    )}
                    {isIn ? "Entrada" : "Salida"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-semibold">
                  <span className={isIn ? "text-mint" : "text-destructive"}>
                    {isIn ? "+" : "−"}
                    {m.quantity}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {m.order_number ? (
                    <span>
                      Venta ·{" "}
                      <span className="font-medium text-foreground">
                        {m.order_number}
                      </span>
                    </span>
                  ) : (
                    m.reason || "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
