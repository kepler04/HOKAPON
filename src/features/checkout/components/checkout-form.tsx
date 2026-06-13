"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CheckCircle2, Loader2, PackageCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/store/cart";
import {
  customerDetailsSchema,
  type CustomerDetailsInput,
} from "@/features/checkout/schemas";
import { createOrder } from "@/features/checkout/actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export interface CheckoutPrefill {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
}

/** Customer details form. Submits to createOrder and redirects. */
export function CheckoutForm({ prefill }: { prefill?: CheckoutPrefill }) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerDetailsInput>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: {
      customer_name: prefill?.customer_name ?? "",
      customer_phone: prefill?.customer_phone ?? "",
      customer_email: prefill?.customer_email ?? "",
    },
  });

  async function onSubmit(values: CustomerDetailsInput) {
    setServerError(null);

    if (items.length === 0) {
      setServerError("Tu carrito está vacío.");
      return;
    }

    setIsFinishing(true);

    let result: Awaited<ReturnType<typeof createOrder>>;
    try {
      result = await createOrder({
        ...values,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });
    } catch {
      const message = "No se pudo crear el pedido. Intenta de nuevo.";
      setIsFinishing(false);
      setServerError(message);
      toast.error(message);
      return;
    }

    if (!result.ok) {
      setIsFinishing(false);
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("¡Pedido creado!");
    router.replace(`/checkout/exito/${result.orderNumber}`);
  }

  return (
    <>
      {isFinishing && <CheckoutCreatingOverlay />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="customer_name" className="mb-1.5 block text-sm font-medium">
          Nombre completo
        </label>
        <Input
          id="customer_name"
          placeholder="Ej. María Pérez"
          autoComplete="name"
          aria-invalid={!!errors.customer_name}
          {...register("customer_name")}
        />
        {errors.customer_name && (
          <p className="mt-1 text-xs text-destructive">
            {errors.customer_name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="customer_phone" className="mb-1.5 block text-sm font-medium">
          Teléfono (WhatsApp)
        </label>
        <Input
          id="customer_phone"
          type="tel"
          inputMode="tel"
          placeholder="Ej. 999 888 777"
          autoComplete="tel"
          aria-invalid={!!errors.customer_phone}
          {...register("customer_phone")}
        />
        {errors.customer_phone && (
          <p className="mt-1 text-xs text-destructive">
            {errors.customer_phone.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="customer_email" className="mb-1.5 block text-sm font-medium">
          Correo electrónico
        </label>
        <Input
          id="customer_email"
          type="email"
          inputMode="email"
          placeholder="tucorreo@ejemplo.com"
          autoComplete="email"
          aria-invalid={!!errors.customer_email}
          {...register("customer_email")}
        />
        {errors.customer_email && (
          <p className="mt-1 text-xs text-destructive">
            {errors.customer_email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">
          Nota para el pedido <span className="text-muted-foreground">(opcional)</span>
        </label>
        <Textarea
          id="notes"
          placeholder="Ej. Talla, color, referencia de entrega…"
          {...register("notes")}
        />
      </div>

      {serverError && (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting || isFinishing}
      >
        {isSubmitting || isFinishing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Confirmando pedido…
          </>
        ) : (
          "Confirmar pedido"
        )}
      </Button>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-mint" />
        Al confirmar, generamos tu número de pedido y te mostramos los datos de
        pago.
      </p>
      </form>
    </>
  );
}

function CheckoutCreatingOverlay() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-4 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl border border-mint/25 bg-card p-7 text-center shadow-[0_24px_80px_-34px_hsl(var(--mint)/0.65)]">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint/10 text-mint">
          <PackageCheck className="h-8 w-8" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-extrabold">
          Preparando tu pedido
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
          Estamos generando tu número de pedido y abriendo la confirmación.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-mint/10 px-4 py-3 text-sm font-semibold text-mint">
          <Loader2 className="h-4 w-4 animate-spin" />
          Un momento...
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-mint" />
          No cierres esta ventana
        </div>
      </div>
    </div>
  );
}
