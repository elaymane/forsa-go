import "server-only";
import { sql } from "./client";
import { ensureDb } from "./schema";
import { toISOTimestamp } from "./dates";

export interface Notification {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  /** Where clicking this notification should take the user — an opportunity, /admin, /subscribe, etc. Null for notifications with no natural destination. */
  link: string | null;
}

interface NotificationRow {
  id: number;
  title: string;
  description: string;
  created_at: unknown; // Postgres TIMESTAMPTZ — see toISOTimestamp
  read: boolean;
  link: string | null;
}

/** Global announcements (user_id IS NULL) plus this user's personal reminders. */
export async function getNotifications(userId: string): Promise<Notification[]> {
  await ensureDb();
  const rows = (await sql`
    SELECT id, title, description, created_at, read, link FROM notifications
    WHERE user_id = ${userId} OR user_id IS NULL
    ORDER BY created_at DESC, id DESC
  `) as NotificationRow[];

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    createdAt: toISOTimestamp(row.created_at) ?? new Date().toISOString(),
    read: row.read,
    link: row.link,
  }));
}

export async function markAllNotificationsRead(userId: string) {
  await ensureDb();
  await sql`
    UPDATE notifications SET read = true
    WHERE (user_id = ${userId} OR user_id IS NULL) AND read = false
  `;
}

/** Marks one notification as read — scoped so a user can only touch their own or global ones. */
export async function markNotificationRead(userId: string, notificationId: number) {
  await ensureDb();
  await sql`
    UPDATE notifications SET read = true
    WHERE id = ${notificationId} AND (user_id = ${userId} OR user_id IS NULL)
  `;
}

/** Creates a personal reminder for one user (e.g. an acceptance notice). Pass link so clicking it can take the user straight to what it's about. */
export async function createNotification(userId: string, title: string, description: string, link: string | null = null) {
  await ensureDb();
  await sql`
    INSERT INTO notifications (user_id, title, description, link) VALUES (${userId}, ${title}, ${description}, ${link})
  `;

  // If this account is managed, the manager gets a copy too — labeled with
  // whose account it's about — so they can see what's happening across
  // every linked account without switching into each one individually.
  const rows = (await sql`
    SELECT manager_id, name FROM users WHERE id = ${userId}
  `) as Array<{ manager_id: string | null; name: string }>;
  const managerId = rows[0]?.manager_id;
  if (managerId) {
    const linkedName = rows[0]?.name ?? "A linked account";
    await sql`
      INSERT INTO notifications (user_id, title, description, link)
      VALUES (${managerId}, ${title}, ${`${linkedName}: ${description}`}, ${link})
    `;
  }
}

/**
 * Notifies every admin account (matched by ADMIN_EMAILS) — used for events
 * an admin needs to actually see and act on: a new subscription request, a
 * new community submission, etc. Never blocks the action that triggered it
 * if it fails (best-effort, same spirit as everything else notification-related).
 */
export async function notifyAdmins(title: string, description: string, link: string | null = null): Promise<void> {
  await ensureDb();
  const { getAdminEmails } = await import("@/lib/admin");
  const emails = getAdminEmails();
  if (emails.length === 0) return;

  const rows = (await sql`SELECT id FROM users WHERE LOWER(email) = ANY(${emails})`) as Array<{ id: string }>;
  await Promise.all(rows.map((row) => createNotification(row.id, title, description, link)));
}
