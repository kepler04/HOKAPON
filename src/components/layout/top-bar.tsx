import { MapPin, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { Container } from "@/components/shared/container";

/** Slim dark trust bar above the main navbar (marketplace style). */
export function TopBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <Container className="flex h-10 items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" />
          <span className="font-medium">Envíos a todo Perú</span>
          <span aria-hidden>🇵🇪</span>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <span className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-accent" /> Envíos confiables
          </span>
          <span className="flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4 text-accent" /> Devoluciones fáciles
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-accent" /> Compra segura
          </span>
        </div>
      </Container>
    </div>
  );
}
