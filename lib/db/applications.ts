import "server-only";
import { after } from "next/server";
import { sql } from "./client";
import { ensureDb } from "./schema";
import { createNotification } from "./notifications";
import { toISODateString, toISOTimestamp, daysBetweenTodayAnd } from "./dates";
import { STAGE_ORDER, STAGE_LABELS, type ApplicationStage, type TimelineEvent } from "@/types/opportunity";
import { FREE_TRACK_LIMIT } from "@/lib/subscription";

export type { ApplicationStage };
export { STAGE_ORDER, STAGE_LABELS };

export interface ApplicationState {
  saved: boolean;
  stage: ApplicationStage | null;
  /** User's own written-exam date, when the admin hasn't announced one. */
  userExamDate: string | null;
  /** User's own oral-exam date, when the admin hasn't announced one. */
  userOralExamDate: string | null;
  /** When this opportunity was first saved/applied to. */
  createdAt: string;
}

interface ApplicationRow {
  opportunity_id: string;
  saved: boolean;
  stage: string | null;
  user_exam_date: unknown; // Postgres DATE — see toISODateString
  user_oral_exam_date: unknown;
  created_at: unknown; // Postgres TIMESTAMPTZ — see toISOTimestamp
}

function rowToState(row: ApplicationRow): ApplicationState {
  return {
    saved: row.saved,
    stage: (row.stage as ApplicationStage | null) ?? null,
    userExamDate: toISODateString(row.user_exam_date),
    userOralExamDate: toISODateString(row.user_oral_exam_date),
    createdAt: toISOTimestamp(row.created_at) ?? new Date().toISOString(),
  };
}

/** Map of opportunityId -> application state for this user's activity only. */
export async function getApplicationsMap(userId: string): Promise<Record<string, ApplicationState>> {
  await ensureDb();
  const rows = (await sql`
    SELECT opportunity_id, saved, stage, user_exam_date, user_oral_exam_date, created_at
    FROM applications WHERE user_id = ${userId}
  `) as ApplicationRow[];

  const map: Record<string, ApplicationState> = {};
  for (const row of rows) {
    map[row.opportunity_id] = rowToState(row);
  }
  return map;
}

/**
 * "Your" Future Timeline — opportunities this user has actually applied to
 * and hasn't finished yet (applied / written / oral), soonest deadline first.
 */
export async function getMyTimeline(userId: string, limit = 5): Promise<TimelineEvent[]> {
  await ensureDb();

  const rows = (await sql`
    SELECT o.id, o.title, o.organization, o.date, o.days_left, a.stage,
           a.user_exam_date, a.user_oral_exam_date
    FROM applications a
    JOIN opportunities o ON o.id = a.opportunity_id
    WHERE a.user_id = ${userId} AND a.stage IN ('applied', 'written', 'oral')
    ORDER BY o.days_left ASC
    LIMIT ${limit}
  `) as Array<{
    id: string;
    title: string;
    organization: string;
    date: string;
    days_left: number;
    stage: Exclude<ApplicationStage, "rejected">;
    user_exam_date: unknown; // Postgres DATE — comes back as a Date object, see toISODateString
    user_oral_exam_date: unknown;
  }>;

  return rows.map((row) => {
    // The official date is what o.date reflects — but if nothing official
    // has been set, the user's own personally-entered date is what they
    // actually want to see here, not a leftover "not specified" placeholder.
    const personalDate = toISODateString(row.stage === "oral" ? row.user_oral_exam_date : row.user_exam_date);
    const hasOfficialDate = row.date && row.date !== "Date limite non précisée" && row.date !== "Date unknown";
    const daysLeft = hasOfficialDate || !personalDate ? row.days_left : daysBetweenTodayAnd(personalDate);

    return {
      id: row.id,
      opportunity: row.title,
      organization: row.organization,
      phase: STAGE_LABELS[row.stage],
      date: hasOfficialDate ? row.date : personalDate ?? row.date,
      daysLeft,
    };
  });
}

async function ensureRow(userId: string, opportunityId: string) {
  await sql`
    INSERT INTO applications (user_id, opportunity_id, saved, stage)
    VALUES (${userId}, ${opportunityId}, false, NULL)
    ON CONFLICT (user_id, opportunity_id) DO NOTHING
  `;
}

/** Site-wide total — every saved-or-in-progress application across all users. Real number for the landing page. */
export async function getTotalApplicationsTracked(): Promise<number> {
  await ensureDb();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count FROM applications WHERE saved = true OR stage IS NOT NULL
  `) as Array<{ count: number }>;
  return rows[0]?.count ?? 0;
}

/** Opportunities currently saved or in-progress — what counts against the free-tier limit. */
export async function getTrackedOpportunityCount(userId: string): Promise<number> {
  await ensureDb();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count FROM applications
    WHERE user_id = ${userId} AND (saved = true OR stage IS NOT NULL)
  `) as Array<{ count: number }>;
  return rows[0]?.count ?? 0;
}

