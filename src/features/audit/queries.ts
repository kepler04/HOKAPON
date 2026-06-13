import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AuditEntry {
  id: string;
  actorEmail: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  summary: string | null;
  createdAt: string;
}

/**
 * Recent audit log entries (staff-readable via RLS). Returns [] if the table
 * doesn't exist yet (migration 0015 not applied), so the page degrades nicely.
 */
export async function getAuditLog(limit = 100): Promise<AuditEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("id,actor_email,action,entity,entity_id,summary,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];

  return (data ?? []).map((r) => ({
    id: r.id,
    actorEmail: r.actor_email,
    action: r.action,
    entity: r.entity,
    entityId: r.entity_id,
    summary: r.summary,
    createdAt: r.created_at,
  }));
}
