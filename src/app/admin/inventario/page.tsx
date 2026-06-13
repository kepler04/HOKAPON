import { getStockMovements } from "@/features/inventory/queries";
import { getAllProductsAdmin } from "@/features/products/queries";
import { MovementsTable } from "@/features/inventory/components/movements-table";
import { MovementForm } from "@/features/inventory/components/movement-form";

export default async function InventoryPage() {
  const [movements, products] = await Promise.all([
    getStockMovements(),
    getAllProductsAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Inventario</h1>
          <p className="text-muted-foreground">
            Entradas y salidas de todos los productos
          </p>
        </div>
        <MovementForm
          products={products.map((p) => ({ id: p.id, name: p.name }))}
        />
      </div>

      <MovementsTable movements={movements} showProduct />
    </div>
  );
}
