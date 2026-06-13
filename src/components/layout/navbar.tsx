import { getActiveCategories } from "@/features/categories/queries";
import { Container } from "@/components/shared/container";
import { SearchBar } from "./search-bar";
import { MobileNav } from "./mobile-nav";
import { TopBar } from "./top-bar";
import { HokaponLogo } from "./hokapon-logo";
import { NavActions } from "./nav-actions";

/** HOKAPON top navigation (marketplace style). Server Component. */
export async function Navbar() {
  const categories = await getActiveCategories();

  return (
    <header className="sticky top-0 z-40 bg-background shadow-sm">
      {/* Trust bar */}
      <TopBar />

      {/* Main row */}
      <Container>
        <div className="flex h-[76px] items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <MobileNav categories={categories} />
            <HokaponLogo />
          </div>

          <SearchBar
            className="hidden flex-1 md:flex"
            placeholder="¿Qué estás buscando hoy?"
          />

          <div className="ml-auto md:ml-0">
            <NavActions />
          </div>
        </div>

        {/* Mobile search */}
        <div className="pb-3 md:hidden">
          <SearchBar placeholder="¿Qué estás buscando hoy?" />
        </div>
      </Container>
    </header>
  );
}
