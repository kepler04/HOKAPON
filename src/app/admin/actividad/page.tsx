import { ShieldAlert, History } from "lucide-react";
import { getAdminSession } from "@/features/auth/queries";
import { getAuditLog } from "@/features/audit/queries";

const ACTION_LABEL: Record<string, string> = {
  "user.create": "Creó usuario",
  "user.delete": "Eliminó usuario",
  "user.role": "Cambió rol",
  "user.block": "Bloqueó usuario",
  "user.unblock": "Desbloqueó usuario",
};

function timeAgo(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminActivityPage() {
  const session = await getAdminSession();

  if (!session || session.role !== "admin") {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold">Actividad</h1>
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 text-amber-800">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">
            Solo un <strong>administrador</strong> puede ver el registro de
            actividad.
          </p>
        </div>
      </div>
    );
  }

  const entries = await getAuditLog();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Registro de actividad</h1>
        <p className="text-muted-foreground">
          Acciones realizadas en el panel: quién hizo qué y cuándo.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <History className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Aún no hay actividad registrada.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Las acciones sensibles (crear, eliminar o cambiar usuarios) se
            registrarán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Quién</th>
                  <th className="px-4 py-3 font-semibold">Acción</th>
                  <th className="px-4 py-3 font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {timeAgo(e.createdAt)}
                    </td>
                    <td className="px-4 py-3">{e.actorEmail ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
                        {ACTION_LABEL[e.action] ?? e.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {e.summary ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
