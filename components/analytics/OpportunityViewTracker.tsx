"use client";

import { useEffect } from "react";
import { trackOpportunityEvent } from "@/lib/gtm";

interface OpportunityViewTrackerProps {
  opportunity: {
    id: string;
    title: string;
    type: string;
    organization: string;
    location: string;
  };
}

export default function OpportunityViewTracker({ opportunity }: OpportunityViewTrackerProps) {
  useEffect(() => {
    trackOpportunityEvent("view_opportunity", {
      opportunity_id: opportunity.id,
      opportunity_title: opportunity.title,
      opportunity_type: opportunity.type,
      organization: opportunity.organization,
      location: opportunity.location,
    });
  }, [opportunity]);

  return null;
}
