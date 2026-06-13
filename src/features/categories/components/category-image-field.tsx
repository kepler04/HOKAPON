"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  uploadCategoryImage,
  removeCategoryImage,
} from "@/features/categories/actions";
import { categoryImageUrl } from "@/features/categories/image";

/**
 * Single-image upload control for a category (edit mode only).
 * Uploading replaces any existing image; removing clears it.
 */
export function CategoryImageField({
  categoryId,
  imagePath,
}: {
  categoryId: string;
  imagePath: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadCategoryImage(categoryId, fd);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Imagen de categoría actualizada");
    router.refresh();
  }

  function onRemove() {
    startTransition(async () => {
      const result = await removeCategoryImage(categoryId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Imagen eliminada");
      router.refresh();
    });
  }

  return (
    <div>
      {imagePath ? (
        <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-border">
          <Image
            src={categoryImageUrl(imagePath)}
            alt=""
            fill
            sizes="360px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-foreground/70 to-transparent p-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || isPending}
              className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground hover:bg-white disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              Cambiar
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={uploading || isPending}
              className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-destructive hover:bg-white disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" /> Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-medium">Subir imagen</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onFileChange}
        className="hidden"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        JPG, PNG, WEBP o AVIF · máx. 5 MB. Recomendado horizontal (16:9).
      </p>
    </div>
  );
}
