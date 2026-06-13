import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/features/auth/queries";
import { STORE_NAME } from "@/lib/constants";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileBar } from "@/components/admin/admin-mobile-bar";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { IdleLogout } from "@/features/auth/components/idle-logout";

/**
 * Admin shell. Middleware already guards /admin, but we re-check the session
 * here (defense in depth) and use it to greet the user.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/login?redirect=/admin");

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar (dark) */}
      <aside className="sticky top-0 hidden h-screen flex-col bg-[#0d1117] p-5 text-white lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-2">
          <span
            className="grid h-9 w-9 place-items-center rounded-2xl bg-accent text-lg"
            aria-hidden
          >
            🧸
          </span>
          <span className="font-display text-lg font-bold text-white">
            {STORE_NAME}
          </span>
        </Link>
        <AdminSidebar />

        {/* User chip at the bottom */}
        <div className="mt-auto flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {(session.fullName ?? session.email ?? "A").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {session.fullName ?? session.email ?? "admin"}
            </p>
            <p className="text-xs text-white/50">Administrador</p>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <AdminMobileBar storeName={STORE_NAME} />
            <span className="text-sm text-muted-foreground">
              Hola,{" "}
              <span className="font-semibold text-foreground">
                {session.fullName ?? session.email ?? "admin"}
              </span>
            </span>
          </div>
          <LogoutButton />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Auto sign-out after inactivity (defense in depth). */}
      <IdleLogout />
    </div>
  );
}
