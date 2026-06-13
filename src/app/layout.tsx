import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { STORE_NAME } from "@/lib/constants";
import "./globals.css";

// Display font — warm editorial serif with character.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

// Body font — friendly geometric sans.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${STORE_NAME} — Ropa, juguetes y más para niños`,
    template: `%s · ${STORE_NAME}`,
  },
  description:
    "Tienda online de ropa, juguetes y accesorios para niños. Paga fácil con Yape, Plin o transferencia y coordina por WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
