"use client";

import { useMemo } from "react";
import { useFilters } from "@/lib/filters/FilterContext";
import OpportunityGrid from "@/components/opportunities/OpportunityGrid";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import type { UserProfileSnippet } from "@/lib/matching";

interface OpportunitiesClientProps {
  opportunities: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
  userProfile: UserProfileSnippet;
  guestMode?: boolean;
}

export default function OpportunitiesClient({ opportunities, applicationsMap, userProfile, guestMode }: OpportunitiesClientProps) {
  const { selectedFilters, selectedCities, sort, searchQuery } = useFilters();

  const filteredOffers = useMemo(() => {
    let result =
      selectedFilters.length === 0
        ? opportunities
        : opportunities.filter((o) => selectedFilters.includes(o.type));

    if (selectedCities.length > 0) {
      result = result.filter((o) => selectedCities.includes(o.location));
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
  }, [opportunities, selectedFilters, selectedCities, sort, searchQuery]);

  return (
    <OpportunityGrid
      offers={filteredOffers}
      applicationsMap={applicationsMap}
      userProfile={userProfile}
      guestMode={guestMode}
    />
  );
}
