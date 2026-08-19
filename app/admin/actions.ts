"use server";

import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { logAdminAction } from "@/lib/db/auditLog";
import { isAdminEmail } from "@/lib/admin";
import { createOpportunity, updateOpportunity, deleteOpportunity, bulkInsertOpportunities, promoteOpportunity, getOpportunities, deleteAllOpportunities, restoreFromBackup, type NewOpportunityInput } from "@/lib/db/opportunities";
import { upsertOrganizationProfile, deleteOrganizationProfile } from "@/lib/db/organizationProfiles";
import { sql } from "@/lib/db/client";
import { slugifyOrganization } from "@/lib/organizations";
import { activateSubscription, deactivateSubscription, rejectSubscriptionRequest } from "@/lib/db/auth";
import { uploadFieldIfProvided } from "@/lib/upload";
import { EDUCATION_LEVELS, type EducationLevel, type OpportunityType } from "@/types/opportunity";

const VALID_TYPES: OpportunityType[] = ["Concours", "Job", "Internship", "Training", "Scholarship"];
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];

async function requireAdmin(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) return "Admin access required.";
  return null;
}

function parseType(value: string): OpportunityType {
  const match = VALID_TYPES.find((t) => t.toLowerCase() === value.trim().toLowerCase());
  return match ?? "Concours";
}

function parseLevel(value: string): EducationLevel | null {
  const match = EDUCATION_LEVELS.find((l) => l.toLowerCase() === value.trim().toLowerCase());
  return match ?? null;
}

/** Accepts "YYYY-MM-DD" (from a <input type="date">) or common Excel date strings. */
function parseDate(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function parsePositions(value: string): number | null {
  const n = parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Uploads a logo file to Vercel Blob if one was provided. Returns the URL, or null if no file was given. */
async function uploadLogoIfProvided(formData: FormData): Promise<{ url: string | null; error?: string }> {
  return uploadFieldIfProvided(formData, "logoFile", "logos", ALLOWED_LOGO_TYPES);
}

export interface AdminFormState {
  error?: string;
  success?: string;
}

async function parseOpportunityFields(formData: FormData): Promise<
  | { ok: true; input: NewOpportunityInput }
  | { ok: false; error: string }
> {
  const title = String(formData.get("title") ?? "").trim();
  const organization = String(formData.get("organization") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!title || !organization || !location) {
    return { ok: false, error: "Title, organization and location are required." };
  }

  const logoUpload = await uploadLogoIfProvided(formData);
  if (logoUpload.error) return { ok: false, error: logoUpload.error };
  const image = logoUpload.url ?? String(formData.get("image") ?? "").trim();

  let profiles: NewOpportunityInput["profiles"] = null;
  const profilesRaw = String(formData.get("profiles") ?? "");
  if (profilesRaw) {
    try {
      const parsed = JSON.parse(profilesRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        profiles = parsed
          .filter((p) => typeof p?.title === "string" && p.title.trim())
          .map((p) => ({
            title: String(p.title).trim(),
            location: String(p.location ?? "").trim() || undefined,
            level: String(p.level ?? "").trim() || undefined,
            specialty: String(p.specialty ?? "").trim() || undefined,
            positionsCount: p.positionsCount ? Number(p.positionsCount) : undefined,
            missions: Array.isArray(p.missions) ? p.missions.map((m: unknown) => String(m).trim()).filter(Boolean) : [],
            requirements: Array.isArray(p.requirements)
              ? p.requirements.map((r: unknown) => String(r).trim()).filter(Boolean)
              : [],
          }));
        if (profiles.length === 0) profiles = null;
      }
    } catch {
      // Malformed JSON in the hidden field — treat as no profiles rather than failing the whole submission.
    }
  }

  return {
    ok: true,
    input: {
      title,
      organization,
      location,
      type: parseType(String(formData.get("type") ?? "")),
      level: formData
        .getAll("level")
        .map((v) => String(v).trim())
        .filter((v) => EDUCATION_LEVELS.includes(v as EducationLevel))
        .join(", ") || null,
      image,
      description: String(formData.get("description") ?? "").trim(),
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      examDate: parseDate(String(formData.get("examDate") ?? "")),
      oralExamDate: parseDate(String(formData.get("oralExamDate") ?? "")),
      deadlineDate: parseDate(String(formData.get("deadlineDate") ?? "")),
      specialization: String(formData.get("specialization") ?? "").trim() || null,
      grade: String(formData.get("grade") ?? "").trim() || null,
      positionsCount: parsePositions(String(formData.get("positionsCount") ?? "")),
      website: String(formData.get("website") ?? "").trim() || null,
      keywords: String(formData.get("keywords") ?? "").trim() || null,
      contractType: (() => {
        const v = String(formData.get("contractType") ?? "").trim();
        return v === "CDI" || v === "CDD" || v === "Fonction publique" ? v : null;
      })(),
      profiles,
    },
  };
}

export async function createOpportunityAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  const parsed = await parseOpportunityFields(formData);
  if (!parsed.ok) return { error: parsed.error };

  const result = await createOpportunity(parsed.input);
  if (result.duplicate) {
    return { error: `An opportunity with this exact title and organization already exists — nothing was added.` };
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/opportunities");
  return { success: `"${parsed.input.title}" was added.` };
}

export async function importOpportunitiesAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an Excel file (.xlsx) first." };
  }

  let rows: Record<string, string>[];
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
  } catch {
    return { error: "Couldn't read that file — make sure it's a valid .xlsx spreadsheet." };
  }

  if (rows.length === 0) {
    return { error: "That file doesn't have any rows." };
  }

  const get = (row: Record<string, string>, ...keys: string[]) => {
    for (const key of Object.keys(row)) {
      if (keys.includes(key.trim().toLowerCase())) return String(row[key] ?? "").trim();
    }
    return "";
  };

  const inputs: NewOpportunityInput[] = rows
    .map((row) => ({
      title: get(row, "title"),
      organization: get(row, "organization", "org"),
      location: get(row, "location"),
      type: parseType(get(row, "type")),
      level: parseLevel(get(row, "level", "niveau")),
      image: get(row, "image", "logo"),
      description: get(row, "description"),
      tags: get(row, "tags")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      examDate: parseDate(get(row, "examdate", "exam date", "date examen", "written exam date")),
      oralExamDate: parseDate(get(row, "oralexamdate", "oral exam date", "date oral")),
      deadlineDate: parseDate(get(row, "deadlinedate", "deadline date", "date expiration", "expiration")),
      specialization: get(row, "specialization", "تخصص") || null,
      grade: get(row, "grade", "الدرجة") || null,
      positionsCount: parsePositions(get(row, "positionscount", "positions", "عدد المناصب")),
      website: get(row, "website", "site", "url") || null,
      keywords: get(row, "keywords", "mots cles", "mots-clés") || null,
      profiles: null,
      contractType: null,
    }))
    .filter((input) => input.title && input.organization && input.location);

  if (inputs.length === 0) {
    return {
      error: "No valid rows found — make sure Title, Organization and Location columns are filled in.",
    };
  }

  const { inserted, duplicates } = await bulkInsertOpportunities(inputs);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/opportunities");

  const parts = [`Imported ${inserted} opportunit${inserted === 1 ? "y" : "ies"}.`];
  if (duplicates > 0) {
    parts.push(`Skipped ${duplicates} duplicate${duplicates === 1 ? "" : "s"} (same title + organization already existed).`);
  }
  return { success: parts.join(" ") };
}

