import type { MetadataRoute } from "next";
import { getOpportunities } from "@/lib/db/opportunities";
import { summarizeOrganizations } from "@/lib/organizations";
import { TYPE_ROUTES } from "@/lib/facetRoutes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const opportunities = await getOpportunities();
  const organizations = summarizeOrganizations(opportunities);

  const cities = Array.from(new Set(opportunities.map((o) => o.location))).filter(Boolean);
  const typeSlugs = Object.entries(TYPE_ROUTES);

  // Type hub pages — only for types that actually have at least one opportunity.
  const typeHubEntries = typeSlugs
    .filter(([, cfg]) => opportunities.some((o) => o.type === cfg.type))
    .map(([slug]) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.75,
    }));

  // City hub pages — one per real city.
  const cityHubEntries = cities.map((city) => ({
    url: `${SITE_URL}/cities/${encodeURIComponent(city)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Type + city combos — only combinations that actually have a real match,
  // so we never index an empty/thin page.
  const comboEntries = typeSlugs.flatMap(([slug, cfg]) =>
    cities
      .filter((city) => opportunities.some((o) => o.type === cfg.type && o.location === city))
      .map((city) => ({
        url: `${SITE_URL}/${slug}/${encodeURIComponent(city)}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.65,
      }))
  );

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/opportunities`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...typeHubEntries,
    ...cityHubEntries,
    ...comboEntries,
    {
      url: `${SITE_URL}/organizations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...organizations.map((org) => ({
      url: `${SITE_URL}/organizations/${org.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...opportunities
      .filter((o) => o.isPublic !== false)
      .map((o) => ({
        url: `${SITE_URL}/opportunities/${o.id}`,
        lastModified: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.75,
      })),
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
