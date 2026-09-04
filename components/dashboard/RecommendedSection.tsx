"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, MapPin, ArrowRight, UserCog } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import { matchesProfile, type UserProfileSnippet } from "@/lib/matching";
import { Badge } from "@/components/ui/Badge";
import OpportunityDetailModal from "@/components/opportunities/OpportunityDetailModal";
import { parseCities } from "@/lib/cities";
import { t, type Locale } from "@/lib/i18n/translations";

interface RecommendedSectionProps {
  opportunities: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
  userProfile: UserProfileSnippet;
  locale: Locale;
}

export default function RecommendedSection({
  opportunities,
  applicationsMap,
  userProfile,
  locale,
}: RecommendedSectionProps) {
  const i = t(locale).recommendedSection;
  const [selectedOffer, setSelectedOffer] = useState<Opportunity | null>(null);
  const hasProfile = Boolean(userProfile.level || userProfile.specialization);

  const recommended = useMemo(() => {
    if (!hasProfile) return [];

    return opportunities
      .filter((offer) => {
        // Already saved or applied — not a "new recommendation" anymore.
        const state = applicationsMap[offer.id];
        if (state?.saved || state?.stage) return false;
        return matchesProfile(offer, userProfile);
      })
      .slice(0, 4);
  }, [opportunities, applicationsMap, userProfile, hasProfile]);

  // No profile set yet — explain why there's nothing here instead of just vanishing.
  if (!hasProfile) {
    return (
      <Link
        href="/profile"
        className="flex items-center gap-4 rounded-3xl border border-purple-200/60 bg-gradient-to-r from-purple-50 to-indigo-50 p-5 transition hover:scale-[1.005] dark:border-purple-500/20 dark:from-purple-500/10 dark:to-indigo-500/10"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-purple-600 shadow-sm dark:bg-white/10 dark:text-purple-300">
          <UserCog size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{i.getMatched}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {i.setProfile}
          </p>
        </div>
        <ArrowRight size={16} className="shrink-0 text-purple-500" />
      </Link>
    );
  }

  // Profile is set, but nothing matches yet — also worth saying explicitly.
  if (recommended.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-black/10 p-5 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
        {i.noMatches}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
          <Sparkles size={15} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{i.title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recommended.map((offer) => (
          <div
            key={offer.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedOffer(offer)}
            onKeyDown={(e) => e.key === "Enter" && setSelectedOffer(offer)}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-purple-200/60 bg-gradient-to-b from-purple-50/60 to-white text-left transition hover:-translate-y-1 hover:shadow-lg dark:border-purple-500/20 dark:from-purple-500/[0.06] dark:to-white/5"
          >
            <div className="flex h-24 items-center justify-center bg-black/[0.02] dark:bg-white/[0.03]">
              <img src={offer.image} alt={`${offer.title} — ${offer.organization}`} loading="lazy" decoding="async" className="h-16 w-16 object-contain transition group-hover:scale-110" />
            </div>
            <div className="p-3">
              <h3 className="truncate text-sm font-semibold">{offer.title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                {parseCities(offer.location).map((city) => (
                  <Link
                    key={city}
                    href={`/cities/${encodeURIComponent(city)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 transition hover:text-purple-500"
                  >
                    <MapPin size={11} /> {city}
                  </Link>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                {offer.level && (
                  <Badge tone="primary" className="px-2 py-0.5 text-[10px]">
                    {offer.level}
                  </Badge>
                )}
                <ArrowRight size={13} className="ml-auto text-purple-400 opacity-0 transition group-hover:opacity-100" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedOffer && (
        <OpportunityDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          applicationState={applicationsMap[selectedOffer.id]}
          locale={locale}
        />
      )}
    </div>
  );
}
