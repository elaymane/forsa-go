import "server-only";
import { sql } from "./client";
import { ensureDb } from "./schema";

export async function logPageView(visitorId: string, userId: string | null, path: string): Promise<void> {
  await ensureDb();
  await sql`
    INSERT INTO page_views (visitor_id, user_id, path) VALUES (${visitorId}, ${userId}, ${path})
  `;
}

export interface AnalyticsSnapshot {
  visitorsToday: number;
  pageViewsToday: number;
  activeNow: number; // unique visitors with activity in the last 15 minutes
  totalUsers: number;
  newUsersToday: number;
}

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  await ensureDb();

  const [visitorsToday, pageViewsToday, activeNow, totalUsers, newUsersToday] = await Promise.all([
    sql`
      SELECT COUNT(DISTINCT visitor_id)::int AS count FROM page_views
      WHERE created_at >= date_trunc('day', now())
    `,
    sql`
      SELECT COUNT(*)::int AS count FROM page_views
      WHERE created_at >= date_trunc('day', now())
    `,
    sql`
      SELECT COUNT(DISTINCT visitor_id)::int AS count FROM page_views
      WHERE created_at >= now() - interval '15 minutes'
    `,
    sql`SELECT COUNT(*)::int AS count FROM users`,
    sql`SELECT COUNT(*)::int AS count FROM users WHERE created_at >= date_trunc('day', now())`,
  ]);

  const count = (rows: unknown) => (rows as { count: number }[])[0].count;

  return {
    visitorsToday: count(visitorsToday),
    pageViewsToday: count(pageViewsToday),
    activeNow: count(activeNow),
    totalUsers: count(totalUsers),
    newUsersToday: count(newUsersToday),
  };
}

/** Visitor counts for each of the last 7 days, oldest first — for a small trend chart. */
export async function getWeeklyVisitorTrend(): Promise<Array<{ date: string; visitors: number }>> {
  await ensureDb();
  const rows = (await sql`
    SELECT
      to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
      COUNT(DISTINCT visitor_id)::int AS visitors
    FROM page_views
    WHERE created_at >= now() - interval '7 days'
    GROUP BY day
    ORDER BY day ASC
  `) as Array<{ day: string; visitors: number }>;

  return rows.map((r) => ({ date: r.day, visitors: r.visitors }));
}
