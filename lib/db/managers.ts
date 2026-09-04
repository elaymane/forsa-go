import "server-only";
import { randomBytes } from "crypto";
import { sql } from "./client";
import { ensureDb } from "./schema";
import { isManagerTier, type ManagerTier } from "@/lib/managerTiers";

/** Generates a short, unique-enough invite code for a manager. Retries on the rare collision. */
export async function generateManagerCode(userId: string): Promise<string> {
  await ensureDb();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomBytes(4).toString("hex").toUpperCase(); // e.g. "A1B2C3D4"
    const existing = (await sql`SELECT id FROM users WHERE manager_code = ${code}`) as Array<{ id: string }>;
    if (existing.length === 0) {
      await sql`UPDATE users SET manager_code = ${code} WHERE id = ${userId}`;
      return code;
    }
  }
  throw new Error("Could not generate a unique manager code — try again.");
}

export interface ManagerLookup {
  id: string;
  name: string;
}

/** Used at signup — shows the person whose account they'd be linking to, before they confirm. */
export async function findManagerByCode(code: string): Promise<ManagerLookup | null> {
  await ensureDb();
  const rows = (await sql`
    SELECT id, name FROM users WHERE manager_code = ${code} AND manager_tier IS NOT NULL
  `) as ManagerLookup[];
  return rows[0] ?? null;
}

export interface ManagerStatus {
  tier: ManagerTier | null;
  code: string | null;
  requestedTier: ManagerTier | null;
  linkedCount: number;
}

export async function getManagerStatus(userId: string): Promise<ManagerStatus> {
  await ensureDb();
  const rows = (await sql`
    SELECT manager_tier, manager_code, manager_tier_requested,
           (SELECT COUNT(*) FROM users AS linked WHERE linked.manager_id = users.id) AS linked_count
    FROM users WHERE id = ${userId}
  `) as Array<{
    manager_tier: string | null;
    manager_code: string | null;
    manager_tier_requested: string | null;
    linked_count: string;
  }>;
  const row = rows[0];
  if (!row) return { tier: null, code: null, requestedTier: null, linkedCount: 0 };
  return {
    tier: isManagerTier(row.manager_tier) ? row.manager_tier : null,
    code: row.manager_code,
    requestedTier: isManagerTier(row.manager_tier_requested) ? row.manager_tier_requested : null,
    linkedCount: Number(row.linked_count),
  };
}

export interface LinkedAccountSummary {
  id: string;
  name: string;
  email: string;
}

/** Every account currently linked to this manager. */
export async function getLinkedAccounts(managerId: string): Promise<LinkedAccountSummary[]> {
  await ensureDb();
  return (await sql`
    SELECT id, name, email FROM users WHERE manager_id = ${managerId} ORDER BY name ASC
  `) as LinkedAccountSummary[];
}

export interface LinkedAccountWithStats extends LinkedAccountSummary {
  trackedCount: number;
  appliedCount: number;
  acceptedCount: number;
}

/** Same as getLinkedAccounts, but with real tracking numbers for the manager dashboard. */
export async function getLinkedAccountsWithStats(managerId: string): Promise<LinkedAccountWithStats[]> {
  await ensureDb();
  const rows = (await sql`
    SELECT
      users.id, users.name, users.email,
      COUNT(applications.opportunity_id) FILTER (WHERE applications.saved OR applications.stage IS NOT NULL) AS tracked_count,
      COUNT(applications.opportunity_id) FILTER (WHERE applications.stage IS NOT NULL) AS applied_count,
      COUNT(applications.opportunity_id) FILTER (WHERE applications.stage = 'accepted') AS accepted_count
    FROM users
    LEFT JOIN applications ON applications.user_id = users.id
    WHERE users.manager_id = ${managerId}
    GROUP BY users.id, users.name, users.email
    ORDER BY users.name ASC
  `) as Array<{ id: string; name: string; email: string; tracked_count: string; applied_count: string; accepted_count: string }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    trackedCount: Number(r.tracked_count),
    appliedCount: Number(r.applied_count),
    acceptedCount: Number(r.accepted_count),
  }));
}
