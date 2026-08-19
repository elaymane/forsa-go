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

/**
 * Real view counts for a set of opportunities, keyed by id. One query for
 * the whole batch — never called per-card, which would be a real N+1 problem
 * on a page showing dozens of opportunities at once. Counts visits to the
 * standalone /opportunities/[id] page specifically — in-app card clicks that
 * open the detail popup without navigating there aren't included, since
 * that's genuinely what page_views tracks.
 */
export async function getOpportunityViewCounts(opportunityIds: string[]): Promise<Record<string, number>> {
  if (opportunityIds.length === 0) return {};
  await ensureDb();
  const paths = opportunityIds.map((id) => `/opportunities/${id}`);
  const rows = (await sql`
    SELECT path, COUNT(*)::int AS count
    FROM page_views
    WHERE path = ANY(${paths})
    GROUP BY path
  `) as Array<{ path: string; count: number }>;

  const result: Record<string, number> = {};
  for (const row of rows) {
    const id = row.path.replace("/opportunities/", "");
    result[id] = row.count;
  }
  return result;
}
