"use client";

import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl, type WhatsAppOrderItem } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  orderNumber: string;
  items: WhatsAppOrderItem[];
  total: number;
}

/**
 * Opens WhatsApp with a pre-filled order message.
 * Also clears the cart on mount — reaching the success page means the order
 * was created, so the local cart should be emptied.
 */
export function WhatsAppButton({
  orderNumber,
  items,
  total,
}: WhatsAppButtonProps) {
  const clear = useCart((s) => s.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  const url = buildWhatsAppUrl({ orderNumber, items, total });

  return (
    <Button
      asChild
      size="lg"
      className="h-auto min-h-14 w-full rounded-2xl bg-[#25D366] px-5 py-3 text-sm text-white shadow-[0_14px_28px_-12px_rgba(37,211,102,0.9)] hover:bg-[#1ebe5b] sm:text-base"
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-5 w-5" /> Enviar comprobante por WhatsApp
      </a>
    </Button>
  );
}
