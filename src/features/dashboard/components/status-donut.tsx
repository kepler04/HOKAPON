import { ORDER_STATUSES } from "@/lib/constants";
import type { StatusSlice } from "@/features/dashboard/queries";

// Concrete colors per status color-name used in ORDER_STATUSES.
const COLORS: Record<string, string> = {
  gray: "#94a3b8",
  amber: "#f59e0b",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  indigo: "#6366f1",
  green: "#10b981",
  red: "#ef4444",
};

const SIZE = 180;
const STROKE = 26;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

/** Donut of orders grouped by status, with a legend showing counts + %. */
export function StatusDonut({ slices }: { slices: StatusSlice[] }) {
  const total = slices.reduce((s, x) => s + x.count, 0);

  if (total === 0) {
    return (
      <div className="grid h-full place-items-center py-10 text-center text-sm text-muted-foreground">
        Aún no hay pedidos para graficar.
      </div>
    );
  }

  // Build cumulative arcs.
  let offset = 0;
  const arcs = slices.map((s) => {
    const frac = s.count / total;
    const color = COLORS[ORDER_STATUSES[s.status].color] ?? COLORS.gray;
    const seg = {
      color,
      dash: frac * C,
      gap: C - frac * C,
      offset: -offset * C,
    };
    offset += frac;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {arcs.map((a, i) => (
              <circle
                key={i}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={a.color}
                strokeWidth={STROKE}
                strokeDasharray={`${a.dash} ${a.gap}`}
                strokeDashoffset={a.offset}
              />
            ))}
          </g>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-display text-3xl font-extrabold leading-none">
              {total}
            </p>
            <p className="text-xs text-muted-foreground">pedidos</p>
          </div>
        </div>
      </div>

      <ul className="w-full max-w-[220px] space-y-2.5">
        {slices.map((s) => {
          const pct = Math.round((s.count / total) * 100);
          const color = COLORS[ORDER_STATUSES[s.status].color] ?? COLORS.gray;
          return (
            <li
              key={s.status}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {ORDER_STATUSES[s.status].label}
              </span>
              <span className="text-muted-foreground">
                <b className="text-foreground">{s.count}</b> · {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
