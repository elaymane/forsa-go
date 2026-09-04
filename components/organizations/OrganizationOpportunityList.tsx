"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Clock, Bookmark, ArrowRight, Lock } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import { toggleSaveAction, advanceStageAction } from "@/app/actions";
import { Badge } from "@/components/ui/Badge";
import OpportunityDetailModal from "@/components/opportunities/OpportunityDetailModal";
import type { Locale } from "@/lib/i18n/translations";

interface OpportunityRowProps {
  offer: Opportunity;
  applicationState?: ApplicationState;
  guestMode?: boolean;
  locale: Locale;
}

function OpportunityRow({ offer, applicationState, guestMode, locale }: OpportunityRowProps) {
  const [isPending, startTransition] = useTransition();
  const [showDetail, setShowDetail] = useState(false);
  const router = useRouter();
  const isClosed = offer.status === "closed";
  const saved = applicationState?.saved ?? false;
  const stage = applicationState?.stage ?? null;

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge tone={isClosed ? "danger" : "success"}>{isClosed ? "Closed" : "Open"}</Badge>
            <h3 className="truncate font-semibold">{offer.title}</h3>
          </div>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{offer.organization}</p>

          <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {offer.location}
            </span>
            {offer.deadlineDate && (
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {offer.date}
              </span>
            )}
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Clock size={12} /> {offer.deadline}
            </span>
          </div>

          {offer.description && <p className="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{offer.description}</p>}

          {offer.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {offer.tags.map((tag) => (
                <Badge key={tag} tone="neutral" className="px-2 py-0.5 text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {guestMode ? (
            <Link
              href="/signup?next=/organizations"
              className="flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
            >
              <Lock size={14} /> Sign up
            </Link>
          ) : (
            <>
              <button
                onClick={() =>
                  startTransition(async () => {
                    const result = await advanceStageAction(offer.id);
                    if (result.limitReached) router.push("/subscribe");
                    if (result.expired) alert("This opportunity's deadline has passed — you can no longer apply.");
                  })
                }
                disabled={isClosed || stage !== null || isPending}
                className="flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {stage ? "Applied ✓" : "Apply Now"} <ArrowRight size={14} />
              </button>
              <button
                onClick={() =>
                  startTransition(async () => {
                    const result = await toggleSaveAction(offer.id);
                    if (result.limitReached) router.push("/subscribe");
                  })
                }
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
              >
                <Bookmark size={14} className={saved ? "fill-yellow-500 text-yellow-500" : ""} /> Save
              </button>
            </>
          )}
          <button
            onClick={() => setShowDetail(true)}
            className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
          >
            Details <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {showDetail && (
        <OpportunityDetailModal
          offer={offer}
          onClose={() => setShowDetail(false)}
          applicationState={applicationState}
          guestMode={guestMode}
          locale={locale}
        />
      )}
    </>
  );
}

export default function OrganizationOpportunityList({
  offers,
  applicationsMap,
  guestMode,
  locale,
}: {
  offers: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
  guestMode?: boolean;
  locale: Locale;
}) {
  if (offers.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Nothing here yet.</p>;
  }

  return (
    <div className="space-y-3">
      {offers.map((offer) => (
        <OpportunityRow key={offer.id} offer={offer} applicationState={applicationsMap[offer.id]} guestMode={guestMode} locale={locale} />
      ))}
    </div>
  );
}
