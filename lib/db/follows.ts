import "server-only";
import { sql } from "./client";
import { ensureDb } from "./schema";
import { createNotification } from "./notifications";

export async function getFollowerCount(slug: string): Promise<number> {
  await ensureDb();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count FROM organization_follows WHERE organization_slug = ${slug}
  `) as Array<{ count: number }>;
  return rows[0]?.count ?? 0;
}

export async function isFollowingOrganization(userId: string, slug: string): Promise<boolean> {
  await ensureDb();
  const rows = await sql`
    SELECT 1 FROM organization_follows WHERE user_id = ${userId} AND organization_slug = ${slug}
  `;
  return rows.length > 0;
}

export async function followOrganization(userId: string, slug: string, name: string): Promise<void> {
  await ensureDb();
  await sql`
    INSERT INTO organization_follows (user_id, organization_slug, organization_name)
    VALUES (${userId}, ${slug}, ${name})
    ON CONFLICT (user_id, organization_slug) DO NOTHING
  `;
}

export async function unfollowOrganization(userId: string, slug: string): Promise<void> {
  await ensureDb();
  await sql`DELETE FROM organization_follows WHERE user_id = ${userId} AND organization_slug = ${slug}`;
}

export async function getFollowedOrganizationSlugs(userId: string): Promise<string[]> {
  await ensureDb();
  const rows = (await sql`
    SELECT organization_slug FROM organization_follows WHERE user_id = ${userId}
  `) as Array<{ organization_slug: string }>;
  return rows.map((r) => r.organization_slug);
}

/**
 * Notifies everyone following an organization that it just published a new
 * opportunity. Called after any new public opportunity is created (admin
 * form, Excel import, or a community submission getting promoted).
 */
export async function notifyFollowersOfNewOpportunity(
  organizationSlug: string,
  organizationName: string,
  opportunityTitle: string,
  opportunityId: string
): Promise<void> {
  await ensureDb();
  const followers = (await sql`
    SELECT user_id FROM organization_follows WHERE organization_slug = ${organizationSlug}
  `) as Array<{ user_id: string }>;

  await Promise.all(
    followers.map((follower) =>
      createNotification(
        follower.user_id,
        `📢 New from ${organizationName}`,
        `${organizationName} just published: ${opportunityTitle}`,
        `/opportunities/${opportunityId}`
      )
    )
  );
}
