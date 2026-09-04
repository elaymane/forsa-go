"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronRight, MapPin } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import OpportunityDetailModal from "@/components/opportunities/OpportunityDetailModal";
import { parseCities } from "@/lib/cities";
import { t, type Locale } from "@/lib/i18n/translations";

interface UnknownExamDatesSectionProps {
  opportunities: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
  locale: Locale;
}

interface MissingDateEntry {
  offer: Opportunity;
  needs: "written" | "oral";
}

export default function UnknownExamDatesSection({ opportunities, applicationsMap, locale }: UnknownExamDatesSectionProps) {
  const i = t(locale).unknownExamDatesSection;
  const [selectedOffer, setSelectedOffer] = useState<Opportunity | null>(null);

  const missingDate: MissingDateEntry[] = opportunities.flatMap((offer): MissingDateEntry[] => {
    const state = applicationsMap[offer.id];
    if (!state) return [];

    // At "applied", the next thing you need is the written exam date.
    if (state.stage === "applied" && !offer.examDate && !state.userExamDate) {
      return [{ offer, needs: "written" as const }];
    }

    // Once you're past the written exam, the next thing you need is the oral date.
    if (state.stage === "written" && !offer.oralExamDate && !state.userOralExamDate) {
      return [{ offer, needs: "oral" as const }];
    }

    return [];
  });

  if (missingDate.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-500/20 dark:bg-amber-500/[0.05]">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
          <CalendarPlus size={16} />
        </div>
        <div>
          <h2 className="font-semibold">{i.title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {missingDate.length} {missingDate.length === 1 ? i.waitingSingular : i.waitingPlural}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {missingDate.map(({ offer, needs }) => (
          <div
            key={offer.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedOffer(offer)}
            onKeyDown={(e) => e.key === "Enter" && setSelectedOffer(offer)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-amber-200/60 bg-white/70 p-3 text-left transition hover:border-amber-300 hover:bg-white dark:border-amber-500/20 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <img src={offer.image} alt={`${offer.title} — ${offer.organization}`} loading="lazy" decoding="async" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{offer.title}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
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
            </div>
            <span className="shrink-0 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
              {i.addDate} {needs === "written" ? i.written : i.oral} {i.dateSuffix}
            </span>
            <ChevronRight size={16} className="shrink-0 text-gray-400" />
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
