import type { Opportunity } from "@/types/opportunity";

export function slugifyOrganization(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface OrganizationSummary {
  name: string;
  slug: string;
  image: string;
  total: number;
  open: number;
  levels: string[];
  locations: string[];
  types: string[];
  /** Most recent opportunity update within this org — real data, not fabricated. */
  lastUpdatedAt: string;
  /** Earliest opportunity ever added for this org — used as "joined" info. */
  joinedAt: string;
}

/** Groups a flat opportunity list by organization (matched via slug, so "ENSAM Rabat" and "ENSAM" won't collide unless they slugify the same). */
export function summarizeOrganizations(opportunities: Opportunity[]): OrganizationSummary[] {
  const map = new Map<string, OrganizationSummary>();

  for (const o of opportunities) {
    const slug = slugifyOrganization(o.organization);
    if (!slug) continue;

    if (!map.has(slug)) {
      map.set(slug, {
        name: o.organization,
        slug,
        image: o.image,
        total: 0,
        open: 0,
        levels: [],
        locations: [],
        types: [],
        lastUpdatedAt: o.updatedAt ?? o.createdAt ?? new Date().toISOString(),
        joinedAt: o.createdAt ?? new Date().toISOString(),
      });
    }

    const entry = map.get(slug)!;
    entry.total += 1;
    if (o.status === "open") entry.open += 1;
    if (o.level && !entry.levels.includes(o.level)) entry.levels.push(o.level);
    if (!entry.locations.includes(o.location)) entry.locations.push(o.location);
    if (!entry.types.includes(o.type)) entry.types.push(o.type);

    const updated = o.updatedAt ?? o.createdAt;
    if (updated && updated > entry.lastUpdatedAt) entry.lastUpdatedAt = updated;
    const created = o.createdAt;
    if (created && created < entry.joinedAt) entry.joinedAt = created;
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export function getOrganizationOpportunities(opportunities: Opportunity[], slug: string): Opportunity[] {
  return opportunities.filter((o) => slugifyOrganization(o.organization) === slug);
}

export function findOrganizationSummary(opportunities: Opportunity[], slug: string): OrganizationSummary | undefined {
  return summarizeOrganizations(opportunities).find((o) => o.slug === slug);
}
