import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, Globe, MapPin, Calendar } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PublicShell from "@/components/layout/PublicShell";
import FollowButton from "@/components/organizations/FollowButton";
import OrganizationTabs from "@/components/organizations/OrganizationTabs";
import { getOpportunities } from "@/lib/db/opportunities";
import { getApplicationsMap } from "@/lib/db/applications";
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

  const description =
    profile?.description ||
    `${org.total} opportunit${org.total === 1 ? "y" : "ies"} from ${org.name}${
      org.locations.length ? ` in ${org.locations.join(", ")}` : ""
    } — ${org.open} currently open. Track deadlines and get notified of new openings on Forsa Go.`;

  return {
    title: org.name,
    description,
    keywords: profile?.keywords ? profile.keywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined,
    alternates: { canonical: `/organizations/${slug}` },
    openGraph: { title: org.name, description },
    twitter: { title: org.name, description },
  };
}

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  await trackPageView(`/organizations/${slug}`, user?.id ?? null);

  const [allOpportunities, profile, applicationsMap, followerCount] = await Promise.all([
    getOpportunities(user?.id),
    getOrganizationProfile(slug),
    user ? getApplicationsMap(user.id) : Promise.resolve({}),
    getFollowerCount(slug),
  ]);

  const org = findOrganizationSummary(allOpportunities, slug);
  if (!org) notFound();

  const orgOpportunities = getOrganizationOpportunities(allOpportunities, slug);
  const current = orgOpportunities.filter((o) => o.status === "open");
  const past = orgOpportunities.filter((o) => o.status === "closed");
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
            alt={org.name}
            className="-mt-9 h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-lg dark:border-[#0b1020]"
          />

          <h1 className="mt-3 text-lg font-bold leading-snug">{org.name}</h1>

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
    />
  );

  const layout = (
    <>
      {backLink}
      <div className="flex flex-col gap-6 lg:flex-row">
        {sidebar}
        <div className="min-w-0 flex-1">{tabs}</div>
      </div>
    </>
  );

  if (!user) {
    const locale = await getLocale();
    return (
      <PublicShell title={org.name} subtitle={`${org.total} opportunities from this organization`} locale={locale}>
        {layout}
      </PublicShell>
    );
  }

  const [notifications, locale] = await Promise.all([getNotifications(user.id), getLocale()]);

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