export async function promoteOpportunityAction(id: string): Promise<{ error?: string }> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  await promoteOpportunity(id);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/opportunities");
  return {};
}

export async function updateOrganizationProfileAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugifyOrganization(name);
  if (!slug || !name) return { error: "Missing organization name." };

  const logoUpload = await uploadLogoIfProvided(formData);
  if (logoUpload.error) return { error: logoUpload.error };
  const pastedUrl = String(formData.get("logo") ?? "").trim();
  const logo = logoUpload.url ?? (pastedUrl || null);

  const typeLabelOverrideRaw = String(formData.get("typeLabelOverride") ?? "").trim();
  const typeLabelOverride =
    typeLabelOverrideRaw === "Recrutement" || typeLabelOverrideRaw === "Concours et admissions" ? typeLabelOverrideRaw : null;

  await upsertOrganizationProfile(slug, name, {
    logo,
    description: String(formData.get("description") ?? "").trim() || null,
    website: String(formData.get("website") ?? "").trim() || null,
    keywords: String(formData.get("keywords") ?? "").trim() || null,
    typeLabelOverride,
  });

  revalidatePath("/admin/organizations");
  revalidatePath("/organizations");
  revalidatePath(`/organizations/${slug}`);
  return { success: `Updated ${name}.` };
}

export async function deleteOrganizationProfileAction(slug: string, name: string): Promise<AdminFormState> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  await deleteOrganizationProfile(slug);

  revalidatePath("/admin/organizations");
  revalidatePath("/organizations");
  revalidatePath(`/organizations/${slug}`);
  return { success: `Removed ${name}.` };
}

export type EditOpportunityFormState = AdminFormState;

