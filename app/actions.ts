"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import {
  toggleSaved,
  advanceStage,
  withdrawApplication,
  setUserExamDate,
} from "@/lib/db/applications";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/db/notifications";
import { createUserConcours } from "@/lib/db/opportunities";
import { followOrganization, unfollowOrganization } from "@/lib/db/follows";
import {
  createSession,
  createUser,
  deleteSession,
  findUserByEmail,
  verifyCredentials,
  createPasswordResetToken,
  resetPasswordWithToken,
  requestSubscription,
  changePassword,
} from "@/lib/db/auth";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/db/rateLimit";
import { hasUnlimitedTracking } from "@/lib/subscription";
import { isManagerTier } from "@/lib/managerTiers";
import { uploadFieldIfProvided } from "@/lib/upload";
import { SESSION_COOKIE, ACTING_AS_COOKIE, getCurrentUser, getActingUser } from "@/lib/session";
import type { OpportunityType } from "@/types/opportunity";

function revalidateAppPages() {
  revalidatePath("/dashboard");
  revalidatePath("/opportunities");
}

async function requireUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be signed in to do that.");
  return user.id;
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be signed in to do that.");
  return user;
}

/**
 * Same as requireUser, but for actions a managed (linked) account must never
 * be able to do themselves — applying, saving, tracking. A linked account is
 * view-only by design; only their manager can act on their behalf. Since the
 * account-switcher isn't built yet, the only real actor on any session right
 * now is whoever is actually logged in — so this is the actual boundary that
 * enforces "view-only," not just a UI-level suggestion.
 */
/**
 * Resolves who a write action should actually apply to. A managed account
 * can never write for themselves — blocked immediately, regardless of
 * anything else. Otherwise resolves to whatever getActingUser verifies:
 * either the real user themselves, or — only if a manager has switched in
 * and the target is genuinely one of their own linked accounts — that
 * linked account. This is the actual security boundary for every apply/
 * save/track action in the app; getActingUser re-verifies ownership fresh
 * on every single call, never trusts a cached or client-supplied value.
 */
async function requireActingUser() {
  const realUser = await requireUser();
  if (realUser.managedByUserId) {
    throw new Error("Your account is managed — only your manager can apply, save, or track opportunities for you.");
  }
  return getActingUser(realUser);
}

export async function toggleSaveAction(opportunityId: string): Promise<{ ok: boolean; limitReached?: boolean }> {
  const user = await requireActingUser();
  const result = await toggleSaved(user.id, opportunityId, hasUnlimitedTracking(user));
  revalidateAppPages();
  return result;
}

export async function advanceStageAction(opportunityId: string): Promise<{ ok: boolean; limitReached?: boolean; expired?: boolean }> {
  const user = await requireActingUser();
  const result = await advanceStage(user.id, opportunityId, hasUnlimitedTracking(user));
  revalidateAppPages();
  return result;
}

export async function withdrawApplicationAction(opportunityId: string) {
  const user = await requireActingUser();
  await withdrawApplication(user.id, opportunityId);
  revalidateAppPages();
}

export async function setUserExamDateAction(
  opportunityId: string,
  kind: "written" | "oral",
  date: string | null
) {
  const user = await requireActingUser();
  await setUserExamDate(user.id, opportunityId, kind, date);
  revalidateAppPages();
}

export async function markAllNotificationsReadAction() {
  const userId = await requireUserId();
  await markAllNotificationsRead(userId);
  revalidateAppPages();
}

export async function markNotificationReadAction(notificationId: number) {
  const userId = await requireUserId();
  await markNotificationRead(userId, notificationId);
  revalidateAppPages();
}

export interface AddConcoursFormState {
  error?: string;
  success?: string;
}

const VALID_TYPES: OpportunityType[] = ["Concours", "Job", "Internship", "Training", "Scholarship"];