export async function toggleSaved(
  userId: string,
  opportunityId: string,
  unlimited: boolean
): Promise<{ ok: boolean; limitReached?: boolean }> {
  await ensureDb();
  await ensureRow(userId, opportunityId);

  const rows = (await sql`
    SELECT saved, stage FROM applications WHERE user_id = ${userId} AND opportunity_id = ${opportunityId}
  `) as Array<{ saved: boolean; stage: string | null }>;
  const row = rows[0];
  const isCurrentlyUntracked = row && !row.saved && row.stage === null;
  const wouldAddNewTrackedItem = isCurrentlyUntracked; // going saved:false -> true adds a new tracked item

  if (wouldAddNewTrackedItem && !unlimited) {
    const count = await getTrackedOpportunityCount(userId);
    if (count >= FREE_TRACK_LIMIT) return { ok: false, limitReached: true };
  }

  await sql`
    UPDATE applications
    SET saved = NOT saved, updated_at = now()
    WHERE user_id = ${userId} AND opportunity_id = ${opportunityId}
  `;
  return { ok: true };
}

/** Moves an application to the next pipeline stage: null → applied → written → oral → accepted. */
export async function advanceStage(
  userId: string,
  opportunityId: string,
  unlimited: boolean
): Promise<{ ok: boolean; limitReached?: boolean; expired?: boolean }> {
  await ensureDb();
  await ensureRow(userId, opportunityId);

  const rows = await sql`
    SELECT saved, stage FROM applications WHERE user_id = ${userId} AND opportunity_id = ${opportunityId}
  `;
  const row = rows[0] as { saved: boolean; stage: string | null };
  const current = row.stage as ApplicationStage | null;
  if (current === "accepted" || current === "rejected") return { ok: true };

  // First-ever apply — the one place a passed deadline should actually
  // block something. Advancing further stages (written/oral/accepted) on
  // something already applied to is fine even past the deadline; it's the
  // new application that shouldn't be possible once it's closed.
  if (current === null) {
    const oppRows = (await sql`SELECT deadline_date FROM opportunities WHERE id = ${opportunityId}`) as Array<{
      deadline_date: unknown;
    }>;
    const { toISODateString } = await import("./dates");
    const deadlineDate = toISODateString(oppRows[0]?.deadline_date);
    if (deadlineDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(`${deadlineDate}T00:00:00`) < today) {
        return { ok: false, expired: true };
      }
    }
  }

  const wouldAddNewTrackedItem = current === null && !row.saved; // first-ever apply, not already saved

  if (wouldAddNewTrackedItem && !unlimited) {
    const count = await getTrackedOpportunityCount(userId);
    if (count >= FREE_TRACK_LIMIT) return { ok: false, limitReached: true };
  }

  const next: ApplicationStage =
    current === null ? "applied" : STAGE_ORDER[STAGE_ORDER.indexOf(current) + 1] ?? current;

  await sql`
    UPDATE applications SET stage = ${next}, updated_at = now()
    WHERE user_id = ${userId} AND opportunity_id = ${opportunityId}
  `;

  if (next === "accepted") {
    const oppRows = (await sql`SELECT title FROM opportunities WHERE id = ${opportunityId}`) as Array<{
      title: string;
    }>;
    const title = oppRows[0]?.title ?? "your application";
    await createNotification(
      userId,
      "🎉 You got accepted!",
      `Congratulations — you've been accepted to ${title}.`,
      `/opportunities/${opportunityId}`
    );
  }

  return { ok: true };
}

/** Withdraws an in-progress application. No-op if it was never applied to. */
export async function withdrawApplication(userId: string, opportunityId: string) {
  await ensureDb();
  await ensureRow(userId, opportunityId);
  await sql`
    UPDATE applications
    SET stage = 'rejected', updated_at = now()
    WHERE user_id = ${userId} AND opportunity_id = ${opportunityId} AND stage IN ('applied', 'written', 'oral')
  `;
}

/**
 * Lets a user record their own written or oral exam date when the admin
 * hasn't announced one yet — this is what powers their personal tracking
 * once an official date is missing.
 */
export async function setUserExamDate(
  userId: string,
  opportunityId: string,
  kind: "written" | "oral",
  date: string | null
) {
  await ensureDb();
  await ensureRow(userId, opportunityId);
  if (kind === "written") {
    await sql`
      UPDATE applications SET user_exam_date = ${date}, updated_at = now()
      WHERE user_id = ${userId} AND opportunity_id = ${opportunityId}
    `;
  } else {
    await sql`
      UPDATE applications SET user_oral_exam_date = ${date}, updated_at = now()
      WHERE user_id = ${userId} AND opportunity_id = ${opportunityId}
    `;
  }
}

