"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  /** Optional background image URL. If absent, the gradient is shown. */
  image?: string;
  /** First line of the title (white). */
  titleTop: string;
  /** Accent word (red), rendered inline after titleTop. */
  titleAccent?: string;
  /** Rest of the title after the accent word. */
  titleEnd?: string;
  /** Small uppercase tagline under the title. */
  subtitle?: string;
  /** CTA label + href. */
  ctaLabel: string;
  ctaHref: string;
  /** Fallback gradient (CSS) when there's no image. */
  gradient: string;
}

const AUTO_MS = 5000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  // Slides whose image failed to load (e.g. file not uploaded yet) fall back
  // to the gradient instead of showing a broken image.
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const count = slides.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  // Auto-rotate; pauses are handled by resetting the timer on index change.
  useEffect(() => {
    if (count <= 1) return;
    const t = setTimeout(() => go(index + 1), AUTO_MS);
    return () => clearTimeout(t);
  }, [index, count, go]);

  return (
    <section>
      {/* Banner image (arrows overlaid) */}
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => {
            const showImage = slide.image && !failed[i];
            return (
            <div
              key={i}
              className="relative aspect-[16/7] min-h-[320px] w-full shrink-0"
              style={!showImage ? { backgroundImage: slide.gradient } : undefined}
            >
              {showImage && (
                <Image
                  src={slide.image as string}
                  alt={`${slide.titleTop} ${slide.titleAccent ?? ""}`}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                  onError={() => setFailed((f) => ({ ...f, [i]: true }))}
                />
              )}
              {/* Dark overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-14 lg:px-20">
                <h2 className="max-w-2xl font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">
                  {slide.titleTop}{" "}
                  {slide.titleAccent && (
                    <span className="text-accent">{slide.titleAccent}</span>
                  )}{" "}
                  {slide.titleEnd}
                </h2>
                {slide.subtitle && (
                  <p className="mt-5 whitespace-pre-line text-sm font-semibold uppercase tracking-[0.2em] text-white/85 sm:text-base">
                    {slide.subtitle}
                  </p>
                )}
                <Link
                  href={slide.ctaHref}
                  className="group mt-8 inline-flex w-fit items-center gap-2 border-b-2 border-accent pb-1 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:text-accent"
                >
                  {slide.ctaLabel}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            );
          })}
        </div>

        {/* Arrows */}
        {count > 1 && (
          <>
            <button
              onClick={() => go(index - 1)}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/50"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/50"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Controls BELOW the image: dots (left) + "Ver todo" (right) */}
      <div className="mt-4 flex items-center justify-between px-1">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Ir al banner ${i + 1}`}
              className={cn(
                "h-2.5 rounded-full transition-all",
                i === index
                  ? "w-7 bg-accent"
                  : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60",
              )}
            />
          ))}
        </div>
        <Link
          href="/productos"
          className="text-sm font-bold text-accent transition-colors hover:underline"
        >
          Ver todo
        </Link>
      </div>
    </section>
  );
}
