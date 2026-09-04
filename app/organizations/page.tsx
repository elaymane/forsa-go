import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import PublicShell from "@/components/layout/PublicShell";
import OrganizationsDirectory from "@/components/organizations/OrganizationsDirectory";
import { getOpportunities } from "@/lib/db/opportunities";
import { getAllOrganizationProfiles } from "@/lib/db/organizationProfiles";
import { getFollowedOrganizationSlugs } from "@/lib/db/follows";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { summarizeOrganizations, computeOrganizationsPageStats } from "@/lib/organizations";
import { trackPageView } from "@/lib/analytics";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translations";

export const metadata: Metadata = {
  title: "Organisations",
};

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const user = await getCurrentUser();
  await trackPageView("/organizations", user?.id ?? null);

  if (!user) {
    const [opportunities, profiles, locale] = await Promise.all([
      getOpportunities(),
      getAllOrganizationProfiles(),
      getLocale(),
    ]);
    const organizations = summarizeOrganizations(opportunities);
    const stats = computeOrganizationsPageStats(opportunities);
    const i = t(locale).organizationsPage;

    return (
      <PublicShell
        title={i.title}
        subtitle={i.subtitle}
        locale={locale}
      >
        <OrganizationsDirectory organizations={organizations} profiles={profiles} followedSlugs={[]} isLoggedIn={false} locale={locale} stats={stats} />
      </PublicShell>
    );
  }

  const [opportunities, profiles, followedSlugs, notifications, locale] = await Promise.all([
    getOpportunities(user.id),
    getAllOrganizationProfiles(),
    getFollowedOrganizationSlugs(user.id),
    getNotifications(user.id),
    getLocale(),
  ]);

  const organizations = summarizeOrganizations(opportunities);
  const stats = computeOrganizationsPageStats(opportunities);
  const i = t(locale).organizationsPage;

  return (
    <AppShell
      title={i.title}
      subtitle={i.subtitle}
      notifications={notifications}
      user={user}
      isAdmin={isAdminEmail(user.email)}
      locale={locale}
    >
      <OrganizationsDirectory
        organizations={organizations}
        profiles={profiles}
        followedSlugs={followedSlugs}
        isLoggedIn
        locale={locale}
        stats={stats}
      />
    </AppShell>
  );
}
