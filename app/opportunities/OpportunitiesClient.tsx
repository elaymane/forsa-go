"use client";

import { useMemo } from "react";
import { useFilters } from "@/lib/filters/FilterContext";
import OpportunityGrid from "@/components/opportunities/OpportunityGrid";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import type { UserProfileSnippet } from "@/lib/matching";
import type { Locale } from "@/lib/i18n/translations";
import { parseCities } from "@/lib/cities";

interface OpportunitiesClientProps {
  opportunities: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
  userProfile: UserProfileSnippet;
  guestMode?: boolean;
  locale: Locale;
  viewCounts?: Record<string, number>;
}

export default function OpportunitiesClient({ opportunities, applicationsMap, userProfile, guestMode, locale, viewCounts }: OpportunitiesClientProps) {
  const { selectedFilters, selectedCities, selectedLevels, closingSoon, sort, searchQuery } = useFilters();

  const filteredOffers = useMemo(() => {
    let result =
      selectedFilters.length === 0
        ? opportunities
        : opportunities.filter((o) => selectedFilters.includes(o.type));

    if (selectedCities.length > 0) {
      result = result.filter((o) => parseCities(o.location).some((c) => selectedCities.includes(c)));
    }

    if (selectedLevels.length > 0) {
      result = result.filter((o) => o.level && selectedLevels.includes(o.level));
    }

    if (closingSoon) {
      result = result.filter((o) => o.status === "open" && o.daysLeft >= 0 && o.daysLeft <= 7);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (o) => o.title.toLowerCase().includes(query) || o.organization.toLowerCase().includes(query)
      );
    }

    result = [...result].sort((a, b) => {
      if (sort === "Deadline") return a.daysLeft - b.daysLeft;
      if (sort === "Oldest") return a.id.localeCompare(b.id);
      return b.id.localeCompare(a.id); // "Newest"
    });

    return result;
  }, [opportunities, selectedFilters, selectedCities, selectedLevels, closingSoon, sort, searchQuery]);

  return (
    <OpportunityGrid
      offers={filteredOffers}
      applicationsMap={applicationsMap}
      userProfile={userProfile}
      guestMode={guestMode}
      locale={locale}
      viewCounts={viewCounts}
    />
  );
}
