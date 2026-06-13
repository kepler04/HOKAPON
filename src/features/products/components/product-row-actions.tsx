"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { setProductActive, deleteProduct } from "@/features/products/actions";

export function ProductRowActions({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const r = await setProductActive(id, !isActive);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(isActive ? "Producto desactivado" : "Producto activado");
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer."))
      return;
    startTransition(async () => {
      const r = await deleteProduct(id);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Producto eliminado");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/productos/${id}`}
        aria-label="Editar"
        title="Editar"
        className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        onClick={toggle}
        disabled={isPending}
        aria-label={isActive ? "Desactivar" : "Activar"}
        title={isActive ? "Desactivar" : "Activar"}
        className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
      <button
        onClick={remove}
        disabled={isPending}
        aria-label="Eliminar"
        title="Eliminar"
        className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
