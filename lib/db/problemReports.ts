import "server-only";
import { sql } from "./client";
import { ensureDb } from "./schema";
import { toISOTimestamp } from "./dates";

export async function submitProblemReport(input: {
  userId: string | null;
  userName: string;
  userEmail: string;
  pageUrl: string | null;
  description: string;
}): Promise<void> {
  await ensureDb();
  await sql`
    INSERT INTO problem_reports (user_id, user_name, user_email, page_url, description)
    VALUES (${input.userId}, ${input.userName}, ${input.userEmail}, ${input.pageUrl}, ${input.description})
  `;

  const { notifyAdmins } = await import("./notifications");
  await notifyAdmins(
    "🐛 New problem report",
    `${input.userName} (${input.userEmail}) reported an issue${input.pageUrl ? ` on ${input.pageUrl}` : ""} — check the admin panel for details.`,
    "/admin"
  );
}

export interface ProblemReport {
  id: number;
  userName: string;
  userEmail: string;
  pageUrl: string | null;
  description: string;
  status: "new" | "resolved";
  createdAt: string;
}

export async function getProblemReports(): Promise<ProblemReport[]> {
  await ensureDb();
  const rows = (await sql`
    SELECT id, user_name, user_email, page_url, description, status, created_at
    FROM problem_reports
    ORDER BY (status = 'new') DESC, created_at DESC
  `) as Array<{
    id: number;
    user_name: string;
    user_email: string;
    page_url: string | null;
    description: string;
    status: string;
    created_at: unknown;
  }>;

  return rows.map((r) => ({
    id: r.id,
    userName: r.user_name,
    userEmail: r.user_email,
    pageUrl: r.page_url,
    description: r.description,
    status: r.status === "resolved" ? "resolved" : "new",
    createdAt: toISOTimestamp(r.created_at) ?? new Date().toISOString(),
  }));
}

export async function markReportResolved(id: number): Promise<void> {
  await ensureDb();
  await sql`UPDATE problem_reports SET status = 'resolved' WHERE id = ${id}`;
}
