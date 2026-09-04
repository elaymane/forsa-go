import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import DashboardHero from "@/components/dashboard/DashboardHero";
import StatsCards from "@/components/dashboard/StatsCards";
import RecommendedSection from "@/components/dashboard/RecommendedSection";
import OpportunitySpotlight from "@/components/dashboard/OpportunitySpotlight";
import UpcomingTimeline from "@/components/dashboard/UpcomingTimeline";
import NewOpportunitiesCarousel from "@/components/dashboard/NewOpportunitiesCarousel";
import UnknownExamDatesSection from "@/components/dashboard/UnknownExamDatesSection";
import HouseAd from "@/components/ads/HouseAd";
import { getOpportunities } from "@/lib/db/opportunities";
import { getApplicationsMap, getMyTimeline, generateDeadlineRemindersInBackground } from "@/lib/db/applications";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser, getActingUser } from "@/lib/session";
import ActingAsBanner from "@/components/manager/ActingAsBanner";
import { isAdminEmail } from "@/lib/admin";
import { trackPageView } from "@/lib/analytics";
import { getFoundingMemberSpotsLeft } from "@/lib/db/auth";
import { getLocale } from "@/lib/i18n/getLocale";
import LoginTracker from "@/components/analytics/LoginTracker";

// Private, per-user content — never index this.
export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

// Always read the latest data from Postgres — this page reflects every
// save/apply/withdraw action immediately, no caching in between.
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ login?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  const { login } = await searchParams;
  const actingUser = await getActingUser(user);
  await trackPageView("/dashboard", actingUser.id);

  // Automatic — no manual trigger. Checks dates already on file and fires
  // any reminders that just entered their window, every time this loads.
  generateDeadlineRemindersInBackground(actingUser.id);

  const [opportunities, applicationsMap, notifications, timeline, foundingSpotsLeft, locale] = await Promise.all([
    getOpportunities(actingUser.id),
    getApplicationsMap(actingUser.id),
    getNotifications(user.id),
    getMyTimeline(actingUser.id),
    getFoundingMemberSpotsLeft(),
    getLocale(),
  ]);

  return (
    <AppShell notifications={notifications} user={user} isAdmin={isAdminEmail(user.email)} locale={locale}>
      {login === "1" && <LoginTracker />}
      {actingUser.id !== user.id && <ActingAsBanner name={actingUser.name} />}

      <DashboardHero opportunities={opportunities} applicationsMap={applicationsMap} userName={actingUser.name} locale={locale} />

      <StatsCards opportunities={opportunities} applicationsMap={applicationsMap} locale={locale} />

      <RecommendedSection
        opportunities={opportunities}
        applicationsMap={applicationsMap}
        userProfile={{ level: actingUser.level, specialization: actingUser.specialization }}
        locale={locale}
      />

      <HouseAd user={user} foundingSpotsLeft={foundingSpotsLeft} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OpportunitySpotlight opportunities={opportunities} applicationsMap={applicationsMap} locale={locale} />
        </div>
        <UpcomingTimeline events={timeline} locale={locale} />
      </div>

      <UnknownExamDatesSection opportunities={opportunities} applicationsMap={applicationsMap} locale={locale} />

      <NewOpportunitiesCarousel opportunities={opportunities} applicationsMap={applicationsMap} locale={locale} />
    </AppShell>
  );
}
