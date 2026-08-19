import "server-only";
import { sql } from "./client";
import { ensureDb } from "./schema";
import { toISOTimestamp } from "./dates";

/** Records one admin action — best-effort, never blocks the action itself if logging fails. */
export async function logAdminAction(adminEmail: string, action: string, details?: string): Promise<void> {
  try {
    await ensureDb();
    await sql`
      INSERT INTO admin_audit_log (admin_email, action, details)
      VALUES (${adminEmail}, ${action}, ${details ?? null})
    `;
  } catch {
    // Logging failure should never take down the actual admin action.
  }
}

export interface AuditLogEntry {
  id: number;
  adminEmail: string;
  action: string;
  details: string | null;
  createdAt: string;
}

export async function getRecentAuditLog(limit = 100): Promise<AuditLogEntry[]> {
  await ensureDb();
  const rows = (await sql`
    SELECT id, admin_email, action, details, created_at
    FROM admin_audit_log
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as Array<{ id: number; admin_email: string; action: string; details: string | null; created_at: unknown }>;

  return rows.map((r) => ({
    id: r.id,
    adminEmail: r.admin_email,
    action: r.action,
    details: r.details,
    createdAt: toISOTimestamp(r.created_at) ?? new Date().toISOString(),
  }));
}
