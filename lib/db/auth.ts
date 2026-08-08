import "server-only";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { sql } from "./client";
import { ensureDb } from "./schema";
import { toISOTimestamp } from "./dates";
import { FOUNDING_MEMBER_CAP, FOUNDING_MEMBER_FREE_MONTHS } from "@/lib/subscription";
import { MANAGER_TIER_LABELS, type ManagerTier } from "@/lib/managerTiers";
import type { EducationLevel } from "@/types/opportunity";

export interface User {
  id: string;
  name: string;
  email: string;
  level: EducationLevel | null;
  specialization: string | null;
  location: string | null;
  isFoundingMember: boolean;
  plan: "free" | "premium";
  subscriptionActiveUntil: string | null;
  subscriptionRequestedAt: string | null;
  /** Set only if this account is an active Manager — the tier they're paying for. */
  managerTier: "basic" | "pro" | "unlimited" | null;
  /** Set only if this account was linked to a manager at signup — view-only for them. */
  managedByUserId: string | null;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  level: string | null;
  specialization: string | null;
  location: string | null;
  is_founding_member: boolean;
  plan: string;
  subscription_active_until: unknown; // Postgres TIMESTAMPTZ — see toISOTimestamp
  subscription_requested_at: unknown;
  manager_tier: string | null;
  manager_id: string | null;
}

