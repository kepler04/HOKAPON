"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  stockMovementSchema,
  type StockMovementInput,
} from "@/features/inventory/schemas";
import { registerStockMovement } from "@/features/inventory/actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ProductOption {
  id: string;
  name: string;
}

/**
 * Button + modal to register a manual entrada/salida.
 * - General view: pass `products` so the admin picks one.
 * - Per-product view: pass `fixedProduct` to lock the product.
 */
export function MovementForm({
  products,
  fixedProduct,
}: {
  products?: ProductOption[];
  fixedProduct?: ProductOption;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StockMovementInput>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      type: "entrada",
      quantity: 1,
      product_id: fixedProduct?.id ?? "",
      reason: "",
    },
  });

  const type = watch("type");

  function close() {
    setOpen(false);
    reset({
      type: "entrada",
      quantity: 1,
      product_id: fixedProduct?.id ?? "",
      reason: "",
    });
  }

  async function onSubmit(values: StockMovementInput) {
    const r = await registerStockMovement(values);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success(
      values.type === "entrada" ? "Entrada registrada" : "Salida registrada",
    );
    close();
    router.refresh();
  }

  const label = "mb-1.5 block text-sm font-medium";

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-5 w-5" /> Registrar movimiento
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) close();
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">
                Registrar movimiento
              </h2>
              <button
                onClick={close}
                aria-label="Cerrar"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue("type", "entrada")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold transition-colors",
                    type === "entrada"
                      ? "border-mint bg-mint/10 text-mint"
                      : "border-border text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <ArrowDownToLine className="h-4 w-4" /> Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setValue("type", "salida")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold transition-colors",
                    type === "salida"
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <ArrowUpFromLine className="h-4 w-4" /> Salida
                </button>
              </div>

              {/* Product */}
              {fixedProduct ? (
                <div>
                  <span className={label}>Producto</span>
                  <p className="rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm font-medium">
                    {fixedProduct.name}
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="mv-product" className={label}>
                    Producto
                  </label>
                  <select
                    id="mv-product"
                    {...register("product_id")}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Selecciona un producto…</option>
                    {(products ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {errors.product_id && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.product_id.message}
                    </p>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div>
                <label htmlFor="mv-qty" className={label}>
                  Cantidad
                </label>
                <Input
                  id="mv-qty"
                  type="number"
                  min="1"
                  {...register("quantity")}
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label htmlFor="mv-reason" className={label}>
                  Motivo <span className="text-muted-foreground">(opcional)</span>
                </label>
                <Textarea
                  id="mv-reason"
                  rows={2}
                  placeholder={
                    type === "entrada"
                      ? "Ej. Compra de mercadería"
                      : "Ej. Merma / ajuste"
                  }
                  {...register("reason")}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Guardando…
                  </>
                ) : (
                  "Guardar movimiento"
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
