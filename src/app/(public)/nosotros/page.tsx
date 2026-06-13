import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Target,
  ShieldCheck,
  Truck,
  Sparkles,
  Users,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { STORE_NAME, WHATSAPP_PHONE } from "@/lib/constants";
import { Container } from "@/components/shared/container";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description: `Conoce a ${STORE_NAME}: quiénes somos, nuestra misión y por qué comprar con nosotros.`,
};

const waUrl = `https://wa.me/${WHATSAPP_PHONE.replace(/\D/g, "")}`;

const values = [
  {
    icon: ShieldCheck,
    title: "Productos originales",
    desc: "Trabajamos solo con productos auténticos y de calidad comprobada.",
  },
  {
    icon: Truck,
    title: "Envíos a todo el Perú",
    desc: "Llegamos a donde estés, de forma rápida y segura.",
  },
  {
    icon: Heart,
    title: "Atención cercana",
    desc: "Te acompañamos por WhatsApp antes, durante y después de tu compra.",
  },
  {
    icon: Sparkles,
    title: "Precios justos",
    desc: "Buena relación precio-calidad, con ofertas reales.",
  },
];

const stats = [
  { value: "[+1000]", label: "Pedidos entregados" },
  { value: "[24 h]", label: "Tiempo de respuesta" },
  { value: "Perú 🇵🇪", label: "Envíos a todo el país" },
];

export default function AboutPage() {
  return (
    <Container className="py-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-primary px-6 py-16 text-center text-primary-foreground sm:px-10">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/25 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
            <Users className="h-4 w-4" /> Quiénes somos
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Somos <span className="text-accent">{STORE_NAME}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/75">
            Tu tienda peruana de tecnología, gaming, hogar, moda, juguetes y más
            — todo en un solo lugar, con atención cercana y envíos a todo el
            país.
          </p>
        </div>
      </section>

      {/* Story + Mission */}
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl font-extrabold">
            Nuestra historia
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            [Cuenta aquí cómo nació {STORE_NAME}: el año, la idea que lo inició y
            qué te motivó a emprender.] Empezamos con la idea de acercar
            productos de calidad a más peruanos, con un trato honesto y directo.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            [Agrega un párrafo sobre cómo has crecido y qué te diferencia hoy.]
            Hoy seguimos con el mismo compromiso: que cada compra sea una buena
            experiencia.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-border bg-card p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
              <Target className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold">Misión</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ofrecer productos originales y útiles, con precios justos y una
              atención que haga sentir a cada cliente acompañado.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
              <Sparkles className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold">Visión</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              [Describe a dónde quieres llegar: ser la tienda preferida en tu
              rubro, expandir cobertura, etc.]
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-3xl border border-border bg-card p-6 text-center"
          >
            <p className="font-display text-3xl font-extrabold text-accent">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Values */}
      <section className="mt-12">
        <h2 className="text-center font-display text-2xl font-extrabold">
          Por qué comprar con nosotros
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-3xl border border-border bg-card p-6"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-8 py-14 text-center text-primary-foreground">
          <div className="dot-grid absolute inset-0 opacity-15" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              ¿Listo para comprar con {STORE_NAME}?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/75">
              Explora nuestros productos o escríbenos por WhatsApp. Estamos para
              ayudarte.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_hsl(351_84%_49%/0.7)] transition-transform hover:brightness-105"
              >
                Ver productos <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5b]"
              >
                <MessageCircle className="h-5 w-5" /> Escríbenos
              </a>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
