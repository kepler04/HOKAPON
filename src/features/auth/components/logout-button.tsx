import { LogOut } from "lucide-react";
import { logout } from "@/features/auth/actions";

/** Logout button — submits to the logout server action. */
export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </form>
  );
}
