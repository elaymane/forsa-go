import "server-only";
import { sql } from "./client";
import { ensureDb } from "./schema";
import { toISOTimestamp } from "./dates";

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

export interface TrackedOpportunity {
  id: string;
  title: string;
  type: string;
}

export interface UserTrackingStats {
  id: string;
  name: string;
  email: string;
  trackedCount: number;
  trackedOpportunities: TrackedOpportunity[];
  lastActiveAt: string | null;
  isActive: boolean;
}

/**
 * Per-user tracking overview for the admin panel — how many opportunities
 * each user is tracking (any row in applications: saved or an active
 * application stage), the actual list of those opportunities, and when the
 * user was last active, derived from real page_views timestamps since
 * there's no dedicated last-login field. "Active" uses a 30-day cutoff.
 *
 * Applications and page_views are aggregated in separate subqueries before
 * joining — joining both tables directly against users would multiply rows
 * (one visit x one tracked opportunity = one row each), which would have
 * silently inflated both the opportunity list and the count.
 */
export async function getUserTrackingStats(): Promise<UserTrackingStats[]> {
  await ensureDb();
  const rows = (await sql`
    SELECT
      u.id,
      u.name,
      u.email,
      COALESCE(t.tracked, '[]'::json) AS tracked,
      lv.last_active_at
    FROM users u
    LEFT JOIN (
      SELECT
        a.user_id,
        json_agg(json_build_object('id', o.id, 'title', o.title, 'type', o.type) ORDER BY a.updated_at DESC) AS tracked
      FROM applications a
      JOIN opportunities o ON o.id = a.opportunity_id
      GROUP BY a.user_id
    ) t ON t.user_id = u.id
    LEFT JOIN (
      SELECT user_id, MAX(created_at) AS last_active_at
      FROM page_views
      WHERE user_id IS NOT NULL
      GROUP BY user_id
    ) lv ON lv.user_id = u.id
    ORDER BY lv.last_active_at DESC NULLS LAST
  `) as Array<{
    id: string;
    name: string;
    email: string;
    tracked: TrackedOpportunity[];
    last_active_at: unknown;
  }>;

  const now = Date.now();
  return rows.map((row) => {
    const lastActiveAt = toISOTimestamp(row.last_active_at);
    const isActive = lastActiveAt ? now - new Date(lastActiveAt).getTime() <= 30 * 24 * 60 * 60 * 1000 : false;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      trackedCount: row.tracked.length,
      trackedOpportunities: row.tracked,
      lastActiveAt,
      isActive,
    };
  });
}
