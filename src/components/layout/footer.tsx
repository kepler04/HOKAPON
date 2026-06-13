import Link from "next/link";
import { STORE_NAME } from "@/lib/constants";
import { Container } from "@/components/shared/container";

const paymentMethods = ["Yape", "Plin", "Transferencia", "WhatsApp"];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span
                className="grid h-9 w-9 place-items-center rounded-2xl bg-accent text-lg"
                aria-hidden
              >
                🧸
              </span>
              <span className="font-display text-xl font-bold">
                {STORE_NAME}
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-primary-foreground/70">
              Ropa, juguetes y accesorios para niños. Compra fácil y paga con
              Yape, Plin o transferencia — coordinamos todo por WhatsApp.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span
                  key={m}
                  className="rounded-full border border-primary-foreground/20 px-3 py-1 text-xs font-medium text-primary-foreground/80"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-primary-foreground/60">
              Tienda
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/productos" className="text-primary-foreground/80 hover:text-accent">
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="text-primary-foreground/80 hover:text-accent">
                  Mi carrito
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-primary-foreground/60">
              Ayuda
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <li>Cómo comprar</li>
              <li>Métodos de pago</li>
              <li>Contacto por WhatsApp</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} {STORE_NAME}. Demo de ecommerce.
        </div>
      </Container>
    </footer>
  );
}
