import "server-only";
import { cache } from "react";
import { sql } from "./client";
import { ensureDb } from "./schema";
import { toISODateString, toISOTimestamp } from "./dates";
import { notifyFollowersOfNewOpportunity } from "./follows";
import { slugifyOrganization } from "@/lib/organizations";
import type { EducationLevel, Opportunity, OpportunityType } from "@/types/opportunity";

interface OpportunityRow {
  id: string;
  title: string;
  organization: string;
  location: string;
  type: string;
  status: string;
  deadline: string | null;
  days_left: number | null;
  date: string | null;
  description: string;
  tags: string;
  image: string;
  featured: boolean;
  level: string | null;
  exam_date: unknown; // Postgres DATE — comes back as a Date object, see toISODateString
  oral_exam_date: unknown;
  deadline_date: unknown;
  specialization: string | null;
  grade: string | null;
  positions_count: number | null;
  website: string | null;
  is_public: boolean;
  created_by_user_id: string | null;
  created_at: unknown; // Postgres TIMESTAMPTZ — see toISOTimestamp
  updated_at: unknown;
  keywords: string | null;
}

function daysBetweenTodayAnd(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${isoDate}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const PLACEHOLDER_COLORS = ["#7C3AED", "#0EA5A4", "#1D4ED8", "#DC2626", "#EA580C", "#0369A1", "#4338CA"];

/**
 * Some opportunities never get a logo — the "Add a concours" form doesn't
 * ask for one, and it's optional in the admin form and Excel import too.
 * Never store/return an empty src, since <img src=""> re-requests the whole
 * page. Generate a stable colored-initials placeholder instead.
 */
export function placeholderLogo(organization: string): string {
  const initials = (organization || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colorIndex = organization.length % PLACEHOLDER_COLORS.length;
  const color = PLACEHOLDER_COLORS[colorIndex];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" rx="28" fill="${color}"/><text x="50%" y="54%" font-family="Arial, sans-serif" font-size="84" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function formatDateLabel(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function rowToOpportunity(row: OpportunityRow, orgLogos: Record<string, string> = {}): Opportunity {
  const deadlineDate = toISODateString(row.deadline_date);
  const examDate = toISODateString(row.exam_date);
  const oralExamDate = toISODateString(row.oral_exam_date);

  // If a real deadline_date is set (admin form / Excel import), compute a
  // live "X days left" instead of trusting a static string that goes stale.
  // Falls back to the legacy stored text for older seeded rows.
  let deadline = row.deadline ?? "Date unknown";
  let daysLeft = row.days_left ?? 0;
  let date = row.date ?? "Date unknown";
  let status = row.status as Opportunity["status"];

  if (deadlineDate) {
    daysLeft = daysBetweenTodayAnd(deadlineDate);
    date = formatDateLabel(deadlineDate);
    status = daysLeft >= 0 ? "open" : "closed";
    deadline = daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? "Last day" : "Closed";
  }

  // Falls back through: this opportunity's own image → the organization's
  // configured logo (set in Manage Organizations) → a generated placeholder.
  // Means an Excel import with no image column still looks right once an
  // admin sets a real logo for that organization — every row updates at once.
  const image = row.image || orgLogos[slugifyOrganization(row.organization)] || placeholderLogo(row.organization);

  return {
    id: row.id,
    title: row.title,
    organization: row.organization,
    location: row.location,
    type: row.type as OpportunityType,
    status,
    deadline,
    daysLeft,
    date,
    description: row.description,
    tags: JSON.parse(row.tags) as string[],
    image,
    featured: row.featured,
    level: row.level as EducationLevel | null,
    specialization: row.specialization,
    grade: row.grade,
    positionsCount: row.positions_count,
    website: row.website,
    examDate,
    oralExamDate,
    deadlineDate,
    isPublic: row.is_public,
    createdByUserId: row.created_by_user_id,
    createdAt: toISOTimestamp(row.created_at) ?? new Date().toISOString(),
    updatedAt: toISOTimestamp(row.updated_at) ?? new Date().toISOString(),
    keywords: row.keywords,
  };
}

async function getOrgLogoMap(): Promise<Record<string, string>> {
  const { getAllOrganizationProfiles } = await import("./organizationProfiles");
  const profiles = await getAllOrganizationProfiles();
  const map: Record<string, string> = {};
  for (const profile of Object.values(profiles)) {
    if (profile.logo) map[profile.slug] = profile.logo;
  }
  return map;
}

export interface DuplicateGroup {
  organization: string;
  title: string;
  opportunities: Opportunity[];
}

/**
 * Finds groups of 2+ public opportunities that share the same organization +
 * title (case-insensitive) — for cleaning up anything that slipped through
 * before duplicate prevention existed on create. A real bulk import run
 * more than once, or overlapping with another admin's import, was the risk.
 */
export async function findDuplicateOpportunities(): Promise<DuplicateGroup[]> {
  await ensureDb();
  const dupeKeys = (await sql`
    SELECT
      LOWER(TRIM(organization)) AS org_key,
      LOWER(TRIM(title)) AS title_key,
      LOWER(TRIM(location)) AS location_key,
      COALESCE(LOWER(TRIM(level)), '') AS level_key
    FROM opportunities
    WHERE is_public = true
    GROUP BY org_key, title_key, location_key, level_key
    HAVING COUNT(*) > 1
  `) as Array<{ org_key: string; title_key: string; location_key: string; level_key: string }>;

  if (dupeKeys.length === 0) return [];

  const allOpportunities = await getOpportunities();
  const groups: DuplicateGroup[] = [];

  for (const key of dupeKeys) {
    const matches = allOpportunities.filter(
      (o) =>
        o.organization.trim().toLowerCase() === key.org_key &&
        o.title.trim().toLowerCase() === key.title_key &&
        o.location.trim().toLowerCase() === key.location_key &&
        (o.level?.trim().toLowerCase() ?? "") === key.level_key
    );
    if (matches.length > 1) {
      groups.push({ organization: matches[0].organization, title: matches[0].title, opportunities: matches });
    }
  }

  return groups;
}

/**
 * Public (admin-added/seeded) opportunities, plus this user's own private
 * submissions if a userId is given. Without a userId, only public ones —
 * this is what guest/logged-out browsing sees.
 *
 * Wrapped in cache() — pages with generateMetadata call this once for the
 * metadata and once for the page body; without caching that's two separate
 * database round-trips for identical data on every single page load.
 */
export const getOpportunities = cache(async (userId?: string): Promise<Opportunity[]> => {
  await ensureDb();
  const [rows, orgLogos] = await Promise.all([
    userId
      ? (sql`SELECT * FROM opportunities WHERE is_public = true OR created_by_user_id = ${userId} ORDER BY created_at DESC` as unknown as Promise<OpportunityRow[]>)
      : (sql`SELECT * FROM opportunities WHERE is_public = true ORDER BY created_at DESC` as unknown as Promise<OpportunityRow[]>),
    getOrgLogoMap(),
  ]);
  return rows.map((row) => rowToOpportunity(row, orgLogos));
});

export const getOpportunityById = cache(async (id: string): Promise<Opportunity | undefined> => {
  await ensureDb();
  const [rows, orgLogos] = await Promise.all([
    sql`SELECT * FROM opportunities WHERE id = ${id}` as unknown as Promise<OpportunityRow[]>,
    getOrgLogoMap(),
  ]);
  return rows[0] ? rowToOpportunity(rows[0], orgLogos) : undefined;
});

/** Private submissions waiting for an admin to review and optionally publish. */
export async function getPrivateSubmissions(): Promise<Opportunity[]> {
  await ensureDb();
  const [rows, orgLogos] = await Promise.all([
    sql`
      SELECT o.*, u.name AS submitter_name FROM opportunities o
      LEFT JOIN users u ON u.id = o.created_by_user_id
      WHERE o.is_public = false
      ORDER BY o.id DESC
    ` as unknown as Promise<Array<OpportunityRow & { submitter_name: string | null }>>,
    getOrgLogoMap(),
  ]);
  return rows.map((row) => rowToOpportunity(row, orgLogos));
}

export async function promoteOpportunity(id: string): Promise<void> {
  await ensureDb();
  await sql`UPDATE opportunities SET is_public = true WHERE id = ${id}`;

  const rows = (await sql`SELECT title, organization FROM opportunities WHERE id = ${id}`) as Array<{
    title: string;
    organization: string;
  }>;
  const row = rows[0];
  if (row) {
    await notifyFollowersOfNewOpportunity(slugifyOrganization(row.organization), row.organization, row.title, id);
  }
}

function slugify(title: string, organization: string): string {
  const base = `${title}-${organization}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface NewOpportunityInput {
  title: string;
  organization: string;
  location: string;
  type: OpportunityType;
  level: EducationLevel | null;
  image: string;
  description: string;
  tags: string[];
  examDate: string | null; // ISO date — written exam
  oralExamDate: string | null; // ISO date — oral exam
  deadlineDate: string | null; // ISO date
  specialization: string | null; // تخصص
  grade: string | null; // الدرجة
  positionsCount: number | null; // عدد المناصب
  website: string | null;
  keywords: string | null;
}

/** Used by both the admin form (one row) and the Excel importer (many rows). Always public. */
/** True if a public opportunity with this exact organization + title already exists (case-insensitive, trimmed). */
async function findDuplicateOpportunity(
  organization: string,
  title: string,
  location: string,
  level: string | null
): Promise<string | null> {
  const rows = (await sql`
    SELECT id FROM opportunities
    WHERE is_public = true
      AND LOWER(TRIM(organization)) = LOWER(TRIM(${organization}))
      AND LOWER(TRIM(title)) = LOWER(TRIM(${title}))
      AND LOWER(TRIM(location)) = LOWER(TRIM(${location}))
      AND COALESCE(LOWER(TRIM(level)), '') = COALESCE(LOWER(TRIM(${level})), '')
    LIMIT 1
  `) as Array<{ id: string }>;
  return rows[0]?.id ?? null;
}

/**
 * Used by both the admin form (one row) and the Excel importer (many rows). Always public.
 * Skips creating a duplicate — same organization + title (case-insensitive) as an opportunity
 * that already exists — since nothing here previously prevented that, and a large bulk import
 * run twice (or overlapping with another) would otherwise silently double every row.
 */
export async function createOpportunity(input: NewOpportunityInput): Promise<{ id: string; duplicate: boolean }> {
  await ensureDb();

  const existingId = await findDuplicateOpportunity(input.organization, input.title, input.location, input.level);
  if (existingId) {
    return { id: existingId, duplicate: true };
  }

  const id = slugify(input.title, input.organization);

  await sql`
    INSERT INTO opportunities
      (id, title, organization, location, type, status, deadline, days_left, date,
       description, tags, image, featured, level, exam_date, oral_exam_date, deadline_date,
       specialization, grade, positions_count, website, keywords, is_public)
    VALUES
      (${id}, ${input.title}, ${input.organization}, ${input.location}, ${input.type},
       'open', 'Date unknown', 0, 'Date unknown',
       ${input.description || ""}, ${JSON.stringify(input.tags)}, ${input.image || ""}, false,
       ${input.level}, ${input.examDate}, ${input.oralExamDate}, ${input.deadlineDate},
       ${input.specialization}, ${input.grade}, ${input.positionsCount}, ${input.website}, ${input.keywords}, true)
  `;

  const orgSlug = slugifyOrganization(input.organization);
  const { ensureOrganizationProfile } = await import("./organizationProfiles");
  await ensureOrganizationProfile(orgSlug, input.organization);

  await notifyFollowersOfNewOpportunity(orgSlug, input.organization, input.title, id);
  return { id, duplicate: false };
}

/**
 * Permanently deletes an opportunity. Anyone tracking it (saved or applied)
 * automatically loses that row too — applications.opportunity_id has
 * ON DELETE CASCADE, so this needs no manual cleanup.
 */
export async function deleteOpportunity(id: string): Promise<void> {
  await ensureDb();
  await sql`DELETE FROM opportunities WHERE id = ${id}`;
}

/**
 * Deletes every opportunity in the database — a real, destructive bulk action
 * (e.g. clearing out test/imported data). Scoped to opportunities only: user
 * accounts, sessions, and organization profiles/logos are never touched here.
 * Applications cascade-delete automatically (ON DELETE CASCADE on
 * applications.opportunity_id), so no separate cleanup is needed for those.
 * The UI-side confirmation is what actually protects this — see
 * ClearOpportunitiesButton — this function itself just does what it's told.
 */
export async function deleteAllOpportunities(): Promise<number> {
  await ensureDb();
  const rows = (await sql`DELETE FROM opportunities RETURNING id`) as Array<{ id: string }>;
  return rows.length;
}

interface BackupOpportunityRow {
  id: string;
  title: string;
  organization: string;
  location: string;
  type: string;
  status: string;
  description: string;
  tags: string[];
  image: string;
  level?: string | null;
  specialization?: string | null;
  grade?: string | null;
  positionsCount?: number | null;
  website?: string | null;
  examDate?: string | null;
  oralExamDate?: string | null;
  deadlineDate?: string | null;
  isPublic?: boolean;
  createdByUserId?: string | null;
}

interface BackupApplicationRow {
  user_id: string;
  opportunity_id: string;
  saved: boolean;
  stage: string | null;
  user_exam_date: string | null;
  user_oral_exam_date: string | null;
}

/**
 * Restores opportunities (full replace) and tracking data from a backup
 * export. Deliberately scoped to just these two — no organization profiles,
 * no user accounts. Applications are restored only for users that still
 * exist right now; anything referencing a user no longer in the database
 * is skipped and counted, not silently dropped.
 */
export async function restoreFromBackup(backup: {
  opportunities?: BackupOpportunityRow[];
  applications?: BackupApplicationRow[];
}): Promise<{ restoredOpportunities: number; restoredApplications: number; skippedApplications: number }> {
  await ensureDb();

  await sql`DELETE FROM opportunities`;

  let restoredOpportunities = 0;
  const opportunities = backup.opportunities ?? [];
  for (let i = 0; i < opportunities.length; i += 10) {
    const batch = opportunities.slice(i, i + 10);
    await Promise.all(
      batch.map((o) =>
        sql`
          INSERT INTO opportunities (
            id, title, organization, location, type, status, description, tags, image,
            level, specialization, grade, positions_count, website,
            exam_date, oral_exam_date, deadline_date, is_public, created_by_user_id
          ) VALUES (
            ${o.id}, ${o.title}, ${o.organization}, ${o.location}, ${o.type}, ${o.status},
            ${o.description}, ${o.tags}, ${o.image},
            ${o.level ?? null}, ${o.specialization ?? null}, ${o.grade ?? null}, ${o.positionsCount ?? null}, ${o.website ?? null},
            ${o.examDate ?? null}, ${o.oralExamDate ?? null}, ${o.deadlineDate ?? null},
            ${o.isPublic ?? true}, ${o.createdByUserId ?? null}
          )
          ON CONFLICT (id) DO NOTHING
        `
      )
    );
    restoredOpportunities += batch.length;
  }

  let restoredApplications = 0;
  let skippedApplications = 0;
  const applications = backup.applications ?? [];
  if (applications.length > 0) {
    const existingUserRows = (await sql`SELECT id FROM users`) as Array<{ id: string }>;
    const existingUserIds = new Set(existingUserRows.map((r) => r.id));

    for (const app of applications) {
      if (!existingUserIds.has(app.user_id)) {
        skippedApplications++;
        continue;
      }
      await sql`
        INSERT INTO applications (user_id, opportunity_id, saved, stage, user_exam_date, user_oral_exam_date)
        VALUES (${app.user_id}, ${app.opportunity_id}, ${app.saved}, ${app.stage}, ${app.user_exam_date}, ${app.user_oral_exam_date})
        ON CONFLICT (user_id, opportunity_id) DO UPDATE SET
          saved = EXCLUDED.saved,
          stage = EXCLUDED.stage,
          user_exam_date = EXCLUDED.user_exam_date,
          user_oral_exam_date = EXCLUDED.user_oral_exam_date
      `;
      restoredApplications++;
    }
  }

  return { restoredOpportunities, restoredApplications, skippedApplications };
}

/** Edits an existing opportunity in place — used for reviewing/fixing a community submission before publishing, or general admin corrections. */
export async function updateOpportunity(id: string, input: NewOpportunityInput): Promise<void> {
  await ensureDb();
  await sql`
    UPDATE opportunities SET
      title = ${input.title},
      organization = ${input.organization},
      location = ${input.location},
      type = ${input.type},
      level = ${input.level},
      image = ${input.image || ""},
      description = ${input.description || ""},
      tags = ${JSON.stringify(input.tags)},
      exam_date = ${input.examDate},
      oral_exam_date = ${input.oralExamDate},
      deadline_date = ${input.deadlineDate},
      specialization = ${input.specialization},
      grade = ${input.grade},
      positions_count = ${input.positionsCount},
      website = ${input.website},
      keywords = ${input.keywords},
      updated_at = now()
    WHERE id = ${id}
  `;
}

export async function bulkInsertOpportunities(
  inputs: NewOpportunityInput[]
): Promise<{ inserted: number; duplicates: number }> {
  const BATCH_SIZE = 10; // parallel within a batch, sequential across batches — fast without overwhelming the DB connection pool
  let inserted = 0;
  let duplicates = 0;

  for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
    const batch = inputs.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((input) => createOpportunity(input)));
    for (const result of results) {
      if (result.duplicate) duplicates++;
      else inserted++;
    }
  }

  return { inserted, duplicates };
}

export interface NewUserConcoursInput {
  title: string;
  organization: string;
  location: string;
  type: OpportunityType;
  examDate: string | null;
  oralExamDate: string | null;
  deadlineDate: string | null;
  description: string;
}

/**
 * Any signed-in user can add a concours they know about for their own
 * tracking — private by default, visible only to them, until an admin
 * reviews and promotes it to the public list.
 */
export async function getUserCreatedConcoursCount(userId: string): Promise<number> {
  await ensureDb();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count FROM opportunities WHERE created_by_user_id = ${userId}
  `) as Array<{ count: number }>;
  return rows[0]?.count ?? 0;
}

export async function createUserConcours(
  userId: string,
  input: NewUserConcoursInput,
  unlimited: boolean
): Promise<{ id: string | null; limitReached?: "track" | "add" }> {
  await ensureDb();

  if (!unlimited) {
    const { getTrackedOpportunityCount } = await import("./applications");
    const { FREE_TRACK_LIMIT, FREE_CONCOURS_ADD_LIMIT } = await import("@/lib/subscription");

    const addedCount = await getUserCreatedConcoursCount(userId);
    if (addedCount >= FREE_CONCOURS_ADD_LIMIT) return { id: null, limitReached: "add" };

    const trackedCount = await getTrackedOpportunityCount(userId);
    if (trackedCount >= FREE_TRACK_LIMIT) return { id: null, limitReached: "track" };
  }

  const id = slugify(input.title, input.organization);

  await sql`
    INSERT INTO opportunities
      (id, title, organization, location, type, status, deadline, days_left, date,
       description, tags, image, featured, exam_date, oral_exam_date, deadline_date,
       is_public, created_by_user_id)
    VALUES
      (${id}, ${input.title}, ${input.organization}, ${input.location}, ${input.type},
       'open', 'Date unknown', 0, 'Date unknown',
       ${input.description || ""}, '[]', '', false,
       ${input.examDate}, ${input.oralExamDate}, ${input.deadlineDate},
       false, ${userId})
  `;

  // They already know about it (that's usually why they're adding it) — track
  // it as Applied, not just Saved, so it shows up where it actually belongs.
  await sql`
    INSERT INTO applications (user_id, opportunity_id, stage)
    VALUES (${userId}, ${id}, 'applied')
    ON CONFLICT (user_id, opportunity_id) DO UPDATE SET stage = 'applied'
  `;

  const { ensureOrganizationProfile } = await import("./organizationProfiles");
  await ensureOrganizationProfile(slugifyOrganization(input.organization), input.organization);

  const { notifyAdmins } = await import("./notifications");
  await notifyAdmins(
    "📝 New community submission",
    `A user privately added "${input.title}" (${input.organization}) — review it in Community Submissions.`,
    "/admin"
  );

  return { id };
}
