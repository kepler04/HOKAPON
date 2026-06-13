"use client";

import { useRef, useState } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  ExternalLink,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Device = "mobile" | "tablet" | "desktop";

const widths: Record<Device, string> = {
  mobile: "390px",
  tablet: "768px",
  desktop: "100%",
};

const quickLinks = [
  { label: "Inicio", path: "/" },
  { label: "Productos", path: "/productos" },
  { label: "Carrito", path: "/carrito" },
];

/** Embeds the public storefront in an iframe with device-size controls. */
export function StorePreview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [path, setPath] = useState("/");

  function refresh() {
    if (iframeRef.current) {
      // Reassign src to force a reload (avoids cross-origin contentWindow access).
      // eslint-disable-next-line no-self-assign
      iframeRef.current.src = iframeRef.current.src;
    }
  }

  function go(p: string) {
    setPath(p);
  }

  const devices: { key: Device; icon: typeof Monitor; label: string }[] = [
    { key: "mobile", icon: Smartphone, label: "Móvil" },
    { key: "tablet", icon: Tablet, label: "Tablet" },
    { key: "desktop", icon: Monitor, label: "Escritorio" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3">
        {/* Quick nav */}
        <div className="flex items-center gap-1">
          {quickLinks.map((l) => (
            <button
              key={l.path}
              onClick={() => go(l.path)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                path === l.path
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-muted",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Device toggle */}
        <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
          {devices.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              title={label}
              aria-label={label}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full transition-colors",
                device === key
                  ? "bg-card text-accent shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => go("/")}
            title="Inicio"
            aria-label="Ir al inicio"
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Home className="h-4 w-4" />
          </button>
          <button
            onClick={refresh}
            title="Recargar"
            aria-label="Recargar"
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <a
            href={path}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir en pestaña nueva"
            aria-label="Abrir en pestaña nueva"
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Frame */}
      <div className="flex justify-center rounded-3xl border border-border bg-secondary/40 p-4">
        <div
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300"
          style={{ width: widths[device], maxWidth: "100%" }}
        >
          <iframe
            ref={iframeRef}
            src={path}
            title="Vista previa de la tienda"
            className="h-[70vh] w-full"
          />
        </div>
      </div>
    </div>
  );
}
