"use client";

import { useState } from "react";
import {
  UserPlus,
  Loader2,
  ShieldCheck,
  ShieldOff,
  Ban,
  CircleCheck,
  Trash2,
  X,
  Search,
  Mail,
  Lock,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  adminCreateUser,
  adminSetUserRole,
  adminSetUserBlocked,
  adminDeleteUser,
} from "@/features/users-admin/actions";
import type { AdminUserRow } from "@/features/users-admin/queries";
import type { ManageableRole } from "@/features/users-admin/schemas";

const ROLE_LABEL: Record<ManageableRole, string> = {
  admin: "Administrador",
  staff: "Staff",
  customer: "Cliente",
};

const ROLE_STYLE: Record<ManageableRole, string> = {
  admin: "bg-accent/10 text-accent",
  staff: "bg-blue-500/10 text-blue-600",
  customer: "bg-secondary text-muted-foreground",
};

export function UsersManager({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUserRow | null>(null);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.email ?? "").toLowerCase().includes(q) ||
      (u.name ?? "").toLowerCase().includes(q)
    );
  });

  async function run(id: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusyId(id);
    const r = await fn();
    setBusyId(null);
    if (!r.ok) {
      toast.error(r.error ?? "Algo salió mal.");
      return false;
    }
    return true;
  }

  async function toggleAdmin(u: AdminUserRow) {
    const makeAdmin = u.role === "customer";
    const next: ManageableRole = makeAdmin ? "admin" : "customer";
    const ok = await run(u.id, () => adminSetUserRole({ userId: u.id, role: next }));
    if (ok) toast.success(makeAdmin ? "Acceso de admin concedido." : "Acceso de admin retirado.");
  }

  async function toggleBlock(u: AdminUserRow) {
    const blocking = !u.bannedUntil;
    const ok = await run(u.id, () => adminSetUserBlocked(u.id, blocking));
    if (ok) toast.success(blocking ? "Usuario bloqueado." : "Usuario desbloqueado.");
  }

  async function doDelete(u: AdminUserRow) {
    const ok = await run(u.id, () => adminDeleteUser(u.id));
    if (ok) {
      toast.success("Usuario eliminado.");
      setConfirmDelete(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
        >
          <UserPlus className="h-4 w-4" /> Crear usuario
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Pedidos</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isSelf = u.id === currentUserId;
                const blocked = !!u.bannedUntil;
                const busy = busyId === u.id;
                return (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                          {(u.name ?? u.email ?? "?").charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {u.name ?? "—"}{" "}
                            {isSelf && (
                              <span className="text-xs text-muted-foreground">(tú)</span>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          ROLE_STYLE[u.role],
                        )}
                      >
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{u.orderCount}</td>
                    <td className="px-4 py-3">
                      {blocked ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                          <Ban className="h-3.5 w-3.5" /> Bloqueado
                        </span>
                      ) : u.confirmed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-mint">
                          <CircleCheck className="h-3.5 w-3.5" /> Activo
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin confirmar</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {busy && (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {/* Toggle admin (staff shown as admin-capable too) */}
                        <button
                          onClick={() => toggleAdmin(u)}
                          disabled={busy || isSelf}
                          title={u.role === "customer" ? "Hacer administrador" : "Quitar acceso admin"}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
                        >
                          {u.role === "customer" ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : (
                            <ShieldOff className="h-4 w-4" />
                          )}
                        </button>
                        {/* Block / unblock */}
                        <button
                          onClick={() => toggleBlock(u)}
                          disabled={busy || isSelf}
                          title={blocked ? "Desbloquear" : "Bloquear"}
                          className={cn(
                            "grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-secondary disabled:opacity-30",
                            blocked ? "text-mint" : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {blocked ? <CircleCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setConfirmDelete(u)}
                          disabled={busy || isSelf}
                          title="Eliminar"
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {creating && <CreateUserModal onClose={() => setCreating(false)} />}
      {confirmDelete && (
        <DeleteModal
          user={confirmDelete}
          busy={busyId === confirmDelete.id}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => doDelete(confirmDelete)}
        />
      )}
    </div>
  );
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [makeAdmin, setMakeAdmin] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const r = await adminCreateUser({
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      full_name: String(fd.get("full_name") ?? ""),
      role: makeAdmin ? "admin" : "customer",
    });
    setBusy(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Usuario creado.");
    onClose();
  }

  const input =
    "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Crear usuario</h2>
          <button
            onClick={onClose}
            disabled={busy}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nombre</label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input name="full_name" placeholder="Nombre del usuario" className={`${input} pl-10`} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Correo</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input name="email" type="email" required placeholder="correo@ejemplo.com" className={`${input} pl-10`} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Contraseña</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input name="password" type="text" required placeholder="Mínimo 6 caracteres" className={`${input} pl-10`} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              La cuenta queda confirmada al instante (sin correo de verificación).
            </p>
          </div>
          <label className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={makeAdmin}
              onChange={(e) => setMakeAdmin(e.target.checked)}
              className="h-4 w-4 accent-[hsl(351,84%,49%)]"
            />
            <span>
              <span className="font-medium">Dar acceso de administrador</span>
              <span className="block text-xs text-muted-foreground">
                Podrá entrar al panel /admin y gestionar la tienda.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-all hover:brightness-105 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creando…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" /> Crear usuario
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({
  user,
  busy,
  onCancel,
  onConfirm,
}: {
  user: AdminUserRow;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <Trash2 className="h-6 w-6" />
        </div>
        <h2 className="text-center font-display text-lg font-bold">Eliminar usuario</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          ¿Seguro que quieres eliminar a{" "}
          <span className="font-semibold text-foreground">{user.email}</span>? Esta
          acción es permanente y no se puede deshacer.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="h-11 flex-1 rounded-xl border border-border text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-destructive text-sm font-semibold text-white transition-all hover:brightness-105 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
