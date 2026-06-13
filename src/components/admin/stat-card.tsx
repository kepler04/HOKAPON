import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "accent" | "mint" | "sun" | "berry";
}

const tones = {
  accent: "bg-accent/10 text-accent",
  mint: "bg-mint/15 text-mint",
  sun: "bg-sun/20 text-[hsl(38_90%_38%)]",
  berry: "bg-berry/15 text-berry",
};

export function StatCard({ label, value, icon: Icon, tone = "accent" }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("grid h-10 w-10 place-items-center rounded-2xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}
