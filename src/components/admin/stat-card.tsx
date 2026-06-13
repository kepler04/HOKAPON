import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "accent" | "mint" | "blue" | "sun";
  /** Month-over-month change; null shows a neutral "—". */
  deltaPct?: number | null;
  /** Optional values for the mini sparkline (oldest → newest). */
  spark?: number[];
}

const tones = {
  accent: { box: "bg-accent text-accent-foreground", line: "hsl(351 84% 49%)" },
  mint: { box: "bg-mint text-white", line: "hsl(160 84% 39%)" },
  blue: { box: "bg-blue-500 text-white", line: "rgb(59 130 246)" },
  sun: { box: "bg-amber-400 text-white", line: "rgb(245 158 11)" },
};

/** Tiny sparkline (area) drawn in pure SVG, no chart lib. */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 120;
  const h = 40;
  if (values.length < 2) return <svg width={w} height={h} aria-hidden />;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return [x, y] as const;
  });
  const line = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `${pts[0][0]},${h} ${line} ${pts[pts.length - 1][0]},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polygon points={area} fill={color} opacity={0.12} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "accent",
  deltaPct,
  spark,
}: StatCardProps) {
  const t = tones[tone];
  const up = (deltaPct ?? 0) >= 0;

  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-2xl",
            t.box,
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        {spark && spark.length > 1 && (
          <Sparkline values={spark} color={t.line} />
        )}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>

      <div className="mt-2 text-xs font-medium">
        {deltaPct == null ? (
          <span className="text-muted-foreground">Sin comparación previa</span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              up ? "text-mint" : "text-destructive",
            )}
          >
            {up ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(deltaPct)}% este mes
          </span>
        )}
      </div>
    </div>
  );
}
