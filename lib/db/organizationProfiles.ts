import "server-only";
import { cache } from "react";
import { sql } from "./client";
import { ensureDb } from "./schema";

export interface OrganizationProfile {
  slug: string;
  name: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  keywords: string | null;
}

interface OrganizationProfileRow {
  slug: string;
  name: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  keywords: string | null;
}

/** Cached per-request — the organization page calls this once for generateMetadata and once for the page body. */
export const getOrganizationProfile = cache(async (slug: string): Promise<OrganizationProfile | null> => {
  await ensureDb();
  const rows = (await sql`SELECT * FROM organization_profiles WHERE slug = ${slug}`) as OrganizationProfileRow[];
  return rows[0] ?? null;
});

export async function getAllOrganizationProfiles(): Promise<Record<string, OrganizationProfile>> {
  await ensureDb();
  const rows = (await sql`SELECT * FROM organization_profiles`) as OrganizationProfileRow[];
  const map: Record<string, OrganizationProfile> = {};
  for (const row of rows) map[row.slug] = row;
  return map;
}

/**
 * Creates a bare-bones organization profile (name + slug only) if one
 * doesn't exist yet — so every organization is visible in Manage
 * Organizations, ready for a real logo to be added, without ever waiting
 * on someone to click "+ Add organization" first. Never touches an
 * existing profile — ON CONFLICT DO NOTHING, unlike upsertOrganizationProfile
 * which would overwrite a logo an admin already set.
 */
export async function ensureOrganizationProfile(slug: string, name: string): Promise<void> {
  if (!slug) return;
  await ensureDb();
  await sql`
    INSERT INTO organization_profiles (slug, name)
    VALUES (${slug}, ${name})
    ON CONFLICT (slug) DO NOTHING
  `;
}

export async function upsertOrganizationProfile(
  slug: string,
  name: string,
  profile: { logo: string | null; description: string | null; website: string | null; keywords: string | null }
): Promise<void> {
  await ensureDb();
  await sql`
    INSERT INTO organization_profiles (slug, name, logo, description, website, keywords, updated_at)
    VALUES (${slug}, ${name}, ${profile.logo}, ${profile.description}, ${profile.website}, ${profile.keywords}, now())
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      logo = EXCLUDED.logo,
      description = EXCLUDED.description,
      website = EXCLUDED.website,
      keywords = EXCLUDED.keywords,
      updated_at = now()
  `;
}
