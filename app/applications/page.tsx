import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import ApplicationsClient from "@/components/applications/ApplicationsClient";
import { getOpportunities } from "@/lib/db/opportunities";
import { getApplicationsMap, generateDeadlineRemindersInBackground } from "@/lib/db/applications";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser, getActingUser } from "@/lib/session";
import ActingAsBanner from "@/components/manager/ActingAsBanner";
import { isAdminEmail } from "@/lib/admin";
import { getLocale } from "@/lib/i18n/getLocale";

export const metadata: Metadata = {
  title: "My Applications",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/applications");
  const actingUser = await getActingUser(user);

  generateDeadlineRemindersInBackground(actingUser.id);

  const [opportunities, applicationsMap, notifications, locale] = await Promise.all([
    getOpportunities(actingUser.id),
    getApplicationsMap(actingUser.id),
    getNotifications(user.id),
    getLocale(),
  ]);

  // Only opportunities with a real application (stage set) — saved-only
  // items live on the "Saved" list, not here.
  const applications = opportunities.filter((o) => applicationsMap[o.id]?.stage != null);

  return (
    <AppShell
      title="My Applications"
      subtitle="Track the status of all your applications"
      notifications={notifications}
      user={user}
      isAdmin={isAdminEmail(user.email)}
      locale={locale}
    >
      {actingUser.id !== user.id && <ActingAsBanner name={actingUser.name} />}
      <ApplicationsClient opportunities={applications} applicationsMap={applicationsMap} />
    </AppShell>
  );
}
