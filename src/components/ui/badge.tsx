import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      tone: {
        accent: "bg-accent text-accent-foreground",
        mint: "bg-mint/15 text-mint",
        sun: "bg-sun/20 text-[hsl(38_90%_38%)]",
        berry: "bg-berry/15 text-berry",
        neutral: "bg-secondary text-secondary-foreground",
        outline: "border border-border bg-card/60 text-muted-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, className }))} {...props} />;
}