function parseDate(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Any signed-in user can add a concours they know about — private to them until an admin promotes it. */
export async function createUserConcoursAction(
  _prevState: AddConcoursFormState,
  formData: FormData
): Promise<AddConcoursFormState> {
  const user = await requireActingUser();

  const title = String(formData.get("title") ?? "").trim();
  const organization = String(formData.get("organization") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "");
  const type = VALID_TYPES.find((t) => t.toLowerCase() === typeRaw.toLowerCase()) ?? "Concours";

  if (!title || !organization || !location) {
    return { error: "Title, organization and location are required." };
  }

  const result = await createUserConcours(
    user.id,
    {
      title,
      organization,
      location,
      type,
      examDate: parseDate(String(formData.get("examDate") ?? "")),
      oralExamDate: parseDate(String(formData.get("oralExamDate") ?? "")),
      deadlineDate: parseDate(String(formData.get("deadlineDate") ?? "")),
      description: String(formData.get("description") ?? "").trim(),
    },
    hasUnlimitedTracking(user)
  );

  if (result.limitReached === "add") {
    return { error: "Free plan: you can add up to 4 of your own concours — upgrade to add more." };
  }
  if (result.limitReached === "track") {
    return { error: "You've reached your free plan's 10-opportunity limit — upgrade to add more." };
  }

  revalidateAppPages();
  return { success: `"${title}" was added to your tracking.` };
}

export interface AuthFormState {
  error?: string;
}

async function startSession(userId: string) {
  const { token, expiresAt } = await createSession(userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

async function getClientIP(): Promise<string> {
  const h = await headers();
  // Vercel sets this reliably; falls back to a shared bucket if missing
  // (e.g. local dev), which just means local testing shares one limit.
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

/** Live lookup used by the signup form — shows whose account a code would link to, before submitting. */
/**
 * Switches a manager into acting as one of their own linked accounts.
 * Re-verifies the target is genuinely linked to the current real user —
 * never trusts the id passed in on its own. A managed account (no
 * managerTier) can never switch into anyone; requireUser alone doesn't
 * block that, so it's checked explicitly here too.
 */
export async function switchToAccountAction(targetUserId: string): Promise<{ error?: string }> {
  const realUser = await requireUser();
  if (!realUser.managerTier) {
    return { error: "Only manager accounts can switch into a linked account." };
  }

  const { getLinkedAccounts } = await import("@/lib/db/managers");
  const linked = await getLinkedAccounts(realUser.id);
  if (!linked.some((account) => account.id === targetUserId)) {
    return { error: "That account isn't linked to you." };
  }

  const store = await cookies();
  store.set(ACTING_AS_COOKIE, targetUserId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Intentionally short-lived and not persisted long-term — this is an
    // active session choice, not a standing account setting.
    maxAge: 60 * 60 * 12,
  });
  revalidateAppPages();
  redirect("/dashboard");
}

export async function switchBackAction(): Promise<void> {
  const store = await cookies();
  store.delete(ACTING_AS_COOKIE);
  revalidateAppPages();
  redirect("/manager");
}

/**
 * Lets an already-registered user link their account to a manager after the
 * fact — signup is the only other entry point for this, so someone who
 * created their account before getting a code (or without one) had no way
 * to do this otherwise. Same server-side re-verification as signup: never
 * trusts the code on its own.
 */
export async function linkToManagerAction(code: string): Promise<{ error?: string; managerName?: string }> {
  const user = await requireUser();

  if (user.managedByUserId) {
    return { error: "Your account is already linked to a manager." };
  }
  if (user.managerTier) {
    return { error: "A manager account can't also be linked to another manager." };
  }

  const trimmed = code.trim().toUpperCase();
  if (!trimmed) {
    return { error: "Enter a code first." };
  }

  const { findManagerByCode } = await import("@/lib/db/managers");
  const manager = await findManagerByCode(trimmed);
  if (!manager) {
    return { error: "That code doesn't match an active manager account." };
  }

  const { sql } = await import("@/lib/db/client");
  await sql`UPDATE users SET manager_id = ${manager.id} WHERE id = ${user.id}`;

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { managerName: manager.name };
}

export interface ReportProblemState {
  error?: string;
  success?: boolean;
}

export async function submitProblemReportAction(
  _prevState: ReportProblemState,
  formData: FormData
): Promise<ReportProblemState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be signed in to report a problem." };

  const description = String(formData.get("description") ?? "").trim();
  if (!description) return { error: "Describe the problem before submitting." };

  const pageUrl = String(formData.get("pageUrl") ?? "").trim() || null;

  const { submitProblemReport } = await import("@/lib/db/problemReports");
  await submitProblemReport({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    pageUrl,
    description,
  });

  return { success: true };
}

export async function lookupManagerCodeAction(code: string): Promise<{ name: string } | null> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return null;
  const { findManagerByCode } = await import("@/lib/db/managers");
  const manager = await findManagerByCode(trimmed);
  return manager ? { name: manager.name } : null;
}

export async function signupAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const ip = await getClientIP();
  const allowed = await checkRateLimit(`signup:${ip}`, 5, 60);
  if (!allowed) {
    return { error: "Too many accounts created from this network — try again in an hour." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const managerCode = String(formData.get("managerCode") ?? "").trim().toUpperCase();

  if (!name || !email || !password) {
    return { error: "Fill in your name, email and password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (await findUserByEmail(email)) {
    return { error: "An account with that email already exists." };
  }

  // Re-validate the code server-side even though the form already showed a
  // live preview — never trust a value the client claims is correct.
  let manager: { id: string; name: string } | null = null;
  if (managerCode) {
    const { findManagerByCode } = await import("@/lib/db/managers");
    manager = await findManagerByCode(managerCode);
    if (!manager) {
      return { error: "That code doesn't match an active manager account — check it and try again, or leave it blank." };
    }
  }

  const user = await createUser(name, email, password);
  if (manager) {
    const { sql } = await import("@/lib/db/client");
    await sql`UPDATE users SET manager_id = ${manager.id} WHERE id = ${user.id}`;
  }
  await startSession(user.id);
  redirect("/profile?welcome=true&signup=1");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const allowed = await checkRateLimit(`login:${email.toLowerCase()}`, 5, 15);
  if (!allowed) {
    return { error: "Too many attempts — try again in 15 minutes, or reset your password." };
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return { error: "Incorrect email or password." };
  }

  await startSession(user.id);
  redirect("/dashboard?login=1");
}

export async function logoutAction() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);
  store.delete(SESSION_COOKIE);
  redirect("/");
}

export interface ForgotPasswordState {
  submitted?: boolean;
}

/**
 * Always reports success, whether or not the email exists — this prevents
 * someone from using this form to check which emails have accounts.
 */
export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  if (email) {
    const allowed = await checkRateLimit(`reset:${email.toLowerCase()}`, 3, 60);
    if (allowed) {
      const row = await findUserByEmail(email);
      if (row) {
        const token = await createPasswordResetToken(row.id);
        const resetUrl = `${siteUrl}/reset-password?token=${token}`;
        await sendEmail(
          row.email,
          "Reset your Forsa Go password",
          `<p>Hi ${row.name},</p>
           <p>Click below to reset your password. This link expires in 30 minutes.</p>
           <p><a href="${resetUrl}">Reset my password</a></p>
           <p>If you didn't request this, you can safely ignore this email.</p>`
        );
      }
    }
  }

  return { submitted: true };
}

