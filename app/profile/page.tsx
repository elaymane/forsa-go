import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, ArrowRight } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import ProfileForm from "@/components/profile/ProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import ProfileManagerCode from "@/components/profile/ProfileManagerCode";
import LinkToManagerForm from "@/components/profile/LinkToManagerForm";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { getLocale } from "@/lib/i18n/getLocale";
import { getManagerStatus } from "@/lib/db/managers";
import { t } from "@/lib/i18n/translations";
import SignUpTracker from "@/components/analytics/SignUpTracker";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; signup?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const { welcome, signup } = await searchParams;
  const isWelcome = welcome === "true";
  const isSignup = signup === "1";

  const [notifications, locale, managerStatus] = await Promise.all([
    getNotifications(user.id),
    getLocale(),
    user.managerTier ? getManagerStatus(user.id) : Promise.resolve(null),
  ]);
  const i = t(locale).profilePage;

  return (
    <AppShell
      title={i.title}
      subtitle={i.subtitle}
      notifications={notifications}
      user={user}
      isAdmin={isAdminEmail(user.email)}
      locale={locale}
    >
      {isSignup && <SignUpTracker />}
      {isWelcome && (
        <div className="flex items-center gap-4 rounded-3xl border border-purple-200/60 bg-gradient-to-r from-purple-50 to-indigo-50 p-5 dark:border-purple-500/20 dark:from-purple-500/10 dark:to-indigo-500/10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-purple-600 shadow-sm dark:bg-white/10 dark:text-purple-300">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{i.welcome} {user.name.split(" ")[0]} 👋</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{i.welcomeBody}</p>
          </div>
        </div>
      )}

      <div className="max-w-lg rounded-2xl border border-black/10 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
        <ProfileForm user={user} locale={locale} />
      </div>

      {user.managerTier && managerStatus && (
        <ProfileManagerCode tier={user.managerTier} code={managerStatus.code} linkedCount={managerStatus.linkedCount} locale={locale} />
      )}

      {!user.managerTier && !user.managedByUserId && <LinkToManagerForm locale={locale} />}

      {!isWelcome && <ChangePasswordForm locale={locale} />}

      {isWelcome && (
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          {i.skipToDashboard} <ArrowRight size={14} />
        </Link>
      )}
    </AppShell>
  );
}
