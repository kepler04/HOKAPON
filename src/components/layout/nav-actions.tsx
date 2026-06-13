"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  ChevronDown,
  LogOut,
  UserRound,
  UserCog,
  ShoppingBag,
  PackageSearch,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useCart } from "@/store/cart";
import { createClient } from "@/lib/supabase/client";

/** Right-side cluster: cart (live badge), favorites (decorative),
 *  country selector and the customer auth zone (Google sign-in). */
export function NavActions() {
  const [mounted, setMounted] = useState(false);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      {/* Cart */}
      <Link
        href="/carrito"
        aria-label="Ver carrito"
        className="relative grid h-10 w-10 place-items-center text-foreground transition-colors hover:text-accent"
      >
        <ShoppingCart className="h-6 w-6" />
        {mounted && count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
            {count}
          </span>
        )}
      </Link>

      {/* Favorites (decorative for the demo) */}
      <button
        aria-label="Favoritos"
        className="relative hidden h-10 w-10 place-items-center text-foreground transition-colors hover:text-accent sm:grid"
      >
        <Heart className="h-6 w-6" />
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
          0
        </span>
      </button>

      {/* Country selector (decorative) */}
      <button className="hidden items-center gap-1.5 text-sm font-semibold lg:flex">
        <span aria-hidden>🇵🇪</span>
        Perú (PEN)
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Customer auth zone */}
      <UserZone />
    </div>
  );
}

function UserZone() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Create the browser client ONCE (a new instance per render would desync the
  // auth subscription and miss the just-established session).
  const [supabase] = useState(() => createClient());

  // Load the session and keep it in sync.
  useEffect(() => {
    let active = true;

    async function refresh() {
      const { data } = await supabase.auth.getUser();
      if (active) {
        setUser(data.user ?? null);
        setReady(true);
      }
    }

    refresh();

    // React to login/logout in this or other tabs.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    // Re-check when the tab regains focus (covers the OAuth redirect coming
    // back and any session set while this component was already mounted).
    function onFocus() {
      refresh();
    }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      active = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [supabase]);

  // Close the dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
    setUser(null);
  }

  // Avoid hydration flash: render a stable placeholder until ready.
  if (!ready) {
    return (
      <div className="hidden h-10 w-28 animate-pulse rounded-full bg-secondary lg:block" />
    );
  }

  // Logged out → welcome zone linking to the account page.
  if (!user) {
    return (
      <Link
        href="/cuenta"
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
        aria-label="Iniciar sesión o registrarse"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
          <UserRound className="h-5 w-5" />
        </span>
        <div className="hidden leading-tight text-left lg:block">
          <p className="text-xs text-muted-foreground">¡Bienvenido!</p>
          <p className="text-sm font-bold">Inicia sesión</p>
        </div>
        <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
      </Link>
    );
  }

  // Logged in → avatar + dropdown.
  const name =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    user.email ||
    "Mi cuenta";
  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatar ? (
          <Image
            src={avatar}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {initial}
          </span>
        )}
        <div className="hidden leading-tight lg:block">
          <p className="text-xs text-muted-foreground">¡Hola!</p>
          <p className="max-w-[120px] truncate text-sm font-bold">
            {name.split(" ")[0]}
          </p>
        </div>
        <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold">{name}</p>
            {user.email && (
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
          <Link
            href="/cuenta/perfil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-secondary"
          >
            <UserCog className="h-4 w-4 text-muted-foreground" /> Mi perfil
          </Link>
          <Link
            href="/cuenta/compras"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-secondary"
          >
            <ShoppingBag className="h-4 w-4 text-muted-foreground" /> Mis compras
          </Link>
          <Link
            href="/seguimiento"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-secondary"
          >
            <PackageSearch className="h-4 w-4 text-muted-foreground" /> Seguir mi
            pedido
          </Link>
          <div className="my-1 h-px bg-border" />
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