export interface ResetPasswordState {
  error?: string;
  success?: boolean;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const ok = await resetPasswordWithToken(token, password);
  if (!ok) {
    return { error: "This reset link is invalid or has expired — request a new one." };
  }

  return { success: true };
}

export async function followOrganizationAction(slug: string, name: string) {
  const userId = await requireUserId();
  await followOrganization(userId, slug, name);
  revalidatePath("/organizations");
}

export async function unfollowOrganizationAction(slug: string) {
  const userId = await requireUserId();
  await unfollowOrganization(userId, slug);
  revalidatePath("/organizations");
}

export interface SubscribeRequestState {
  error?: string;
  success?: boolean;
  warning?: string;
}

const RECEIPT_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

export async function requestSubscriptionAction(
  _prevState: SubscribeRequestState,
  formData: FormData
): Promise<SubscribeRequestState> {
  const userId = await requireUserId();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (!firstName || !lastName) {
    return { error: "Enter the first and last name the transfer was sent under." };
  }

  const managerTierRaw = String(formData.get("managerTier") ?? "");
  const managerTier = isManagerTier(managerTierRaw) ? managerTierRaw : undefined;

  const upload = await uploadFieldIfProvided(formData, "receipt", "receipts", RECEIPT_TYPES, 3 * 1024 * 1024);
  // The receipt is explicitly optional — a failed upload (e.g. a phone photo
  // exceeding the size limit, which is common for receipt photos) shouldn't
  // block submitting the name fields that actually matter for matching the
  // payment. Proceed without the receipt rather than losing the whole request.
  const receiptWarning = upload.error
    ? "There was a problem uploading your receipt — it may be too large or an unsupported file type. It was NOT attached. Your request was still submitted, but if you'd like us to see the receipt, message us on WhatsApp: https://wa.me/212643650571"
    : undefined;

  await requestSubscription(userId, { firstName, lastName, receiptUrl: upload.url, managerTier });
  revalidatePath("/subscribe");
  revalidatePath("/admin");
  return { success: true, warning: receiptWarning };
}

export async function setLocaleAction(locale: "en" | "fr") {
  const store = await cookies();
  store.set("forsa_locale", locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}

export interface ChangePasswordState {
  error?: string;
  success?: boolean;
}

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const userId = await requireUserId();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords don't match." };
  }

  const result = await changePassword(userId, currentPassword, newPassword);
  if (!result.ok) return { error: result.error };

  return { success: true };
}
