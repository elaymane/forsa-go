"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, Building2, Calendar, Bookmark } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import { toggleSaveAction, advanceStageAction } from "@/app/actions";
import { parseCities } from "@/lib/cities";
import OpportunityDetailModal from "@/components/opportunities/OpportunityDetailModal";
import { t, type Locale } from "@/lib/i18n/translations";

interface OpportunitySpotlightProps {
  opportunities: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
  locale: Locale;
}

export default function OpportunitySpotlight({ opportunities, applicationsMap, locale }: OpportunitySpotlightProps) {
  const i = t(locale).opportunitySpotlight;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedOffer, setSelectedOffer] = useState<Opportunity | null>(null);
  const router = useRouter();
  const urgent = opportunities
    .filter((o) => o.status === "open")
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 6);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{i.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{i.subtitle}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="rounded-xl border border-black/10 bg-black/5 p-2 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="rounded-xl border border-black/10 bg-black/5 p-2 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div ref={scrollRef} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-1">
          {urgent.map((offer) => {
            const state = applicationsMap[offer.id];
            const saved = state?.saved ?? false;
            const applied = Boolean(state?.stage);

            return (
              <div
                key={offer.id}
                className="w-[260px] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-black/10 bg-white/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.04] hover:border-indigo-400/40 hover:shadow-[0_20px_50px_-15px_rgba(99,102,241,0.4)] dark:border-white/10 dark:bg-white/5 sm:w-[280px] lg:w-[300px]"
              >
                <div
                  className="relative flex h-40 cursor-pointer items-center justify-center overflow-hidden bg-black/5 dark:bg-white/5"
                  onClick={() => setSelectedOffer(offer)}
                  role="button"
                  aria-label={`View details for ${offer.title}`}
                >
                  <img
                    src={offer.image}
                    alt={`${offer.title} — ${offer.organization}`}
                    loading="lazy"
                    decoding="async"
                    className="h-20 object-contain transition-transform duration-500 hover:scale-110"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startTransition(async () => {
                        const result = await toggleSaveAction(offer.id);
                        if (result.limitReached) router.push("/subscribe");
                      });
                    }}
                    disabled={isPending}
                    aria-label="Save opportunity"
                    className="absolute right-3 top-3 rounded-xl bg-black/40 p-2 text-white transition hover:bg-black/60"
                  >
                    <Bookmark size={14} className={saved ? "fill-yellow-400 text-yellow-400" : ""} />
                  </button>
                </div>

                <div className="space-y-2 p-4">
                  <h3 className="font-semibold">{offer.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{offer.description}</p>

                  <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {parseCities(offer.location).map((city) => (
                        <Link
                          key={city}
                          href={`/cities/${encodeURIComponent(city)}`}
                          className="flex items-center gap-1 rounded transition hover:text-purple-500"
                        >
                          <MapPin size={12} /> {city}
                        </Link>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 size={12} /> {offer.organization}
                    </div>
                    <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                      <Calendar size={12} /> {offer.deadline}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          const result = await advanceStageAction(offer.id);
                          if (result.limitReached) router.push("/subscribe");
                          if (result.expired) alert("This opportunity's deadline has passed — you can no longer apply.");
                        })
                      }
                      disabled={isPending || applied}
                      className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-2 text-sm text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {applied ? "Applied ✓" : "Apply"}
                    </button>
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          const result = await toggleSaveAction(offer.id);
                          if (result.limitReached) router.push("/subscribe");
                        })
                      }
                      disabled={isPending}
                      className="rounded-xl border border-black/10 bg-black/5 px-4 py-2 text-sm transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      {saved ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
