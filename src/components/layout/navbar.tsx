import Link from "next/link";
import { getActiveCategories } from "@/features/categories/queries";
import { STORE_NAME } from "@/lib/constants";
import { Container } from "@/components/shared/container";
import { CartButton } from "./cart-button";
import { SearchBar } from "./search-bar";
import { MobileNav } from "./mobile-nav";

/** Top navigation. Server Component — fetches categories for the nav row. */
export async function Navbar() {
  const categories = await getActiveCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <Container>
        {/* Row 1: logo · search · cart */}
        <div className="flex h-[68px] items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <MobileNav categories={categories} />
            <Link href="/" className="flex items-center gap-2">
              <span
                className="grid h-9 w-9 place-items-center rounded-2xl bg-accent text-lg"
                aria-hidden
              >
                🧸
              </span>
              <span className="font-display text-xl font-bold tracking-tight">
                {STORE_NAME}
              </span>
            </Link>
          </div>

          <SearchBar className="hidden flex-1 md:flex" />

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <CartButton />
          </div>
        </div>

        {/* Mobile search */}
        <div className="pb-3 md:hidden">
          <SearchBar />
        </div>

        {/* Row 2: category nav (desktop) */}
        <nav className="hidden h-12 items-center gap-1 md:flex" aria-label="Categorías">
          <Link
            href="/productos"
            className="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorias/${cat.slug}`}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
