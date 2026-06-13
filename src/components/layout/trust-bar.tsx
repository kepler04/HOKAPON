import Link from "next/link";
import {
  MessageCircle,
  ShieldCheck,
  Truck,
  ArrowRight,
  BadgeCheck,
  RotateCcw,
  Package,
  Heart,
} from "lucide-react";
import { WHATSAPP_PHONE } from "@/lib/constants";

const features = [
  {
    icon: MessageCircle,
    title: "Atención por WhatsApp",
    desc: "Te ayudamos en cada paso\nde tu compra.",
    cta: "Escribir ahora",
    href: `https://wa.me/${WHATSAPP_PHONE.replace(/\D/g, "")}`,
    external: true,
  },
  {
    icon: ShieldCheck,
    title: "Pago seguro",
    desc: "Yape, Plin o transferencia.\nTu compra 100% protegida.",
    cta: "Más información",
    href: "/productos",
    external: false,
  },
  {
    icon: Truck,
    title: "Coordinamos entrega",
    desc: "Rápido, seguro y\na tu medida.",
    cta: "Conocer más",
    href: "/productos",
    external: false,
  },
];

const microFeatures = [
  { icon: BadgeCheck, label: "Productos de calidad" },
  { icon: RotateCcw, label: "Devoluciones fáciles" },
  { icon: Package, label: "Garantía en todos los productos" },
  { icon: Heart, label: "Miles de clientes confían en HOKAPON" },
];

/** Trust/benefits bar: red top line, icon+CTA blocks, micro-features row. */
export function TrustBar() {
  return (
    <div>
      {/* Red separator line */}
      <div className="h-1 rounded-full bg-accent" />

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        {/* Main blocks */}
        <div className="grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
          {features.map(({ icon: Icon, title, desc, cta, href, external }) => (
            <div
              key={title}
              className="flex items-start gap-4 md:px-6 md:first:pl-0 md:last:pr-0"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold">{title}</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                  {desc}
                </p>
                <Link
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-bold text-accent transition-colors hover:bg-accent/20"
                >
                  {cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-border" />

        {/* Micro features */}
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          {microFeatures.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-5 w-5 shrink-0 text-accent" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
