"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";
import {
  getPublicOrderByNumber,
  getPublicOrderForTracking,
} from "@/features/orders/queries";
import { updateOrderStatus } from "@/features/orders/actions";
import {
  canUploadPaymentProof,
  type ProofPaymentMethod,
} from "@/features/orders/payment-proof-utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const proofMethodSchema = z.enum(["yape", "plin", "transferencia"]);

const reviewProofSchema = z.object({
  orderId: z.string().uuid(),
  paymentId: z.string().uuid(),
  decision: z.enum(["confirm", "reject"]),
  force: z.boolean().optional(),
});

export type PaymentProofActionResult =
  | { ok: true }
  | { ok: false; error: string; code?: "insufficient_stock" };

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function fileExtension(file: File) {
  return ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES];
}

async function resolvePublicOrder(orderNumber: string, contact: string) {
  if (!orderNumber) return null;
  if (contact) {
    return getPublicOrderForTracking({ orderNumber, contact });
  }
  return getPublicOrderByNumber(orderNumber);
}

export async function submitPaymentProof(
  formData: FormData,
): Promise<PaymentProofActionResult> {
  const orderNumber = formValue(formData, "orderNumber");
  const contact = formValue(formData, "contact");
  const methodParsed = proofMethodSchema.safeParse(formValue(formData, "method"));
  const file = formData.get("proof");

  if (!methodParsed.success) {
    return { ok: false, error: "Selecciona el metodo de pago usado." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecciona una imagen del comprobante." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "La imagen debe pesar como maximo 5 MB." };
  }

  const ext = fileExtension(file);
  if (!ext) {
    return { ok: false, error: "Sube una imagen JPG, PNG o WEBP." };
  }

  const order = await resolvePublicOrder(orderNumber, contact);
  if (!order) {
    return { ok: false, error: "No pudimos validar ese pedido." };
  }
  if (!canUploadPaymentProof(order.status)) {
    return {
      ok: false,
      error: "Este pedido ya no acepta nuevos comprobantes.",
    };
  }

  const supabase = createAdminClient();
  const path = `orders/${order.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.PROOFS)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      error: `No se pudo subir el comprobante: ${uploadError.message}`,
    };
  }

  const method = methodParsed.data as ProofPaymentMethod;
  const { error: paymentError } = await supabase.from("payments").insert({
    order_id: order.id,
    method,
    amount: order.total,
    proof_url: path,
    status: "pendiente",
  });

  if (paymentError) {
    await supabase.storage.from(STORAGE_BUCKETS.PROOFS).remove([path]);
    return { ok: false, error: paymentError.message };
  }

  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: "pago_enviado",
      payment_method: method,
    })
    .eq("id", order.id);

  if (orderError) {
    return { ok: false, error: orderError.message };
  }

  revalidatePath(`/checkout/exito/${order.order_number}`);
  revalidatePath("/seguimiento");
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${order.id}`);
  return { ok: true };
}

export async function reviewPaymentProof(
  input: z.infer<typeof reviewProofSchema>,
): Promise<PaymentProofActionResult> {
  const parsed = reviewProofSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos invalidos." };
  }

  const { orderId, paymentId, decision, force } = parsed.data;
  const supabase = await createClient();

  if (decision === "confirm") {
    const statusResult = await updateOrderStatus({
      orderId,
      status: "pago_confirmado",
      force: !!force,
    });
    if (!statusResult.ok) return statusResult;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("payments")
      .update({
        status: "confirmado",
        confirmed_by: user?.id ?? null,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const { data: order, error: orderReadError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (orderReadError) return { ok: false, error: orderReadError.message };
  if (order.status === "pago_confirmado") {
    return { ok: false, error: "Este pago ya fue confirmado." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      status: "rechazado",
      confirmed_by: user?.id ?? null,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (paymentError) return { ok: false, error: paymentError.message };

  if (order.status === "pago_enviado") {
    const { error: orderError } = await supabase
      .from("orders")
      .update({ status: "esperando_pago" })
      .eq("id", orderId);
    if (orderError) return { ok: false, error: orderError.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/seguimiento");
  return { ok: true };
}
