import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import ManagerDashboardClient from "@/components/manager/ManagerDashboardClient";
import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { getNotifications } from "@/lib/db/notifications";
import { getLocale } from "@/lib/i18n/getLocale";
import { getManagerStatus, getLinkedAccountsWithStats } from "@/lib/db/managers";

export const metadata: Metadata = {
  title: "Manager Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ManagerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/manager");
  if (!user.managerTier) redirect("/dashboard");

  const [notifications, locale, status, linkedAccounts] = await Promise.all([
    getNotifications(user.id),
    getLocale(),
    getManagerStatus(user.id),
    getLinkedAccountsWithStats(user.id),
  ]);

  return (
    <AppShell
      title="Manager Dashboard"
      subtitle="Track and manage every account linked to you"
      notifications={notifications}
      user={user}
      isAdmin={isAdminEmail(user.email)}
      locale={locale}
    >
      <ManagerDashboardClient status={status} linkedAccounts={linkedAccounts} />
    </AppShell>
  );
}
