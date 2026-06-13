import type { Metadata } from "next";
import Link from "next/link";
import {
  LifeBuoy,
  HelpCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  FileText,
  Lock,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { STORE_NAME, WHATSAPP_PHONE } from "@/lib/constants";
import { Container } from "@/components/shared/container";

export const metadata: Metadata = {
  title: "Centro de ayuda",
  description:
    "Preguntas frecuentes, envíos, cambios y devoluciones, garantías, términos y políticas de privacidad.",
};

const waUrl = `https://wa.me/${WHATSAPP_PHONE.replace(/\D/g, "")}`;

// In-page navigation (anchors). Footer links point to these same ids.
const sections = [
  { id: "faq", label: "Preguntas frecuentes", icon: HelpCircle },
  { id: "envios", label: "Envíos", icon: Truck },
  { id: "devoluciones", label: "Cambios y devoluciones", icon: RotateCcw },
  { id: "garantias", label: "Garantías", icon: ShieldCheck },
  { id: "terminos", label: "Términos y condiciones", icon: FileText },
  { id: "privacidad", label: "Políticas de privacidad", icon: Lock },
];

const faqs = [
  {
    q: "¿Cómo hago un pedido?",
    a: "Agrega los productos al carrito, ve a “Pagar” y completa tus datos. Te daremos un número de pedido para coordinar el pago y la entrega.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos Yape, Plin y transferencia bancaria (BBVA y BCP). Tras tu pedido te mostramos los datos para pagar.",
  },
  {
    q: "¿Cómo envío mi comprobante de pago?",
    a: "Después de pagar, envíanos la captura por WhatsApp junto con tu número de pedido y coordinamos el envío.",
  },
  {
    q: "¿Cómo sé en qué estado está mi pedido?",
    a: "Ingresa a la página de Seguimiento con el código que recibiste al comprar y verás el estado actualizado.",
  },
  {
    q: "¿Hacen envíos a todo el Perú?",
    a: "Sí, realizamos envíos a todo el país. El tiempo y costo dependen de tu ubicación; lo coordinamos por WhatsApp.",
  },
];

export default function HelpPage() {
  return (
    <Container className="py-10">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/10 text-accent">
          <LifeBuoy className="h-9 w-9" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">
          Centro de ayuda
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Encuentra respuestas rápidas sobre tus compras en {STORE_NAME}. Si no
          ves lo que buscas, escríbenos por WhatsApp.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sticky in-page nav */}
        <aside className="h-fit lg:sticky lg:top-24">
          <nav className="rounded-3xl border border-border bg-card p-3">
            {sections.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Icon className="h-4 w-4 shrink-0 text-accent" />
                {label}
              </a>
            ))}
          </nav>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1ebe5b]"
          >
            <MessageCircle className="h-5 w-5" /> Escríbenos por WhatsApp
          </a>
        </aside>

        {/* Content */}
        <div className="space-y-10">
          {/* FAQ */}
          <Section id="faq" icon={HelpCircle} title="Preguntas frecuentes">
            <div className="space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-border bg-card p-4 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold">
                    {f.q}
                    <ChevronRight className="h-4 w-4 shrink-0 text-accent transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </Section>

          {/* Envíos */}
          <Section id="envios" icon={Truck} title="Envíos">
            <Prose>
              <p>
                Realizamos envíos a todo el Perú. Una vez confirmado tu pago,
                coordinamos el despacho por WhatsApp.
              </p>
              <ul>
                <li>
                  <b>Cobertura:</b> Lima y provincias [completa con tus zonas].
                </li>
                <li>
                  <b>Tiempo estimado:</b> [X a Y días hábiles] según destino.
                </li>
                <li>
                  <b>Costo de envío:</b> [indica si es gratis desde cierto monto
                  o el costo aproximado].
                </li>
                <li>
                  <b>Empresa de envíos:</b> [Olva / Shalom / motorizado, etc.].
                </li>
              </ul>
            </Prose>
          </Section>

          {/* Devoluciones */}
          <Section
            id="devoluciones"
            icon={RotateCcw}
            title="Cambios y devoluciones"
          >
            <Prose>
              <p>
                Queremos que quedes satisfecho con tu compra. Si necesitas un
                cambio o devolución, escríbenos dentro de los{" "}
                <b>[7] días</b> posteriores a recibir tu pedido.
              </p>
              <ul>
                <li>
                  El producto debe estar sin uso, en su empaque original y con
                  sus accesorios.
                </li>
                <li>
                  Para iniciar el proceso, contáctanos por WhatsApp con tu número
                  de pedido y una foto del producto.
                </li>
                <li>
                  Los costos de envío por cambio [corren por cuenta de … —
                  completa].
                </li>
                <li>
                  No aplican cambios en productos [indica excepciones, p. ej.
                  ofertas finales].
                </li>
              </ul>
            </Prose>
          </Section>

          {/* Garantías */}
          <Section id="garantias" icon={ShieldCheck} title="Garantías">
            <Prose>
              <p>
                Todos nuestros productos son de calidad. La garantía cubre fallas
                de fábrica bajo uso normal.
              </p>
              <ul>
                <li>
                  <b>Periodo de garantía:</b> [X meses] desde la fecha de compra.
                </li>
                <li>
                  La garantía no cubre daños por mal uso, golpes, líquidos o
                  manipulación no autorizada.
                </li>
                <li>
                  Para hacer válida la garantía, conserva tu número de pedido y
                  contáctanos por WhatsApp.
                </li>
              </ul>
            </Prose>
          </Section>

          {/* Términos */}
          <Section id="terminos" icon={FileText} title="Términos y condiciones">
            <Prose>
              <p>
                Al usar {STORE_NAME} y realizar una compra, aceptas estos
                términos. [Revisa y ajusta este texto con tu información legal.]
              </p>
              <ul>
                <li>
                  Los precios están en soles (S/) e incluyen impuestos según
                  corresponda.
                </li>
                <li>
                  Las imágenes son referenciales; puede haber ligeras variaciones
                  de color.
                </li>
                <li>
                  Nos reservamos el derecho de cancelar pedidos ante errores de
                  precio o falta de stock, devolviendo cualquier pago realizado.
                </li>
                <li>
                  Razón social: [tu razón social], RUC [tu RUC], [tu dirección].
                </li>
              </ul>
            </Prose>
          </Section>

          {/* Privacidad */}
          <Section id="privacidad" icon={Lock} title="Políticas de privacidad">
            <Prose>
              <p>
                Cuidamos tus datos. Usamos la información que nos brindas solo
                para procesar tus pedidos y coordinar la entrega.
              </p>
              <ul>
                <li>
                  <b>Datos que recolectamos:</b> nombre, teléfono, correo y datos
                  necesarios para el envío.
                </li>
                <li>
                  No compartimos tus datos con terceros salvo lo necesario para
                  la entrega del pedido.
                </li>
                <li>
                  Puedes solicitar la actualización o eliminación de tus datos
                  escribiéndonos por WhatsApp.
                </li>
                <li>
                  [Ajusta esta política conforme a la Ley N° 29733 de Protección
                  de Datos Personales del Perú.]
                </li>
              </ul>
            </Prose>
          </Section>

          {/* Contact footer */}
          <div className="rounded-3xl border-2 border-dashed border-border bg-card/60 p-6 text-center">
            <h2 className="font-display text-lg font-bold">
              ¿No encontraste lo que buscabas?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Escríbenos y te ayudamos lo antes posible.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1ebe5b]"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp
              </a>
              <Link
                href="/seguimiento"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-accent px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Seguir mi pedido <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: typeof HelpCircle;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/** Lightweight prose styling for the help copy. */
function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground [&_li]:ml-1 [&_p]:text-foreground/80 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
      {children}
    </div>
  );
}
