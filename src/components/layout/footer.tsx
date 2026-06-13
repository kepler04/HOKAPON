import Link from "next/link";
import Image from "next/image";
import {
  Truck,
  ShieldCheck,
  MessageCircle,
  Zap,
  ChevronRight,
  Facebook,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  Package,
  RotateCcw,
  Headphones,
} from "lucide-react";
import { STORE_NAME, WHATSAPP_PHONE } from "@/lib/constants";
import { Container } from "@/components/shared/container";

const benefits = [
  { icon: Truck, t: "Envíos a todo Perú", d: "Llegamos a donde estés" },
  { icon: ShieldCheck, t: "Compra 100% segura", d: "Protegemos tus datos" },
  { icon: MessageCircle, t: "Atención por WhatsApp", d: "Te ayudamos al instante" },
  { icon: Zap, t: "Entrega rápida", d: "Productos en tiempo récord" },
];

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Comprar",
    links: [
      { label: "Tecnología", href: "/categorias/tecnologia" },
      { label: "Gaming", href: "/categorias/gaming" },
      { label: "Hogar", href: "/categorias/hogar" },
      { label: "Ropa", href: "/categorias/ropa" },
      { label: "Juguetes", href: "/categorias/jugetes" },
      { label: "Accesorios", href: "/categorias/accesorios" },
      { label: "Ofertas", href: "/productos" },
      { label: "Nuevos ingresos", href: "/productos" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Centro de ayuda", href: "#" },
      { label: "Preguntas frecuentes", href: "#" },
      { label: "Seguimiento de pedido", href: "/seguimiento" },
      { label: "Cambios y devoluciones", href: "#" },
      { label: "Garantías", href: "#" },
      { label: "Términos y condiciones", href: "#" },
      { label: "Políticas de privacidad", href: "#" },
    ],
  },
  {
    title: "HOKAPON",
    links: [
      { label: "Quiénes somos", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Trabaja con nosotros", href: "#" },
      { label: "Términos y condiciones", href: "#" },
      { label: "Políticas de privacidad", href: "#" },
    ],
  },
];

const socials = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

const payments = [
  { name: "Yape", src: "/pagos/yape.png" },
  { name: "Plin", src: "/pagos/plin.png" },
  { name: "BBVA", src: "/pagos/bbva.png" },
  { name: "BCP", src: "/pagos/bcp.webp" },
];

const guarantees = [
  { icon: BadgeCheck, t: "Productos originales", d: "Garantía de fábrica" },
  { icon: Package, t: "Garantía asegurada", d: "Todos nuestros productos" },
  { icon: RotateCcw, t: "Devoluciones fáciles", d: "Sin complicaciones" },
  { icon: Headphones, t: "Soporte dedicado", d: "Estamos para ayudarte" },
];

export function Footer() {
  const waUrl = `https://wa.me/${WHATSAPP_PHONE.replace(/\D/g, "")}`;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      {/* Red top line */}
      <div className="h-1 bg-accent" />

      {/* Benefits bar */}
      <Container className="border-b border-white/10 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 text-accent">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-bold">{t}</p>
                <p className="text-xs text-primary-foreground/60">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Main block */}
      <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        {/* Brand */}
        <div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-3xl font-extrabold text-accent">
              HOKAPON
            </span>
            <span className="mt-1 flex items-center gap-1.5">
              <span className="h-px w-6 bg-accent/60" />
              <span className="text-[10px] font-semibold tracking-[0.3em] text-primary-foreground/60">
                PERÚ
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-primary-foreground/70">
            Tecnología, gaming, hogar, moda, juguetes y mucho más en un solo
            lugar.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1ebe5b]"
          >
            <MessageCircle className="h-5 w-5" /> Escríbenos por WhatsApp
          </a>
          <div className="mt-5 flex gap-2">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 transition-colors hover:bg-accent"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide">
              {col.title}
              <span className="mt-2 block h-0.5 w-8 rounded-full bg-accent" />
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 text-primary-foreground/70 transition-colors hover:text-accent"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-accent" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wide">
            Contáctanos
            <span className="mt-2 block h-0.5 w-8 rounded-full bg-accent" />
          </h4>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold">{WHATSAPP_PHONE_DISPLAY}</p>
                <p className="text-xs text-primary-foreground/60">
                  Lun - Dom: 8am - 10pm
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold">hola@hokapon.com.pe</p>
                <p className="text-xs text-primary-foreground/60">
                  Te respondemos rápido
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold">Lima, Perú</p>
                <p className="text-xs text-primary-foreground/60">
                  Envíos a todo el país
                </p>
              </div>
            </li>
          </ul>
        </div>
      </Container>

      {/* Payments + guarantees */}
      <Container className="grid gap-8 border-t border-white/10 py-8 lg:grid-cols-[auto_1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">
            Métodos de pago
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {payments.map((p) => (
              <span
                key={p.name}
                className="relative grid h-12 w-20 place-items-center rounded-lg bg-white p-2 shadow-sm"
                title={p.name}
              >
                <Image
                  src={p.src}
                  alt={p.name}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:border-l lg:border-white/10 lg:pl-8">
          {guarantees.map(({ icon: Icon, t, d }) => (
            <div key={t} className="text-center">
              <Icon className="mx-auto h-7 w-7 text-accent" />
              <p className="mt-2 text-sm font-bold">{t}</p>
              <p className="text-xs text-primary-foreground/60">{d}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-black/20">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-primary-foreground/60 sm:flex-row">
          <p>
            © {year} <span className="font-bold text-accent">HOKAPON</span> PERÚ.
            Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-accent">
              Términos y condiciones
            </Link>
            <span className="h-3 w-px bg-white/20" />
            <Link href="#" className="hover:text-accent">
              Políticas de privacidad
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}

// Pretty phone for display (the env stores digits only, e.g. 51948792314).
const WHATSAPP_PHONE_DISPLAY = (() => {
  const digits = WHATSAPP_PHONE.replace(/\D/g, "");
  if (digits.startsWith("51") && digits.length === 11) {
    const n = digits.slice(2);
    return `+51 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
  }
  return WHATSAPP_PHONE ? `+${digits}` : "+51 999 999 999";
})();
