import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProductMovements } from "@/features/inventory/queries";
import { getProductByIdAdmin } from "@/features/products/queries";
import { MovementsTable } from "@/features/inventory/components/movements-table";
import { MovementForm } from "@/features/inventory/components/movement-form";

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function ProductInventoryPage({ params }: Props) {
  const { productId } = await params;
  const product = await getProductByIdAdmin(productId);
  if (!product) notFound();

  const movements = await getProductMovements(productId);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inventario"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Inventario
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">
            Stock actual:{" "}
            <span
              className={
                product.stock < 0
                  ? "font-bold text-destructive"
                  : "font-bold text-foreground"
              }
            >
              {product.stock}
            </span>
          </p>
        </div>
        <MovementForm fixedProduct={{ id: product.id, name: product.name }} />
      </div>

      <MovementsTable movements={movements} showProduct={false} />
    </div>
  );
}
