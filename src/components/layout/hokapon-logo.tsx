import Link from "next/link";

/** HOKAPON wordmark: red brand name with a "PERÚ" tagline + underline. */
export function HokaponLogo() {
  return (
    <Link href="/" className="group flex shrink-0 flex-col leading-none">
      <span className="font-display text-2xl font-extrabold tracking-tight text-accent sm:text-3xl">
        HOKAPON
      </span>
      <span className="mt-0.5 flex items-center gap-1.5">
        <span className="h-px flex-1 bg-accent/60" />
        <span className="text-[10px] font-semibold tracking-[0.3em] text-muted-foreground">
          PERÚ
        </span>
        <span className="h-px flex-1 bg-accent/60" />
      </span>
    </Link>
  );
}
