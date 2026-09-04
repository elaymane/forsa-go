import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Users } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import UsersManager from "@/components/admin/UsersManager";
import { getAllUserAccounts } from "@/lib/db/auth";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { getLocale } from "@/lib/i18n/getLocale";

export const metadata: Metadata = {
  title: "Manage Users",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/users");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  const [users, notifications, locale] = await Promise.all([getAllUserAccounts(), getNotifications(user.id), getLocale()]);

  return (
    <AppShell
      title="Manage Users"
      subtitle="Find anyone and activate their subscription once you've received payment"
      notifications={notifications}
      user={user}
      isAdmin
      locale={locale}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
          <Users size={18} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{users.length} total registered users</p>
      </div>
      <UsersManager users={users} />
    </AppShell>
  );
}
