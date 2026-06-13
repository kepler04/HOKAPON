import { getAllPaymentMethods } from "@/features/payments-config/queries";
import { PaymentMethodsManager } from "@/features/payments-config/components/payment-methods-manager";

export default async function AdminPaymentsPage() {
  const methods = await getAllPaymentMethods();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Métodos de pago</h1>
        <p className="text-muted-foreground">
          Configura los métodos que verán tus clientes al pagar (Yape, Plin,
          transferencias). Agrega, edita, oculta o elimina los que necesites.
        </p>
      </div>
      <PaymentMethodsManager methods={methods} />
    </div>
  );
}
