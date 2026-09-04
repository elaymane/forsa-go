import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import PublicShell from "@/components/layout/PublicShell";
import OpportunityGrid from "@/components/opportunities/OpportunityGrid";
import { getOpportunities } from "@/lib/db/opportunities";
import { getApplicationsMap } from "@/lib/db/applications";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { getLocale } from "@/lib/i18n/getLocale";
import { trackPageView } from "@/lib/analytics";
import type { OpportunityType } from "@/types/opportunity";
import { TYPE_ROUTES } from "@/lib/facetRoutes";
import { parseCities } from "@/lib/cities";

export interface FacetConfig {
  type?: OpportunityType;
  typeLabel?: string; // plural, human label — "Internships", "Concours"
  city?: string; // real city name, exact match against opportunity.location
  path: string; // the actual URL path, for tracking + canonical metadata
  keywords?: string[]; // type-specific keywords, from the type route config
}

/** French terms per opportunity type, singular, used to build "X à [city]" style keyword phrases. */
const CITY_KEYWORD_STEMS: Record<string, string> = {
  Concours: "concours",
  Job: "emploi",
  Internship: "stage",
  Training: "formation",
  Scholarship: "bourse",
};

function cityKeywords(city: string, type?: OpportunityType): string[] {
  const cityLower = city.toLowerCase();
  if (type) {
    const stem = CITY_KEYWORD_STEMS[type];
    return stem ? [`${stem} ${cityLower}`, `${stem} à ${cityLower}`] : [];
  }
  // No specific type — city hub covers everything, so include every stem.
  return Object.values(CITY_KEYWORD_STEMS).map((stem) => `${stem} ${cityLower}`);
}

function titleFor(config: FacetConfig): string {
  if (config.type && config.city) return `${config.typeLabel} à ${config.city}`;
  if (config.type) return config.typeLabel!;
  if (config.city) return `Opportunités à ${config.city}`;
  return "Opportunités";
}

function descriptionFor(config: FacetConfig, count: number): string {
  const what = config.typeLabel?.toLowerCase() ?? "opportunités";

  if (config.type === "Concours") {
    const where = config.city ? ` à ${config.city}` : " partout au Maroc";
    return `${count} concours${where} — dates limites, résultats et comment postuler, suivis automatiquement sur Forsa Go.`;
  }
  if (config.type && config.city) {
    return `${count} ${what} à ${config.city}, Maroc — parcourez-les et suivez-les toutes sur Forsa Go.`;
  }
  if (config.type) {
    return `${count} ${what} partout au Maroc en ce moment — parcourez-les et suivez-les toutes sur Forsa Go.`;
  }
  if (config.city) {
    return `${count} opportunités à ${config.city}, Maroc — concours, emplois, stages et bourses, tous au même endroit.`;
  }
  return "Parcourez toutes les opportunités sur Forsa Go.";
}

export async function generateFacetMetadata(config: FacetConfig): Promise<Metadata> {
  const opportunities = await getOpportunities();
  const filtered = filterByFacet(opportunities.map((o) => ({ type: o.type, location: o.location })), config);

  const keywords = [
    ...(config.keywords ?? []),
    ...(config.city ? cityKeywords(config.city, config.type) : []),
  ];

  return {
    title: titleFor(config),
    description: descriptionFor(config, filtered.length),
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: { canonical: config.path },
  };
}

function filterByFacet<T extends { type: string; location: string }>(items: T[], config: FacetConfig): T[] {
  return items.filter((o) => {
    if (config.type && o.type !== config.type) return false;
    if (config.city && !parseCities(o.location).includes(config.city)) return false;
    return true;
  });
}

export async function FacetedOpportunitiesPage({ config }: { config: FacetConfig }) {
  const user = await getCurrentUser();
  await trackPageView(config.path, user?.id ?? null);
  const locale = await getLocale();

  const allOpportunities = await getOpportunities(user?.id);
  const offers = filterByFacet(allOpportunities, config);

  // A facet URL for a city/type combination with zero real matches is a thin
  // page — bad for SEO and a bad experience. Don't serve an empty shell.
  if (offers.length === 0) notFound();

  const heading = titleFor(config);
  const subtitle = `${offers.length} opportunité${offers.length === 1 ? "" : "s"}${
    config.city ? ` à ${config.city}` : ""
  }`;

  // Real internal links from the city hub into each type-specific combo for
  // that same city — without this, those combo pages have zero internal
  // link equity pointing to them anywhere on the site, which hurts their
  // ranking regardless of how good their own metadata is.
  const cityTypeLinks =
    config.city && !config.type
      ? Object.entries(TYPE_ROUTES).map(([slug, cfg]) => ({
          label: cfg.typeLabel,
          href: `/${slug}/${encodeURIComponent(config.city!)}`,
        }))
      : [];

  const content = (
    <div>
      <Link
        href="/opportunities"
        className="mb-4 flex w-fit items-center gap-1 text-sm text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        ← Toutes les opportunités
      </Link>

      {cityTypeLinks.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {cityTypeLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-purple-300 hover:text-purple-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-purple-500/40 dark:hover:text-purple-300"
            >
              {link.label} à {config.city}
            </Link>
          ))}
        </div>
      )}

      <OpportunityGrid
        offers={offers}
        applicationsMap={user ? await getApplicationsMap(user.id) : {}}
        userProfile={{ level: user?.level ?? null, specialization: user?.specialization ?? null }}
        guestMode={!user}
        locale={locale}
      />
    </div>
  );

  if (!user) {
    return (
      <PublicShell title={heading} subtitle={subtitle} locale={locale}>
        {content}
      </PublicShell>
    );
  }

  const notifications = await getNotifications(user.id);
  return (
    <AppShell
      title={heading}
      subtitle={subtitle}
      notifications={notifications}
      user={user}
      isAdmin={isAdminEmail(user.email)}
      locale={locale}
    >
      {content}
    </AppShell>
  );
}
