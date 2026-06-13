"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
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
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        );
      })}

      <div className="my-3 h-px bg-border" />

      <Link
        href="/admin/tienda"
        className={cn(
          "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors",
          pathname.startsWith("/admin/tienda")
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
      >
        <Store className="h-5 w-5 shrink-0" />
        Ver tienda
      </Link>
    </nav>
  );
}
