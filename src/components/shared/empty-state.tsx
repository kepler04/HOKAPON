import { cn } from "@/lib/utils";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  emoji = "🔍",
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/50 px-6 py-16 text-center",
        className,
      )}
    >
      <span className="mb-4 text-5xl" aria-hidden>
        {emoji}
      </span>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
