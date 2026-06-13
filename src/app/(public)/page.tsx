import Link from "next/link";
import { ArrowRight, ShieldCheck, MessageCircle, Truck } from "lucide-react";
import { getFeaturedProducts } from "@/features/products/queries";
import { getActiveCategories } from "@/features/categories/queries";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/features/products/components/product-grid";
import { CategoryCard } from "@/features/categories/components/category-card";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(8),
    getActiveCategories(),
  ]);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-60" aria-hidden />
        <Container className="relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          <div className="animate-rise">
            <Badge tone="sun" className="mb-5">
              ✨ Nueva temporada
            </Badge>
            <h1 className="text-balance text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Todo para los{" "}
              <span className="relative whitespace-nowrap text-accent">
                peques
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 9C40 3 160 3 198 9"
                    stroke="hsl(var(--accent))"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              en un solo lugar
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Ropa, juguetes y accesorios seleccionados con cariño. Paga con
              Yape, Plin o transferencia y coordinamos por WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/productos">
                  Ver productos <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/categorias/juguetes">Explorar juguetes</Link>
              </Button>
            </div>
          </div>

          {/* Playful floating tiles collage */}
          <div className="relative hidden h-[420px] md:block">
            <div
              className="animate-float absolute left-6 top-4 grid h-40 w-40 place-items-center rounded-[2rem] text-7xl shadow-xl"
              style={{ background: "linear-gradient(135deg,#FDE7D2,#F7C9A8)", animationDelay: "0s" }}
            >
              👕
            </div>
            <div
              className="animate-float absolute right-4 top-16 grid h-44 w-44 place-items-center rounded-[2rem] text-7xl shadow-xl"
              style={{ background: "linear-gradient(135deg,#D9F2E6,#A8E6CF)", animationDelay: "1.2s" }}
            >
              🧸
            </div>
            <div
              className="animate-float absolute bottom-6 left-16 grid h-44 w-44 place-items-center rounded-[2rem] text-7xl shadow-xl"
              style={{ background: "linear-gradient(135deg,#FCE1EC,#F4B7CE)", animationDelay: "0.6s" }}
            >
              🎒
            </div>
            <div
              className="animate-float absolute bottom-12 right-12 grid h-36 w-36 place-items-center rounded-[2rem] text-6xl shadow-xl"
              style={{ background: "linear-gradient(135deg,#E5E8FF,#C4CBFF)", animationDelay: "1.8s" }}
            >
              👟
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- TRUST STRIP ---------------- */}
      <Container>
        <div className="grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-3">
          {[
            { icon: MessageCircle, t: "Atención por WhatsApp", d: "Te ayudamos en cada paso" },
            { icon: ShieldCheck, t: "Pago seguro", d: "Yape, Plin o transferencia" },
            { icon: Truck, t: "Coordinamos entrega", d: "Rápido y a tu medida" },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* ---------------- CATEGORIES ---------------- */}
      {categories.length > 0 && (
        <Container className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold sm:text-3xl">Explora por categoría</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </Container>
      )}

      {/* ---------------- FEATURED ---------------- */}
      <Container className="mt-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <Badge tone="accent" className="mb-2">
              Lo más querido
            </Badge>
            <h2 className="text-2xl font-bold sm:text-3xl">Productos destacados</h2>
          </div>
          <Link
            href="/productos"
            className="hidden items-center gap-1 text-sm font-semibold text-accent hover:underline sm:flex"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={featured} />
      </Container>

      {/* ---------------- CTA BANNER ---------------- */}
      <Container className="mt-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-8 py-14 text-center text-primary-foreground">
          <div className="dot-grid absolute inset-0 opacity-20" aria-hidden />
          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">
              ¿Listo para comprar?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/70">
              Arma tu pedido en minutos. Sin registro, sin complicaciones.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/productos">
                Empezar a comprar <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
