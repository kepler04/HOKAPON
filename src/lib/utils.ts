import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes, resolving conflicts (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert a string into a URL-safe slug (handles Spanish accents). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    // Strip combining diacritical marks (U+0300–U+036F).
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
