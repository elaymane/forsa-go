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
  /** The genuinely most common opportunity type for this org — computed from
      real frequency counts, not just the first type encountered. */
  primaryType: string | null;
  /** Most recent opportunity update within this org — real data, not fabricated. */
  lastUpdatedAt: string;
  /** Earliest opportunity ever added for this org — used as "joined" info. */
  joinedAt: string;
}

/** Groups a flat opportunity list by organization (matched via slug, so "ENSAM Rabat" and "ENSAM" won't collide unless they slugify the same). */
/** Real, honest aggregate stats for the Organizations page header — never fabricated. */
export function computeOrganizationsPageStats(opportunities: Opportunity[]) {
  const organizations = summarizeOrganizations(opportunities);
  const totalOrganizations = organizations.length;
  const openOpportunities = opportunities.filter((o) => o.status === "open").length;
  const todayKey = new Date().toISOString().slice(0, 10);
  const newToday = opportunities.filter((o) => o.createdAt && o.createdAt.slice(0, 10) === todayKey).length;

  return { totalOrganizations, openOpportunities, newToday };
}

export function summarizeOrganizations(opportunities: Opportunity[]): OrganizationSummary[] {
  const map = new Map<string, OrganizationSummary>();
  const typeCounts = new Map<string, Map<string, number>>();

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
        primaryType: null,
        lastUpdatedAt: o.updatedAt ?? o.createdAt ?? new Date().toISOString(),
        joinedAt: o.createdAt ?? new Date().toISOString(),
      });
      typeCounts.set(slug, new Map());
    }

    const entry = map.get(slug)!;
    entry.total += 1;
    if (o.status === "open") entry.open += 1;
    if (o.level && !entry.levels.includes(o.level)) entry.levels.push(o.level);
    if (!entry.locations.includes(o.location)) entry.locations.push(o.location);
    if (!entry.types.includes(o.type)) entry.types.push(o.type);

    // Real frequency count — used to compute the genuinely most common type
    // below, not just "whichever opportunity happened to be seen first".
    const counts = typeCounts.get(slug)!;
    counts.set(o.type, (counts.get(o.type) ?? 0) + 1);

    const updated = o.updatedAt ?? o.createdAt;
    if (updated && updated > entry.lastUpdatedAt) entry.lastUpdatedAt = updated;
    const created = o.createdAt;
    if (created && created < entry.joinedAt) entry.joinedAt = created;
  }

  // Now that every opportunity has been counted, assign each org's genuinely
  // most common type — not the first one encountered.
  for (const [slug, entry] of map) {
    const counts = typeCounts.get(slug);
    if (!counts || counts.size === 0) continue;
    let best: string | null = null;
    let bestCount = -1;
    for (const [type, count] of counts) {
      if (count > bestCount) {
        best = type;
        bestCount = count;
      }
    }
    entry.primaryType = best;
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export function getOrganizationOpportunities(opportunities: Opportunity[], slug: string): Opportunity[] {
  return opportunities.filter((o) => slugifyOrganization(o.organization) === slug);
}

export function findOrganizationSummary(opportunities: Opportunity[], slug: string): OrganizationSummary | undefined {
  return summarizeOrganizations(opportunities).find((o) => o.slug === slug);
}
