import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/features/auth/queries";

/**
 * Record an admin action in the audit log. Best-effort: never throws, so a
 * logging failure can't break the action it's recording. Uses the service_role
 * client (the audit_log table has no client INSERT policy).
 */
export async function recordAudit(entry: {
  action: string;
  entity?: string;
  entityId?: string;
  summary?: string;
}): Promise<void> {
  try {
    const session = await getAdminSession();
    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      actor_id: session?.userId ?? null,
      actor_email: session?.email ?? null,
      action: entry.action,
      entity: entry.entity ?? null,
      entity_id: entry.entityId ?? null,
      summary: entry.summary ?? null,
    });
  } catch {
    // Swallow — auditing must never break the underlying operation.
  }
}
