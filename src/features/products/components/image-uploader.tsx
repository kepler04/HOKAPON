"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  uploadProductImage,
  deleteProductImage,
} from "@/features/products/actions";
import { STORAGE_BUCKETS } from "@/lib/constants";

interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
}

function publicUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${STORAGE_BUCKETS.PRODUCTS}/${path}`;
}

export function ImageUploader({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
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
    const result = await uploadProductImage(productId, fd);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Imagen subida");
    router.refresh();
  }

  function onDelete(imageId: string) {
    startTransition(async () => {
      const result = await deleteProductImage(imageId, productId);
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
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-border"
          >
            <Image
              src={publicUrl(img.url)}
              alt=""
              fill
              sizes="120px"
              className="object-cover"
            />
            {img.is_primary && (
              <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                <Star className="h-3 w-3" /> Principal
              </span>
            )}
            <button
              onClick={() => onDelete(img.id)}
              disabled={isPending}
              aria-label="Eliminar imagen"
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-foreground/70 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Upload tile */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-medium">Subir</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onFileChange}
        className="hidden"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        JPG, PNG, WEBP o AVIF · máx. 5 MB. La primera imagen es la principal.
      </p>
    </div>
  );
}
