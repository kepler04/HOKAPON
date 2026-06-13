"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  ArrowDownUp,
  Wallet,
  Users,
  History,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/inventario", label: "Inventario", icon: ArrowDownUp },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/pagos", label: "Métodos de pago", icon: Wallet },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/actividad", label: "Actividad", icon: History },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground shadow-[0_8px_24px_-8px_hsl(351_84%_49%/0.6)]"
                : "text-white/60 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        );
      })}

      <div className="my-3 h-px bg-white/10" />

      <Link
        href="/admin/tienda"
        className={cn(
          "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors",
          pathname.startsWith("/admin/tienda")
            ? "bg-accent text-accent-foreground"
            : "text-white/60 hover:bg-white/10 hover:text-white",
        )}
      >
        <Store className="h-5 w-5 shrink-0" />
        Ver tienda
      </Link>
    </nav>
  );
}
