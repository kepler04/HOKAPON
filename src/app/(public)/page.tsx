import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones,
  ShoppingCart,
  PackageSearch,
} from "lucide-react";
import { getProducts } from "@/features/products/queries";
import { getActiveCategories } from "@/features/categories/queries";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/features/products/components/product-grid";
import { CategoryShowcase } from "@/features/categories/components/category-showcase";
import { TrustBar } from "@/components/layout/trust-bar";
import {
  HeroCarousel,
  type HeroSlide,
} from "@/features/products/components/hero-carousel";

// Hero banners. Pon tus imágenes en `public/hero/` con los nombres
// banner-1/2/3 (ver public/hero/README.md). Mientras un archivo no exista, se
// muestra el degradado de respaldo. El texto se superpone sobre la imagen.
const HERO_SLIDES: HeroSlide[] = [
  {
    image: "/hero/banner-1.png",
    titleTop: "Tecnología",
    titleAccent: "sin",
    titleEnd: "límites",
    subtitle: "EQUIPOS.\nACCESORIOS.\nEXPERIENCIA.",
    ctaLabel: "Ver productos",
    ctaHref: "/productos",
    gradient: "linear-gradient(120deg,#0a0f1f 0%,#1a1240 55%,#3a1230 100%)",
  },
  {
    image: "/hero/banner-2.png",
    titleTop: "Lo mejor para",
    titleAccent: "tus",
    titleEnd: "peques",
    subtitle: "ROPA · JUGUETES · ACCESORIOS",
    ctaLabel: "Explorar ahora",
    ctaHref: "/productos",
    gradient: "linear-gradient(120deg,#0a1f1a 0%,#10402f 55%,#123a30 100%)",
  },
  {
    image: "/hero/banner-3.png",
    titleTop: "Ofertas que",
    titleAccent: "no",
    titleEnd: "esperan",
    subtitle: "DESCUENTOS POR TIEMPO LIMITADO",
    ctaLabel: "Ver ofertas",
    ctaHref: "/productos",
    gradient: "linear-gradient(120deg,#1f0a14 0%,#401024 55%,#3a1212 100%)",
  },
];

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getProducts({ limit: 8 }),
    getActiveCategories(),
  ]);

  return (
    <>
      {/* ---------------- HERO CAROUSEL ---------------- */}
      <Container className="pt-6">
        <HeroCarousel slides={HERO_SLIDES} />
      </Container>

      {/* ---------------- TRUST BAR ---------------- */}
      <Container className="mt-10">
        <TrustBar />
      </Container>

      {/* ---------------- CATEGORIES SHOWCASE ---------------- */}
      {categories.length > 0 && (
        <Container className="mt-16">
          <CategoryShowcase categories={categories} />
        </Container>
      )}

      {/* ---------------- NUEVOS INGRESOS ---------------- */}
      <Container className="mt-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-none">
              NUEVOS <span className="text-accent">INGRESOS</span>
            </h2>
            <span className="mt-2 block h-1 w-12 rounded-full bg-accent" />
            <p className="mt-3 max-w-xl text-muted-foreground">
              Lo último en tecnología, gaming y más. Descubre lo nuevo en{" "}
              <span className="font-bold text-accent">HOKAPON.</span>
            </p>
          </div>
          <Link
            href="/productos"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ProductGrid products={featured} />

        {/* Guarantees row */}
        <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6 md:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "Garantía oficial", d: "Productos 100% originales" },
            { icon: Truck, t: "Envíos a todo Perú", d: "Rápido y seguro" },
            { icon: CreditCard, t: "Pagos seguros", d: "Yape, Plin, tarjetas y más" },
            { icon: Headphones, t: "Atención por WhatsApp", d: "Te ayudamos en lo que necesites" },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex items-center gap-3">
              <Icon className="h-7 w-7 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-bold">{t}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* ---------------- CTA BANNER (2 columns) ---------------- */}
      <Container className="mt-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0e1a] px-6 py-12 text-primary-foreground sm:px-10 lg:px-16">
          <div className="dot-grid absolute inset-0 opacity-10" aria-hidden />
          {/* red ambient glow */}
          <div
            className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl"
            aria-hidden
          />

          <div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto_1fr]">
            {/* Left: comprar */}
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-white/[0.03] text-accent ring-1 ring-accent/40 shadow-[0_0_40px_-8px_hsl(351_84%_49%/0.6)]">
                <ShoppingCart className="h-9 w-9" />
              </span>
              <h2 className="mt-6 font-display text-3xl font-extrabold sm:text-4xl">
                ¿Listo para comprar?
              </h2>
              <p className="mt-3 max-w-xs text-primary-foreground/70">
                Elige tus productos y arma tu pedido en minutos. Fácil, rápido y
                seguro.
              </p>
              <Button asChild size="lg" className="mt-7">
                <Link href="/productos">
                  Empezar compra <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Vertical divider with center dot */}
            <div
              className="relative mx-auto hidden h-full w-px self-stretch bg-gradient-to-b from-transparent via-accent/50 to-transparent md:block"
              aria-hidden
            >
              <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_2px_hsl(351_84%_49%/0.8)]" />
            </div>

            {/* Right: seguimiento */}
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-white/[0.03] text-primary-foreground ring-1 ring-white/15">
                <PackageSearch className="h-9 w-9" />
              </span>
              <h2 className="mt-6 font-display text-3xl font-extrabold sm:text-4xl">
                Sigue tu pedido
              </h2>
              <p className="mt-3 max-w-xs text-primary-foreground/70">
                Revisa el estado de tu compra y coordina tu entrega fácilmente.
              </p>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="mt-7 border-accent bg-transparent text-primary-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/seguimiento">
                  Ver seguimiento <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
