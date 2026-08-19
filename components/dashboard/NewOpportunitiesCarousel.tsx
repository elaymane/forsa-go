"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Bookmark, Eye, Send } from "lucide-react";
import type { Opportunity, OpportunityType } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import { toggleSaveAction, advanceStageAction } from "@/app/actions";
import { Badge } from "@/components/ui/Badge";
import OpportunityDetailModal from "@/components/opportunities/OpportunityDetailModal";
import { parseCities } from "@/lib/cities";
import { t, type Locale } from "@/lib/i18n/translations";

const FILTERS: Array<OpportunityType | "All"> = ["All", "Concours", "Job", "Internship", "Scholarship"];

const TYPE_TONE: Record<OpportunityType, "primary" | "success" | "info" | "warning"> = {
  Concours: "primary",
  Job: "success",
  Internship: "info",
  Training: "warning",
  Scholarship: "warning",
};

const PAGE_SIZE = 4;

interface NewOpportunitiesCarouselProps {
  opportunities: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
  locale: Locale;
}

export default function NewOpportunitiesCarousel({
  opportunities,
  applicationsMap,
  locale,
}: NewOpportunitiesCarouselProps) {
  const i = t(locale).newOpportunitiesCarousel;
  const typeLabels = t(locale).typeLabels;
  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [selectedOffer, setSelectedOffer] = useState<Opportunity | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = filter === "All" ? opportunities : opportunities.filter((o) => o.type === filter);
  const visible = filtered.slice(index, index + PAGE_SIZE);

  const next = () => index + PAGE_SIZE < filtered.length && setIndex(index + PAGE_SIZE);
  const prev = () => index > 0 && setIndex(Math.max(index - PAGE_SIZE, 0));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold sm:text-2xl">{i.title}</h2>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setIndex(0);
              }}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                filter === f
                  ? "border-transparent bg-black text-white dark:bg-white dark:text-black"
                  : "border-black/10 bg-white/70 hover:border-indigo-400/40 hover:bg-indigo-500/10 dark:border-white/10 dark:bg-white/5"
              }`}
            >
              {f === "All" ? i.all : typeLabels[f as keyof typeof typeLabels]}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 p-10 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
{i.noneRightNow.replace("{type}", filter === "All" ? "" : (typeLabels[filter as keyof typeof typeLabels] ?? "").toLowerCase())}
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={prev}
            disabled={index === 0}
            aria-label="Previous opportunities"
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-black/10 bg-white/80 p-3 backdrop-blur transition hover:scale-110 disabled:pointer-events-none disabled:opacity-30 dark:border-white/10 dark:bg-black/40 sm:flex"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={next}
            disabled={index + PAGE_SIZE >= filtered.length}
            aria-label="Next opportunities"
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-black/10 bg-white/80 p-3 backdrop-blur transition hover:scale-110 disabled:pointer-events-none disabled:opacity-30 dark:border-white/10 dark:bg-black/40 sm:flex"
          >
            <ChevronRight />
          </button>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:px-10 lg:grid-cols-4">
            {visible.map((offer) => {
              const state = applicationsMap[offer.id];
              const saved = state?.saved ?? false;
              const applied = Boolean(state?.stage);
              const isClosed = offer.status === "closed";

              return (
                <div
                  key={offer.id}
                  className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] hover:border-indigo-400/50 hover:shadow-[0_25px_60px_-15px_rgba(99,102,241,0.35)] dark:border-white/10 dark:bg-white/5"
                >
                  <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-indigo-500 to-purple-500" />

                  <div className="absolute left-3 top-3 flex flex-col gap-1">
                    <Badge tone={TYPE_TONE[offer.type]}>{offer.type}</Badge>
                    {offer.level &&
                      offer.level
                        .split(",")
                        .map((l) => l.trim())
                        .filter(Boolean)
                        .map((l) => (
                          <Badge key={l} tone="neutral">
                            {l}
                          </Badge>
                        ))}
                  </div>

                  <div className="flex justify-center py-6">
                    <img
                      src={offer.image}
                      alt={`${offer.title} — ${offer.organization}`}
                      loading="lazy"
                      decoding="async"
                      className="h-20 w-20 object-contain transition group-hover:scale-110"
                    />
                  </div>

                  <div className="px-4 pb-4 text-center">
                    <h3 className="text-sm font-semibold transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {offer.title}
                    </h3>
                    <p className="text-xs opacity-60">{offer.organization}</p>

                    <div className="mt-3 space-y-1 text-xs opacity-70">
                      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
                        {parseCities(offer.location).map((city) => (
                          <Link
                            key={city}
                            href={`/cities/${encodeURIComponent(city)}`}
                            className="flex items-center gap-1 transition hover:text-purple-500"
                          >
                            <MapPin size={11} /> {city}
                          </Link>
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Calendar size={11} /> {offer.date}
                      </div>
                      <div className="font-medium text-orange-500">⏳ {offer.deadline}</div>
                    </div>

                    <div className="mt-3 flex flex-wrap justify-center gap-1">
                      {offer.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-indigo-400/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-2 py-0.5 text-[10px] transition hover:scale-105 hover:bg-indigo-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() =>
                          startTransition(async () => {
                            const result = await advanceStageAction(offer.id);
                            if (result.limitReached) router.push("/subscribe");
                            if (result.expired) alert(i.deadlinePassed);
                          })
                        }
                        disabled={isPending || applied || isClosed}
                        className="flex items-center gap-1 rounded-lg bg-indigo-500/20 px-3 py-1 text-xs text-indigo-700 transition hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:text-indigo-300"
                      >
                        <Send size={12} /> {applied ? i.applied : i.apply}
                      </button>
                      <button
                        onClick={() => setSelectedOffer(offer)}
                        className="flex items-center gap-1 rounded-lg bg-black/5 px-3 py-1 text-xs transition hover:scale-105 dark:bg-white/10"
                      >
                        <Eye size={12} /> {i.details}
                      </button>
                      <button
                        onClick={() =>
                          startTransition(async () => {
                            const result = await toggleSaveAction(offer.id);
                            if (result.limitReached) router.push("/subscribe");
                          })
                        }
                        disabled={isPending}
                        aria-label="Save opportunity"
                        className="rounded-lg bg-black/5 p-2 transition hover:scale-110 dark:bg-white/10"
                      >
                        <Bookmark size={12} className={saved ? "fill-yellow-500 text-yellow-500" : ""} />
                      </button>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-0 bg-indigo-500/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
                </div>
              );
            })}
          </div>
        </div>
      )}

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
