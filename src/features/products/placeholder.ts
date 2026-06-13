/**
 * Visual placeholder for products without an uploaded image.
 * Maps a category slug (or product name keyword) to an emoji + gradient so the
 * demo looks intentional until real images are added in Fase 4.
 */
const THEMES: Record<string, { emoji: string; from: string; to: string }> = {
  "ropa-ninos": { emoji: "👕", from: "#FDE7D2", to: "#F7C9A8" },
  juguetes: { emoji: "🧸", from: "#D9F2E6", to: "#A8E6CF" },
  accesorios: { emoji: "🎒", from: "#FCE1EC", to: "#F4B7CE" },
  calzado: { emoji: "👟", from: "#E5E8FF", to: "#C4CBFF" },
};

const DEFAULT_THEME = { emoji: "🛍️", from: "#FDEFD9", to: "#F7D9B0" };

export function getProductPlaceholder(categorySlug?: string | null) {
  if (categorySlug && THEMES[categorySlug]) return THEMES[categorySlug];
  return DEFAULT_THEME;
}
