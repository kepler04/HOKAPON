import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { getAllProductsAdmin } from "@/features/products/queries";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductRowActions } from "@/features/products/components/product-row-actions";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">{products.length} en total</p>
        </div>
        <Button asChild>
          <Link href="/admin/productos/nuevo">
            <Plus className="h-5 w-5" /> Nuevo producto
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border-2 border-dashed border-border py-16 text-center">
          <Package className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-display text-lg font-semibold">Sin productos</p>
          <p className="text-sm text-muted-foreground">Crea tu primer producto.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Producto</th>
                <th className="px-5 py-3 font-medium">Categoría</th>
                <th className="px-5 py-3 font-medium">Precio</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="font-semibold hover:text-accent"
                    >
                      {p.name}
                    </Link>
                    {p.is_featured && (
                      <Badge tone="accent" className="ml-2 align-middle">
                        Destacado
                      </Badge>
                    )}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {p.image_count} 📷
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {p.category_name ?? "—"}
                  </td>
                  <td className="px-5 py-3 font-medium">{formatPrice(p.price)}</td>
                  <td className="px-5 py-3">
                    <span className={p.stock <= 5 ? "text-destructive" : ""}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {p.is_active ? (
                      <Badge tone="mint">Activo</Badge>
                    ) : (
                      <Badge tone="neutral">Inactivo</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <ProductRowActions id={p.id} isActive={p.is_active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