const SESSION_TTL_DAYS = 30;
const USER_COLUMNS = `id, name, email, password_hash, level, specialization, location,
  is_founding_member, plan, subscription_active_until, subscription_requested_at,
  manager_tier, manager_id`;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    level: row.level as EducationLevel | null,
    specialization: row.specialization,
    location: row.location,
    isFoundingMember: row.is_founding_member,
    plan: row.plan === "premium" ? "premium" : "free",
    subscriptionActiveUntil: toISOTimestamp(row.subscription_active_until),
    subscriptionRequestedAt: toISOTimestamp(row.subscription_requested_at),
    managerTier: row.manager_tier === "basic" || row.manager_tier === "pro" || row.manager_tier === "unlimited" ? row.manager_tier : null,
    managedByUserId: row.manager_id,
  };
}

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  await ensureDb();
  const rows = (await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`) as UserRow[];
  return rows[0];
}

export async function getUserById(id: string): Promise<User | null> {
  await ensureDb();
  const rows = (await sql`SELECT * FROM users WHERE id = ${id}`) as UserRow[];
  return rows[0] ? rowToUser(rows[0]) : null;
}

/** First FOUNDING_MEMBER_CAP signups get FOUNDING_MEMBER_FREE_MONTHS of unlimited tracking free — not lifetime. */
export async function createUser(name: string, email: string, password: string): Promise<User> {
  await ensureDb();
  const id = randomUUID();

  const countRows = (await sql`SELECT COUNT(*)::int AS count FROM users`) as Array<{ count: number }>;
  const isFoundingMember = (countRows[0]?.count ?? 0) < FOUNDING_MEMBER_CAP;

  let freeUntil: Date | null = null;
  if (isFoundingMember) {
    freeUntil = new Date();
    freeUntil.setMonth(freeUntil.getMonth() + FOUNDING_MEMBER_FREE_MONTHS);
  }

  await sql`
    INSERT INTO users (id, name, email, password_hash, is_founding_member, subscription_active_until)
    VALUES (${id}, ${name}, ${email.toLowerCase()}, ${hashPassword(password)}, ${isFoundingMember}, ${freeUntil?.toISOString() ?? null})
  `;

  return {
    id,
    name,
    email: email.toLowerCase(),
    level: null,
    specialization: null,
    location: null,
    isFoundingMember,
    plan: "free",
    subscriptionActiveUntil: freeUntil?.toISOString() ?? null,
    subscriptionRequestedAt: null,
    managerTier: null,
    managedByUserId: null,
  };
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const row = await findUserByEmail(email);
  if (!row) return null;
  if (!verifyPassword(password, row.password_hash)) return null;
  return rowToUser(row);
}

/** Changes a logged-in user's password — requires the current one, so an unlocked device alone isn't enough. */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  await ensureDb();
  const rows = (await sql`SELECT password_hash FROM users WHERE id = ${userId}`) as Array<{
    password_hash: string;
  }>;
  const row = rows[0];
  if (!row || !verifyPassword(currentPassword, row.password_hash)) {
    return { ok: false, error: "Current password is incorrect." };
  }

  await sql`UPDATE users SET password_hash = ${hashPassword(newPassword)} WHERE id = ${userId}`;
  return { ok: true };
}

export async function updateProfile(
  userId: string,
  profile: { level: EducationLevel | null; specialization: string | null; location: string | null }
): Promise<void> {
  await ensureDb();
  await sql`
    UPDATE users SET level = ${profile.level}, specialization = ${profile.specialization}, location = ${profile.location}
    WHERE id = ${userId}
  `;
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  await ensureDb();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await sql`
    INSERT INTO sessions (token, user_id, expires_at) VALUES (${token}, ${userId}, ${expiresAt.toISOString()})
  `;
  return { token, expiresAt };
}

export async function getUserBySessionToken(token: string): Promise<User | null> {
  await ensureDb();
  const rows = (await sql`
    SELECT users.id, users.name, users.email, users.level, users.specialization, users.location,
           users.is_founding_member, users.plan, users.subscription_active_until, users.subscription_requested_at,
           users.manager_tier, users.manager_id
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token = ${token} AND sessions.expires_at > now()
  `) as UserRow[];

  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function deleteSession(token: string) {
  await ensureDb();
  await sql`DELETE FROM sessions WHERE token = ${token}`;
}

const RESET_TOKEN_TTL_MINUTES = 30;

/** Creates a one-time password reset token, valid for 30 minutes. */
export async function createPasswordResetToken(userId: string): Promise<string> {
  await ensureDb();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
  await sql`
    INSERT INTO password_reset_tokens (token, user_id, expires_at)
    VALUES (${token}, ${userId}, ${expiresAt.toISOString()})
  `;
  return token;
}

/** Returns the user a reset token belongs to, if it's still valid and unused. */
export async function getUserByResetToken(token: string): Promise<User | null> {
  await ensureDb();
  const rows = (await sql`
    SELECT users.id, users.name, users.email, users.level, users.specialization, users.location,
           users.is_founding_member, users.plan, users.subscription_active_until, users.subscription_requested_at,
           users.manager_tier, users.manager_id
    FROM password_reset_tokens t
    JOIN users ON users.id = t.user_id
    WHERE t.token = ${token} AND t.expires_at > now() AND t.used = false
  `) as UserRow[];
  return rows[0] ? rowToUser(rows[0]) : null;
}

/** Sets a new password and invalidates the token (and every existing session, for safety). */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  await ensureDb();
  const user = await getUserByResetToken(token);
  if (!user) return false;

  await sql`UPDATE users SET password_hash = ${hashPassword(newPassword)} WHERE id = ${user.id}`;
  await sql`UPDATE password_reset_tokens SET used = true WHERE token = ${token}`;
  // Log out everywhere else — if someone else had access, a password reset should end that.
  await sql`DELETE FROM sessions WHERE user_id = ${user.id}`;
  return true;
}

/** User submits a subscription request — pending until an admin manually confirms payment. */
export async function requestSubscription(
  userId: string,
  payment: { firstName: string; lastName: string; receiptUrl: string | null; managerTier?: ManagerTier }
): Promise<void> {
  await ensureDb();
  await sql`
    UPDATE users SET
      subscription_requested_at = now(),
      payment_first_name = ${payment.firstName},
      payment_last_name = ${payment.lastName},
      payment_receipt_url = ${payment.receiptUrl},
      manager_tier_requested = ${payment.managerTier ?? null}
    WHERE id = ${userId}
  `;

  const rows = (await sql`SELECT name FROM users WHERE id = ${userId}`) as Array<{ name: string }>;
  const { notifyAdmins } = await import("./notifications");
  const tierNote = payment.managerTier ? ` — requesting ${MANAGER_TIER_LABELS[payment.managerTier]}` : "";
  await notifyAdmins(
    "💳 New subscription request",
    `${payment.firstName} ${payment.lastName} (${rows[0]?.name ?? "a user"}) requested to subscribe${tierNote} — check Manage Users to confirm and activate.`,
    "/admin"
  );
}

/** Admin confirms payment was received — activates (or extends) the subscription by N months. */
export async function activateSubscription(userId: string, months = 1): Promise<void> {
  await ensureDb();
  const rows = (await sql`
    SELECT subscription_active_until, payment_receipt_url, manager_tier_requested, manager_code
    FROM users WHERE id = ${userId}
  `) as Array<{
    subscription_active_until: unknown;
    payment_receipt_url: string | null;
    manager_tier_requested: string | null;
    manager_code: string | null;
  }>;
  const current = toISOTimestamp(rows[0]?.subscription_active_until);
  const base = current && new Date(current).getTime() > Date.now() ? new Date(current) : new Date();
  base.setMonth(base.getMonth() + months);

  const requestedTier = rows[0]?.manager_tier_requested;
  const isManagerRequest = requestedTier === "basic" || requestedTier === "pro" || requestedTier === "unlimited";

  if (isManagerRequest) {
    // A manager tier request also grants unlimited tracking for the
    // manager's own account — same subscriptionActiveUntil mechanism,
    // just alongside setting the tier itself.
    await sql`
      UPDATE users SET
        plan = 'premium',
        subscription_active_until = ${base.toISOString()},
        subscription_requested_at = NULL,
        payment_receipt_url = NULL,
        manager_tier = ${requestedTier},
        manager_tier_requested = NULL
      WHERE id = ${userId}
    `;
    if (!rows[0]?.manager_code) {
      const { generateManagerCode } = await import("./managers");
      await generateManagerCode(userId);
    }
  } else {
    await sql`
      UPDATE users SET
        plan = 'premium',
        subscription_active_until = ${base.toISOString()},
        subscription_requested_at = NULL,
        payment_receipt_url = NULL
      WHERE id = ${userId}
    `;
  }

  // Best-effort — the subscription is already activated above regardless of
  // whether this succeeds. A bank receipt shouldn't sit in storage any
  // longer than it needs to once it's served its purpose.
  const receiptUrl = rows[0]?.payment_receipt_url;
  if (receiptUrl) {
    try {
      const { del } = await import("@vercel/blob");
      await del(receiptUrl);
    } catch {
      // Not fatal — the DB reference is already cleared either way.
    }
  }
}

/**
 * Declines a pending subscription request — e.g. the payment couldn't be
 * matched, the name didn't line up, or the receipt looked wrong. Clears the
 * request (same cleanup as activation: the receipt image is deleted too,
 * no reason to keep it once it's been reviewed either way) and lets the
 * user know so they aren't left wondering why nothing happened.
 */
export async function rejectSubscriptionRequest(userId: string): Promise<void> {
  await ensureDb();
  const rows = (await sql`
    SELECT payment_receipt_url FROM users WHERE id = ${userId}
  `) as Array<{ payment_receipt_url: string | null }>;

  await sql`
    UPDATE users SET
      subscription_requested_at = NULL,
      payment_receipt_url = NULL,
      payment_first_name = NULL,
      payment_last_name = NULL
    WHERE id = ${userId}
  `;

  const receiptUrl = rows[0]?.payment_receipt_url;
  if (receiptUrl) {
    try {
      const { del } = await import("@vercel/blob");
      await del(receiptUrl);
    } catch {
      // Not fatal — the DB reference is already cleared either way.
    }
  }

  const { createNotification } = await import("./notifications");
  await createNotification(
    userId,
    "Subscription request declined",
    "We couldn't confirm your payment — this can happen if the name on the transfer didn't match, or the receipt wasn't clear. Feel free to submit again from the Subscribe page, or message us on WhatsApp if you have questions: https://wa.me/212643650571",
    "/subscribe"
  );
}

export interface PendingSubscriptionRequest {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
  paymentFirstName: string | null;
  paymentLastName: string | null;
  paymentReceiptUrl: string | null;
  managerTierRequested: ManagerTier | null;
}

export async function getPendingSubscriptionRequests(): Promise<PendingSubscriptionRequest[]> {
  await ensureDb();
  const rows = (await sql`
    SELECT id, name, email, subscription_requested_at, payment_first_name, payment_last_name, payment_receipt_url, manager_tier_requested
    FROM users
    WHERE subscription_requested_at IS NOT NULL
    ORDER BY subscription_requested_at ASC
  `) as Array<{
    id: string;
    name: string;
    email: string;
    subscription_requested_at: unknown;
    payment_first_name: string | null;
    payment_last_name: string | null;
    payment_receipt_url: string | null;
    manager_tier_requested: string | null;
  }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    requestedAt: toISOTimestamp(r.subscription_requested_at) ?? new Date().toISOString(),
    paymentFirstName: r.payment_first_name,
    paymentLastName: r.payment_last_name,
    paymentReceiptUrl: r.payment_receipt_url,
    managerTierRequested:
      r.manager_tier_requested === "basic" || r.manager_tier_requested === "pro" || r.manager_tier_requested === "unlimited"
        ? r.manager_tier_requested
        : null,
  }));
}

export interface UserAccountSummary {
  id: string;
  name: string;
  email: string;
  isFoundingMember: boolean;
  plan: "free" | "premium";
  subscriptionActiveUntil: string | null;
  createdAt: string;
}

export async function getUserCount(): Promise<number> {
  await ensureDb();
  const rows = (await sql`SELECT COUNT(*)::int AS count FROM users`) as Array<{ count: number }>;
  return rows[0]?.count ?? 0;
}

/** Real countdown for the "first 100 users" promo — never fabricated. */
export async function getFoundingMemberSpotsLeft(): Promise<number> {
  await ensureDb();
  const rows = (await sql`SELECT COUNT(*)::int AS count FROM users WHERE is_founding_member = true`) as Array<{
    count: number;
  }>;
  const { FOUNDING_MEMBER_CAP } = await import("@/lib/subscription");
  return Math.max(0, FOUNDING_MEMBER_CAP - (rows[0]?.count ?? 0));
}

/** All users, for the admin's manual "find and upgrade" tool — not just the ones who requested. */
export async function getAllUserAccounts(): Promise<UserAccountSummary[]> {
  await ensureDb();
  const rows = (await sql`
    SELECT id, name, email, is_founding_member, plan, subscription_active_until, created_at
    FROM users
    ORDER BY created_at DESC
  `) as Array<{
    id: string;
    name: string;
    email: string;
    is_founding_member: boolean;
    plan: string;
    subscription_active_until: unknown;
    created_at: unknown;
  }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    isFoundingMember: r.is_founding_member,
    plan: r.plan === "premium" ? "premium" : "free",
    subscriptionActiveUntil: toISOTimestamp(r.subscription_active_until),
    createdAt: toISOTimestamp(r.created_at) ?? new Date().toISOString(),
  }));
}

/** Removes premium access — for correcting a mistaken activation. */
export async function deactivateSubscription(userId: string): Promise<void> {
  await ensureDb();
  await sql`UPDATE users SET plan = 'free', subscription_active_until = NULL WHERE id = ${userId}`;
}
