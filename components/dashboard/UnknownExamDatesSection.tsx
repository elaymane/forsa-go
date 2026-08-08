"use client";

import { useState } from "react";
import { CalendarPlus, ChevronRight, MapPin } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import OpportunityDetailModal from "@/components/opportunities/OpportunityDetailModal";

interface UnknownExamDatesSectionProps {
  opportunities: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
}

interface MissingDateEntry {
  offer: Opportunity;
  needs: "written" | "oral";
}

export default function UnknownExamDatesSection({ opportunities, applicationsMap }: UnknownExamDatesSectionProps) {
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
          <h2 className="font-semibold">Exam dates to confirm</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {missingDate.length} application{missingDate.length === 1 ? "" : "s"} waiting on a date —
            add yours as soon as you find out and we'll track it from there
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {missingDate.map(({ offer, needs }) => (
          <button
            key={offer.id}
            onClick={() => setSelectedOffer(offer)}
            className="flex w-full items-center gap-3 rounded-xl border border-amber-200/60 bg-white/70 p-3 text-left transition hover:border-amber-300 hover:bg-white dark:border-amber-500/20 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <img src={offer.image} alt={offer.title} loading="lazy" decoding="async" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{offer.title}</p>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <MapPin size={11} /> {offer.location}
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
              Add {needs} date
            </span>
            <ChevronRight size={16} className="shrink-0 text-gray-400" />
          </button>
        ))}
      </div>

      {selectedOffer && (
        <OpportunityDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          applicationState={applicationsMap[selectedOffer.id]}
        />
      )}
    </div>
  );
}
