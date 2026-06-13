"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/store/cart";
import {
  customerDetailsSchema,
  type CustomerDetailsInput,
} from "@/features/checkout/schemas";
import { createOrder } from "@/features/checkout/actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

/** Customer details form. Submits to createOrder, clears cart, redirects. */
export function CheckoutForm() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerDetailsInput>({
    resolver: zodResolver(customerDetailsSchema),
  });

  async function onSubmit(values: CustomerDetailsInput) {
    setServerError(null);

    if (items.length === 0) {
      setServerError("Tu carrito está vacío.");
      return;
    }

    const result = await createOrder({
      ...values,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    });

    if (!result.ok) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    clear();
    toast.success("¡Pedido creado!");
    router.push(`/checkout/exito/${result.orderNumber}`);
  }

  return (
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
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Creando pedido…
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
  );
}
