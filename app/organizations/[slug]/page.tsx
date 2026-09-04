import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { ChevronLeft, Globe, MapPin, Calendar } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PublicShell from "@/components/layout/PublicShell";
import FollowButton from "@/components/organizations/FollowButton";
import OrganizationTabs from "@/components/organizations/OrganizationTabs";
import { getOpportunities } from "@/lib/db/opportunities";
import { getApplicationsMap, type ApplicationState } from "@/lib/db/applications";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { isFollowingOrganization, getFollowerCount } from "@/lib/db/follows";
import { getOrganizationProfile } from "@/lib/db/organizationProfiles";
import { findOrganizationSummary, getOrganizationOpportunities } from "@/lib/organizations";
import { formatMonthYear } from "@/lib/formatting";
import { getLocale } from "@/lib/i18n/getLocale";
import { trackPageView } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [opportunities, profile] = await Promise.all([
    getOpportunities(),
    getOrganizationProfile(slug),
  ]);
  const org = findOrganizationSummary(opportunities, slug);
  if (!org) return { title: "Organization" };

  const currentYear = new Date().getFullYear();
  const label = profile?.typeLabelOverride ?? (org.primaryType === "Job" ? "Recrutement" : "Concours et admissions");
  const description =
    profile?.description ||
    (label === "Concours et admissions"
      ? `Découvrez les ${org.total} offre${org.total === 1 ? "" : "s"} de concours et d'admissions de ${org.name} au Maroc — ${org.open} actuellement ouverte${org.open === 1 ? "" : "s"}, mises à jour en temps réel sur Forsa Go.`
      : `Découvrez les ${org.total} offre${org.total === 1 ? "" : "s"} de recrutement et opportunités professionnelles de ${org.name} au Maroc — ${org.open} actuellement ouverte${org.open === 1 ? "" : "s"}, mises à jour en temps réel sur Forsa Go.`);

  return {
    title: `${org.name} ${label} ${currentYear} – Offres | Forsa Go`,
    description,
    keywords: profile?.keywords ? profile.keywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined,
    alternates: { canonical: `/organizations/${slug}` },
    openGraph: { title: `${org.name} ${label} ${currentYear}`, description },
    twitter: { title: `${org.name} ${label} ${currentYear}`, description },
  };
}

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  await trackPageView(`/organizations/${slug}`, user?.id ?? null);

  const [allOpportunities, profile, applicationsMap, followerCount, locale] = await Promise.all([
    getOpportunities(user?.id),
    getOrganizationProfile(slug),
    user ? getApplicationsMap(user.id) : Promise.resolve({} as Record<string, ApplicationState>),
    getFollowerCount(slug),
    getLocale(),
  ]);

  const org = findOrganizationSummary(allOpportunities, slug);
  if (!org) notFound();
  const orgLabel = profile?.typeLabelOverride ?? (org.primaryType === "Job" ? "Recrutement" : "Concours et admissions");

  const orgOpportunities = getOrganizationOpportunities(allOpportunities, slug);
  const current = orgOpportunities.filter((o) => o.status === "open");
  const past = orgOpportunities.filter((o) => o.status === "closed");

  // "Similar" — other organizations' open opportunities matching whatever
  // type this org posts most often, so someone who didn't find a fit here
  // has somewhere real to keep looking, not just a dead end.
  const typeCounts = current.reduce<Record<string, number>>((acc, o) => {
    acc[o.type] = (acc[o.type] ?? 0) + 1;
    return acc;
  }, {});
  const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const similarOpportunities = mostCommonType
    ? allOpportunities
        .filter((o) => o.organization !== org.name && o.type === mostCommonType && o.status === "open")
        .slice(0, 4)
    : [];
  const isFollowing = user ? await isFollowingOrganization(user.id, org.slug) : false;

  const backLink = (
    <Link
      href="/organizations"
      className="mb-4 flex w-fit items-center gap-1 text-sm text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
    >
      <ChevronLeft size={15} /> All organizations
    </Link>
  );

  // LEFT SIDEBAR — profile card
  const sidebar = (
    <aside className="lg:sticky lg:top-6 lg:h-fit lg:w-[300px] lg:shrink-0">

      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/5">
        <div className="h-20 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500" />
        <div className="px-5 pb-5">
          <img
            src={profile?.logo || org.image}
            alt={`Logo ${org.name}`}
            className="-mt-9 h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-lg dark:border-[#0b1020]"
          />

          <h1 className="mt-3 text-lg font-bold leading-snug">{org.name} {orgLabel} {new Date().getFullYear()}</h1>

          {profile?.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{profile.description}</p>
          )}

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <MapPin size={14} className="shrink-0" /> {org.locations.join(", ")}
            </div>
            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-600 hover:underline dark:text-purple-400"
              >
                <Globe size={14} className="shrink-0" /> {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Calendar size={14} className="shrink-0" /> Joined Forsa Go in {formatMonthYear(org.joinedAt)}
            </div>
          </div>

          <div className="mt-5">
            <FollowButton slug={org.slug} name={org.name} initiallyFollowing={isFollowing} isLoggedIn={Boolean(user)} fullWidth />
          </div>
        </div>
      </div>
    </aside>
  );

  const tabs = (
    <OrganizationTabs
      org={org}
      profile={profile}
      current={current}
      past={past}
      applicationsMap={applicationsMap}
      followerCount={followerCount}
      guestMode={!user}
      locale={locale}
    />
  );

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    url: `${siteUrl}/organizations/${org.slug}`,
    ...(profile?.logo ? { logo: profile.logo } : {}),
    ...(profile?.website ? { sameAs: [profile.website] } : {}),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Organizations", item: `${siteUrl}/organizations` },
      { "@type": "ListItem", position: 3, name: org.name, item: `${siteUrl}/organizations/${org.slug}` },
    ],
  };

  const layout = (
    <>
      {backLink}
      <div className="flex flex-col gap-6 lg:flex-row">
        {sidebar}
        <div className="min-w-0 flex-1">{tabs}</div>
      </div>

      {similarOpportunities.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-semibold">Opportunités similaires</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {similarOpportunities.map((o) => (
              <Link
                key={o.id}
                href={`/opportunities/${o.id}`}
                className="rounded-2xl border border-black/10 bg-white/60 p-4 transition hover:border-purple-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-purple-500/40"
              >
                <p className="truncate text-sm font-semibold">{o.title}</p>
                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{o.organization}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={11} /> {o.location}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Script id="organization-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <Script id="breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );

  if (!user) {
    return (
      <PublicShell title={org.name} subtitle={`${org.total} opportunities from this organization`} locale={locale}>
        {layout}
      </PublicShell>
    );
  }

  const notifications = await getNotifications(user.id);

  return (
    <AppShell
      title={org.name}
      subtitle={`${org.total} opportunit${org.total === 1 ? "y" : "ies"} · ${followerCount} follower${followerCount === 1 ? "" : "s"}`}
      notifications={notifications}
      user={user}
      isAdmin={isAdminEmail(user.email)}
      locale={locale}
    >
      {layout}
    </AppShell>
  );
}
