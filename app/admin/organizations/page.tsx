import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import OrganizationsManager from "@/components/admin/OrganizationsManager";
import { getOpportunities, placeholderLogo } from "@/lib/db/opportunities";
import { getAllOrganizationProfiles } from "@/lib/db/organizationProfiles";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { summarizeOrganizations } from "@/lib/organizations";
import { getLocale } from "@/lib/i18n/getLocale";

export const metadata: Metadata = {
  title: "Manage Organizations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminOrganizationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/organizations");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  const [opportunities, profiles, notifications, locale] = await Promise.all([
    getOpportunities(),
    getAllOrganizationProfiles(),
    getNotifications(user.id),
    getLocale(),
  ]);

  const derived = summarizeOrganizations(opportunities);
  const derivedSlugs = new Set(derived.map((o) => o.slug));

  // Orgs with a profile but no opportunities yet (just created via "+") still need to show up.
  const profileOnly = Object.values(profiles)
    .filter((p) => !derivedSlugs.has(p.slug))
    .map((p) => ({
      name: p.name,
      slug: p.slug,
      image: p.logo || placeholderLogo(p.name),
      total: 0,
      open: 0,
      levels: [] as string[],
      locations: [] as string[],
      types: [] as string[],
      // No opportunities yet for these — no real historical date to draw from,
      // so "now" is the honest value rather than fabricating one.
      lastUpdatedAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
    }));

  const organizations = [...derived, ...profileOnly];

  return (
    <AppShell
      title="Manage Organizations"
      subtitle="Set the logo, description, and website each organization page shows"
      notifications={notifications}
      user={user}
      isAdmin
      locale={locale}
    >
      <OrganizationsManager organizations={organizations} profiles={profiles} />
    </AppShell>
  );
}
