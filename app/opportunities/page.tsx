import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import PublicShell from "@/components/layout/PublicShell";
import StatsCards from "@/components/dashboard/StatsCards";
import OpportunitiesClient from "./OpportunitiesClient";
import { parseCities } from "@/lib/cities";
import HouseAd from "@/components/ads/HouseAd";
import AddConcoursModal from "@/components/opportunities/AddConcoursModal";
import { FilterProvider } from "@/lib/filters/FilterContext";
import OpportunitiesSearchBar from "@/components/opportunities/OpportunitiesSearchBar";
import { getOpportunities, getUserCreatedConcoursCount } from "@/lib/db/opportunities";
import { getApplicationsMap, generateDeadlineRemindersInBackground } from "@/lib/db/applications";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser, getActingUser } from "@/lib/session";
import ActingAsBanner from "@/components/manager/ActingAsBanner";
import { isAdminEmail } from "@/lib/admin";
import { trackPageView } from "@/lib/analytics";
import { getOpportunityViewCounts } from "@/lib/db/analytics";
import { hasUnlimitedTracking } from "@/lib/subscription";
import { getFoundingMemberSpotsLeft } from "@/lib/db/auth";
import { getLocale } from "@/lib/i18n/getLocale";
import { Sparkles } from "lucide-react";
import { t } from "@/lib/i18n/translations";

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
    const viewCounts = await getOpportunityViewCounts(opportunities.map((o) => o.id));
    const i = t(locale).opportunitiesPage;
    const guestCities = Array.from(new Set(opportunities.flatMap((o) => parseCities(o.location)))).sort();

    return (
      <PublicShell
        title={i.title}
        subtitle={i.subtitleGuest}
        locale={locale}
      >
        <FilterProvider>
          <OpportunitiesSearchBar cities={guestCities} locale={locale} />
          <OpportunitiesClient
            opportunities={opportunities}
            applicationsMap={{}}
            userProfile={{ level: null, specialization: null }}
            guestMode
            locale={locale}
            viewCounts={viewCounts}
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

  const cities = Array.from(new Set(opportunities.flatMap((o) => parseCities(o.location)))).sort();
  const viewCounts = await getOpportunityViewCounts(opportunities.map((o) => o.id));
  const i = t(locale).opportunitiesPage;

  return (
    <AppShell
      title={i.title}
      subtitle={i.subtitleUser}
      notifications={notifications}
      user={user}
      isAdmin={isAdminEmail(user.email)}
      locale={locale}
    >
      {actingUser.id !== user.id && <ActingAsBanner name={actingUser.name} />}

      <div className="flex flex-col gap-4 rounded-2xl border border-purple-200/60 bg-gradient-to-r from-purple-50 to-indigo-50 p-5 dark:border-purple-500/20 dark:from-purple-500/10 dark:to-indigo-500/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-purple-600 shadow-sm dark:bg-white/10 dark:text-purple-300">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-semibold">{i.addConcoursTitle}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{i.addConcoursSubtitle}</p>
          </div>
        </div>
        <AddConcoursModal addedCount={addedCount} unlimited={hasUnlimitedTracking(actingUser)} locale={locale} />
      </div>
      <StatsCards opportunities={opportunities} applicationsMap={applicationsMap} locale={locale} />
      <HouseAd user={user} foundingSpotsLeft={foundingSpotsLeft} />
      <OpportunitiesSearchBar cities={cities} locale={locale} />
      <OpportunitiesClient
        opportunities={opportunities}
        applicationsMap={applicationsMap}
        userProfile={{ level: actingUser.level, specialization: actingUser.specialization }}
        locale={locale}
        viewCounts={viewCounts}
      />
    </AppShell>
  );
}