const REMINDER_WINDOW_DAYS = 3;

function daysUntil(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${isoDate}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Runs automatically whenever the user visits the dashboard — no manual
 * trigger, no cron job needed. Checks every active application's relevant
 * date (written exam while "applied", oral exam while "written", deadline
 * while only saved) and fires a one-time personal reminder if it's within
 * the window and hasn't already been sent for that specific milestone.
 */
/**
 * Fire-and-forget wrapper around generateDeadlineReminders — every core page
 * (Dashboard, Opportunities, Applications, Calendar) calls this on every
 * single navigation, and reminder-checking has no bearing on what's actually
 * rendered. Blocking the page on it was pure wasted latency paid on every
 * click. Uses Next.js's after() so it's guaranteed to actually run (unlike a
 * bare un-awaited call) while never delaying the response.
 */
export function generateDeadlineRemindersInBackground(userId: string): void {
  after(async () => {
    try {
      await generateDeadlineReminders(userId);
    } catch {
      // Best-effort — a failure here should never affect the page.
    }
  });
}

export async function generateDeadlineReminders(userId: string): Promise<void> {
  await ensureDb();

  const rows = (await sql`
    SELECT
      a.opportunity_id, a.stage, a.saved,
      a.written_reminder_sent, a.oral_reminder_sent, a.deadline_reminder_sent,
      a.user_exam_date, a.user_oral_exam_date,
      o.title, o.exam_date, o.oral_exam_date, o.deadline_date
    FROM applications a
    JOIN opportunities o ON o.id = a.opportunity_id
    WHERE a.user_id = ${userId}
      AND (a.saved = true OR a.stage IN ('applied', 'written'))
  `) as Array<{
    opportunity_id: string;
    stage: string | null;
    saved: boolean;
    written_reminder_sent: boolean;
    oral_reminder_sent: boolean;
    deadline_reminder_sent: boolean;
    user_exam_date: unknown;
    user_oral_exam_date: unknown;
    title: string;
    exam_date: unknown;
    oral_exam_date: unknown;
    deadline_date: unknown;
  }>;

  for (const row of rows) {
    // Written exam reminder — relevant once applied, before the written exam happens.
    if (row.stage === "applied" && !row.written_reminder_sent) {
      const date = toISODateString(row.exam_date) ?? toISODateString(row.user_exam_date);
      if (date) {
        const days = daysUntil(date);
        if (days >= 0 && days <= REMINDER_WINDOW_DAYS) {
          await createNotification(
            userId,
            "⏰ Written exam coming up",
            `${days === 0 ? "Today" : `In ${days} day${days === 1 ? "" : "s"}`} — written exam for ${row.title}.`,
            `/opportunities/${row.opportunity_id}`
          );
          await sql`UPDATE applications SET written_reminder_sent = true WHERE user_id = ${userId} AND opportunity_id = ${row.opportunity_id}`;
        }
      }
    }

    // Oral exam reminder — relevant once past the written stage.
    if (row.stage === "written" && !row.oral_reminder_sent) {
      const date = toISODateString(row.oral_exam_date) ?? toISODateString(row.user_oral_exam_date);
      if (date) {
        const days = daysUntil(date);
        if (days >= 0 && days <= REMINDER_WINDOW_DAYS) {
          await createNotification(
            userId,
            "⏰ Oral exam coming up",
            `${days === 0 ? "Today" : `In ${days} day${days === 1 ? "" : "s"}`} — oral exam for ${row.title}.`,
            `/opportunities/${row.opportunity_id}`
          );
          await sql`UPDATE applications SET oral_reminder_sent = true WHERE user_id = ${userId} AND opportunity_id = ${row.opportunity_id}`;
        }
      }
    }

    // Deadline reminder — relevant while saved but not yet applied.
    if (row.saved && !row.stage && !row.deadline_reminder_sent) {
      const date = toISODateString(row.deadline_date);
      if (date) {
        const days = daysUntil(date);
        if (days >= 0 && days <= REMINDER_WINDOW_DAYS) {
          await createNotification(
            userId,
            "⏰ Deadline approaching",
            `${days === 0 ? "Today" : `In ${days} day${days === 1 ? "" : "s"}`} — application deadline for ${row.title}.`,
            `/opportunities/${row.opportunity_id}`
          );
          await sql`UPDATE applications SET deadline_reminder_sent = true WHERE user_id = ${userId} AND opportunity_id = ${row.opportunity_id}`;
        }
      }
    }
  }
}
