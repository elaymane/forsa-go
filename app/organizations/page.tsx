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
import { summarizeOrganizations } from "@/lib/organizations";
import { trackPageView } from "@/lib/analytics";
import { getLocale } from "@/lib/i18n/getLocale";

export const metadata: Metadata = {
  title: "Organizations",
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

    return (
      <PublicShell
        title="Organizations"
        subtitle="Discover and follow organizations to get notified about new opportunities"
        locale={locale}
      >
        <OrganizationsDirectory organizations={organizations} profiles={profiles} followedSlugs={[]} isLoggedIn={false} />
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

  return (
    <AppShell
      title="Organizations"
      subtitle="Discover and follow organizations to get notified about new opportunities"
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
      />
    </AppShell>
  );
}
