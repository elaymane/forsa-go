import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import PublicShell from "@/components/layout/PublicShell";
import StatsCards from "@/components/dashboard/StatsCards";
import OpportunitiesClient from "./OpportunitiesClient";
import HouseAd from "@/components/ads/HouseAd";
import AddConcoursModal from "@/components/opportunities/AddConcoursModal";
import { FilterProvider } from "@/lib/filters/FilterContext";
import { getOpportunities, getUserCreatedConcoursCount } from "@/lib/db/opportunities";
import { getApplicationsMap, generateDeadlineRemindersInBackground } from "@/lib/db/applications";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser, getActingUser } from "@/lib/session";
import ActingAsBanner from "@/components/manager/ActingAsBanner";
import { isAdminEmail } from "@/lib/admin";
import { trackPageView } from "@/lib/analytics";
import { hasUnlimitedTracking } from "@/lib/subscription";
import { getFoundingMemberSpotsLeft } from "@/lib/db/auth";
import { getLocale } from "@/lib/i18n/getLocale";

// Public page — anyone can browse. Signing in only unlocks Apply/Save/Track.
export const metadata: Metadata = {
  title: "Opportunities",
};

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const user = await getCurrentUser();
  await trackPageView("/opportunities", user?.id ?? null);

  // ===== GUEST (logged out) — public browsing, no personal data =====
  if (!user) {
    const [opportunities, locale] = await Promise.all([getOpportunities(), getLocale()]);

    return (
      <PublicShell
        title="Opportunities"
        subtitle="Browse every concours, job, internship and scholarship — sign up to apply, save or track any of them"
        locale={locale}
      >
        <FilterProvider>
          <OpportunitiesClient
            opportunities={opportunities}
            applicationsMap={{}}
            userProfile={{ level: null, specialization: null }}
            guestMode
          />
        </FilterProvider>
      </PublicShell>
    );
  }

  // ===== SIGNED IN — full personal experience =====
  const actingUser = await getActingUser(user);
  generateDeadlineRemindersInBackground(actingUser.id);

  const [opportunities, applicationsMap, notifications, addedCount, foundingSpotsLeft, locale] = await Promise.all([
    getOpportunities(actingUser.id),
    getApplicationsMap(actingUser.id),
    getNotifications(user.id),
    getUserCreatedConcoursCount(actingUser.id),
    getFoundingMemberSpotsLeft(),
    getLocale(),
  ]);

  const cities = Array.from(new Set(opportunities.map((o) => o.location))).sort();

  return (
    <AppShell
      title="Opportunities"
      subtitle="Browse every concours, job, internship and scholarship in one place"
      notifications={notifications}
      user={user}
      isAdmin={isAdminEmail(user.email)}
      locale={locale}
      showFilters
      cities={cities}
    >
      {actingUser.id !== user.id && <ActingAsBanner name={actingUser.name} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Don't see a concours you know about?</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add it privately for your own tracking — nobody else sees it unless we publish it.
          </p>
        </div>
        <AddConcoursModal addedCount={addedCount} unlimited={hasUnlimitedTracking(actingUser)} />
      </div>
      <StatsCards opportunities={opportunities} applicationsMap={applicationsMap} />
      <HouseAd user={user} foundingSpotsLeft={foundingSpotsLeft} />
      <OpportunitiesClient
        opportunities={opportunities}
        applicationsMap={applicationsMap}
        userProfile={{ level: actingUser.level, specialization: actingUser.specialization }}
      />
    </AppShell>
  );
}
