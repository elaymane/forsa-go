"use client";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type OpportunityAnalyticsParams = {
  opportunity_id: string;
  opportunity_title?: string;
  opportunity_type?: string;
  organization?: string;
  location?: string;
};

export function trackEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...params,
  });
}

export function trackOpportunityEvent(
  event: "view_opportunity" | "save_opportunity" | "apply_opportunity",
  offer: OpportunityAnalyticsParams,
) {
  trackEvent(event, offer);
}