export async function updateOpportunityAction(
  id: string,
  _prevState: EditOpportunityFormState,
  formData: FormData
): Promise<EditOpportunityFormState> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  const parsed = await parseOpportunityFields(formData);
  if (!parsed.ok) return { error: parsed.error };

  await updateOpportunity(id, parsed.input);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/opportunities");
  revalidatePath("/organizations");
  return { success: `Saved changes to "${parsed.input.title}".` };
}

export async function activateSubscriptionAction(userId: string): Promise<{ error?: string }> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  await activateSubscription(userId, 1);
  const admin = await getCurrentUser();
  if (admin) await logAdminAction(admin.email, "Activated subscription", `User: ${userId}`);
  revalidatePath("/admin");
  revalidatePath("/subscribe");
  return {};
}

export async function rejectSubscriptionAction(userId: string): Promise<{ error?: string }> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  await rejectSubscriptionRequest(userId);
  const admin = await getCurrentUser();
  if (admin) await logAdminAction(admin.email, "Rejected subscription request", `User: ${userId}`);
  revalidatePath("/admin");
  revalidatePath("/subscribe");
  return {};
}

export async function deactivateSubscriptionAction(userId: string): Promise<{ error?: string }> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  await deactivateSubscription(userId);
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return {};
}

export async function deleteOpportunityAction(id: string): Promise<{ error?: string }> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  await deleteOpportunity(id);
  const admin = await getCurrentUser();
  if (admin) await logAdminAction(admin.email, "Deleted opportunity", `ID: ${id}`);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/opportunities");
  revalidatePath("/organizations");
  return {};
}

/**
 * Backup export — opportunities and tracking data (saved/applied status +
 * pipeline stage) only. Deliberately excludes users and organization
 * profiles: users would mean emails and names sitting in a downloadable
 * file — real PII, not worth the risk for a content backup. Tracking data
 * only ever references an opaque user_id, never anything identifying on
 * its own.
 */
export async function exportBackupAction(): Promise<{ error?: string; data?: string }> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  const [opportunities, applicationRows] = await Promise.all([
    getOpportunities(),
    sql`
      SELECT user_id, opportunity_id, saved, stage, user_exam_date, user_oral_exam_date, created_at, updated_at
      FROM applications
    `,
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    opportunityCount: opportunities.length,
    applicationCount: (applicationRows as unknown[]).length,
    opportunities,
    applications: applicationRows,
  };

  return { data: JSON.stringify(backup, null, 2) };
}

/**
 * Restores opportunities (full replace) and tracking data from a backup.
 * Applications are restored only for users that still exist right now;
 * anything referencing a user no longer in the database is skipped and
 * counted, not silently dropped.
 */
export async function importBackupAction(fileContent: string): Promise<{
  error?: string;
  restoredOpportunities?: number;
  restoredApplications?: number;
  skippedApplications?: number;
}> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  let parsed: Parameters<typeof restoreFromBackup>[0];

  try {
    parsed = JSON.parse(fileContent);
  } catch {
    return { error: "That file isn't valid JSON — make sure it's an unmodified Forsa Go backup export." };
  }

  if (!Array.isArray(parsed.opportunities)) {
    return { error: "This doesn't look like a Forsa Go backup file — missing the opportunities data." };
  }

  const result = await restoreFromBackup(parsed);
  const admin = await getCurrentUser();
  if (admin) {
    await logAdminAction(
      admin.email,
      "Restored backup",
      `${result.restoredOpportunities} opportunities, ${result.restoredApplications} applications`
    );
  }
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/opportunities");
  revalidatePath("/organizations");
  return result;
}

/**
 * Deletes every opportunity — scoped deliberately, not a full database wipe.
 * User accounts, sessions, and organization profiles/logos are untouched, so
 * re-importing afterward doesn't mean rebuilding everything from scratch.
 * Requires the admin to type an exact confirmation phrase client-side before
 * this ever gets called — see ClearOpportunitiesButton.
 */
export async function clearAllOpportunitiesAction(): Promise<{ error?: string; deletedCount?: number }> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  const deletedCount = await deleteAllOpportunities();
  const admin = await getCurrentUser();
  if (admin) await logAdminAction(admin.email, "Cleared all opportunities", `${deletedCount} deleted`);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/opportunities");
  revalidatePath("/organizations");
  return { deletedCount };
}

export async function markReportResolvedAction(id: number): Promise<{ error?: string }> {
  const adminError = await requireAdmin();
  if (adminError) return { error: adminError };

  const { markReportResolved } = await import("@/lib/db/problemReports");
  await markReportResolved(id);
  revalidatePath("/admin");
  return {};
}
