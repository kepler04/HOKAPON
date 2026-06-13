import { ShieldAlert } from "lucide-react";
import { getAdminSession } from "@/features/auth/queries";
import { listUsers } from "@/features/users-admin/queries";
import { UsersManager } from "@/features/users-admin/components/users-manager";

export default async function AdminUsersPage() {
  const session = await getAdminSession();

  // Only full admins can manage accounts (staff has no access here).
  if (!session || session.role !== "admin") {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold">Usuarios</h1>
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 text-amber-800">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">
            Solo un <strong>administrador</strong> puede gestionar usuarios. Pide
            acceso al dueño de la tienda.
          </p>
        </div>
      </div>
    );
  }

  const users = await listUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">
          Gestiona clientes y administradores: crea cuentas, da o retira acceso de
          admin, bloquea o elimina usuarios.
        </p>
      </div>
      <UsersManager users={users} currentUserId={session.userId} />
    </div>
  );
}
