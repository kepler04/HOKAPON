"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  alt: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  name: string;
  placeholder: { emoji: string; from: string; to: string };
}

/** Image gallery with thumbnail selection, falls back to a themed placeholder. */
export function ProductGallery({
  images,
  name,
  placeholder,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className="flex aspect-square w-full items-center justify-center rounded-[2rem] border border-border"
        style={{
          backgroundImage: `linear-gradient(135deg, ${placeholder.from}, ${placeholder.to})`,
        }}
      >
        <span className="text-[8rem]">{placeholder.emoji}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border bg-card">
        <Image
          src={images[active].url}
          alt={images[active].alt ?? name}
          fill
          sizes="(max-width:1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-colors",
                i === active ? "border-accent" : "border-border",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${name} ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
