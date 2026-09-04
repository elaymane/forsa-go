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
  /** Manual override for the Recrutement / Concours et admissions label — null means auto-computed from real opportunity data. */
  typeLabelOverride: string | null;
}

interface OrganizationProfileRow {
  slug: string;
  name: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  keywords: string | null;
  type_label_override: string | null;
}

function mapRow(row: OrganizationProfileRow): OrganizationProfile {
  return {
    slug: row.slug,
    name: row.name,
    logo: row.logo,
    description: row.description,
    website: row.website,
    keywords: row.keywords,
    typeLabelOverride: row.type_label_override,
  };
}

/** Cached per-request — the organization page calls this once for generateMetadata and once for the page body. */
export const getOrganizationProfile = cache(async (slug: string): Promise<OrganizationProfile | null> => {
  await ensureDb();
  const rows = (await sql`SELECT * FROM organization_profiles WHERE slug = ${slug}`) as OrganizationProfileRow[];
  return rows[0] ? mapRow(rows[0]) : null;
});

export async function getAllOrganizationProfiles(): Promise<Record<string, OrganizationProfile>> {
  await ensureDb();
  const rows = (await sql`SELECT * FROM organization_profiles`) as OrganizationProfileRow[];
  const map: Record<string, OrganizationProfile> = {};
  for (const row of rows) map[row.slug] = mapRow(row);
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

/**
 * Removes only the curated profile (logo, description, website) — never
 * touches any real opportunities. If this org still has live opportunities,
 * it'll keep appearing on the Organizations page (derived from those), just
 * with its auto-generated placeholder info instead of the curated profile.
 */
export async function deleteOrganizationProfile(slug: string): Promise<void> {
  await ensureDb();
  await sql`DELETE FROM organization_profiles WHERE slug = ${slug}`;
}

export async function upsertOrganizationProfile(
  slug: string,
  name: string,
  profile: {
    logo: string | null;
    description: string | null;
    website: string | null;
    keywords: string | null;
    typeLabelOverride: string | null;
  }
): Promise<void> {
  await ensureDb();
  await sql`
    INSERT INTO organization_profiles (slug, name, logo, description, website, keywords, type_label_override, updated_at)
    VALUES (${slug}, ${name}, ${profile.logo}, ${profile.description}, ${profile.website}, ${profile.keywords}, ${profile.typeLabelOverride}, now())
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      logo = EXCLUDED.logo,
      description = EXCLUDED.description,
      website = EXCLUDED.website,
      keywords = EXCLUDED.keywords,
      type_label_override = EXCLUDED.type_label_override,
      updated_at = now()
  `;
}

export interface LogoMigrationResult {
  slug: string;
  name: string;
  status: "migrated" | "already-on-blob" | "no-logo" | "failed";
  detail?: string;
}

/**
 * One-time migration — finds every organization logo that's an external URL
 * (not already stored on Vercel Blob) and re-uploads it to Blob, updating the
 * DB to point at the new, permanent URL. Each org is handled independently:
 * one failure (a dead external link, a blocked fetch, etc.) never stops the
 * rest of the batch, and every outcome is reported so nothing fails silently.
 */
export async function migrateExternalLogosToBlob(): Promise<LogoMigrationResult[]> {
  await ensureDb();
  const profiles = await getAllOrganizationProfiles();
  const results: LogoMigrationResult[] = [];

  for (const profile of Object.values(profiles)) {
    if (!profile.logo) {
      results.push({ slug: profile.slug, name: profile.name, status: "no-logo" });
      continue;
    }
    if (profile.logo.includes("blob.vercel-storage.com")) {
      results.push({ slug: profile.slug, name: profile.name, status: "already-on-blob" });
      continue;
    }
    // Data URIs (generated placeholder initials) aren't external — nothing to migrate.
    if (profile.logo.startsWith("data:")) {
      results.push({ slug: profile.slug, name: profile.name, status: "no-logo" });
      continue;
    }

    try {
      const response = await fetch(profile.logo);
      if (!response.ok) {
        results.push({
          slug: profile.slug,
          name: profile.name,
          status: "failed",
          detail: `Source returned ${response.status}`,
        });
        continue;
      }
      const contentType = response.headers.get("content-type") ?? "image/png";
      const buffer = await response.arrayBuffer();
      const { put } = await import("@vercel/blob");
      const blob = await put(`logos/${profile.slug}-${Date.now()}`, Buffer.from(buffer), {
        access: "public",
        contentType,
      });

      await sql`UPDATE organization_profiles SET logo = ${blob.url}, updated_at = now() WHERE slug = ${profile.slug}`;
      results.push({ slug: profile.slug, name: profile.name, status: "migrated" });
    } catch (err) {
      results.push({
        slug: profile.slug,
        name: profile.name,
        status: "failed",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
