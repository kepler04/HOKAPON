"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { SalesPoint } from "@/features/dashboard/queries";

const W = 720;
const H = 260;
const PAD = { top: 16, right: 12, bottom: 28, left: 48 };

/** Sales line/area chart for the last 30 days. Pure SVG + hover tooltip. */
export function SalesChart({ data }: { data: SalesPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max = Math.max(...data.map((d) => d.total), 1);
  // Round the axis max up to a "nice" number.
  const niceMax = niceCeil(max);
  const stepX = innerW / Math.max(data.length - 1, 1);

  const x = (i: number) => PAD.left + i * stepX;
  const y = (v: number) => PAD.top + innerH - (v / niceMax) * innerH;

  const linePts = data.map((d, i) => `${x(i)},${y(d.total)}`).join(" ");
  const areaPts = `${x(0)},${PAD.top + innerH} ${linePts} ${x(
    data.length - 1,
  )},${PAD.top + innerH}`;

  // y-axis ticks (0, ¼, ½, ¾, max)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * niceMax);

  const totalSum = data.reduce((s, d) => s + d.total, 0);

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Ventas de los últimos 30 días"
      >
        {/* grid + y labels */}
        {ticks.map((t, i) => {
          const yy = y(t);
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={yy}
                y2={yy}
                stroke="currentColor"
                className="text-border"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={yy + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                {shortMoney(t)}
              </text>
            </g>
          );
        })}

        {/* area + line */}
        <polygon points={areaPts} fill="hsl(351 84% 49%)" opacity={0.12} />
        <polyline
          points={linePts}
          fill="none"
          stroke="hsl(351 84% 49%)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* x labels: every ~6 days */}
        {data.map((d, i) =>
          i % 6 === 0 || i === data.length - 1 ? (
            <text
              key={i}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {labelDay(d.date)}
            </text>
          ) : null,
        )}

        {/* hover dot */}
        {hover != null && (
          <circle
            cx={x(hover)}
            cy={y(data[hover].total)}
            r={4}
            fill="hsl(351 84% 49%)"
            stroke="white"
            strokeWidth={2}
          />
        )}

        {/* invisible hover targets */}
        {data.map((d, i) => (
          <rect
            key={i}
            x={x(i) - stepX / 2}
            y={PAD.top}
            width={stepX}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      <div className="mt-1 flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          {hover != null ? (
            <>
              <b className="text-foreground">{labelFull(data[hover].date)}</b> ·{" "}
              <b className="text-accent">{formatPrice(data[hover].total)}</b>
            </>
          ) : (
            "Pasa el cursor para ver el detalle por día"
          )}
        </span>
        <span>
          Total 30 días:{" "}
          <b className="text-foreground">{formatPrice(totalSum)}</b>
        </span>
      </div>
    </div>
  );
}

function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / mag) * mag;
}
function shortMoney(v: number): string {
  if (v >= 1000) return `S/${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return `S/${Math.round(v)}`;
}
function labelDay(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
  }).format(d);
}
function labelFull(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(d);
}
