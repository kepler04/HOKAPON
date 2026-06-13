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
      className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5b] shadow-[0_8px_24px_-8px_rgba(37,211,102,0.7)]"
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-5 w-5" /> Enviar comprobante por WhatsApp
      </a>
    </Button>
  );
}
