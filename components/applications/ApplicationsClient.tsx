"use client";

import { useMemo, useState } from "react";
import { Search, MapPin, ChevronDown, ArrowRight } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import { Badge } from "@/components/ui/Badge";
import ApplicationStepper from "./ApplicationStepper";
import OpportunityDetailModal from "@/components/opportunities/OpportunityDetailModal";
import { t, type Locale } from "@/lib/i18n/translations";

type StatusFilter = "all" | "inProgress" | "completed" | "archived";

function getFilters(i: ReturnType<typeof t>["applicationsClient"]): Array<{ key: StatusFilter; label: string }> {
  return [
    { key: "all", label: i.filterAll },
    { key: "inProgress", label: i.filterInProgress },
    { key: "completed", label: i.filterCompleted },
    { key: "archived", label: i.filterArchived },
  ];
}

function matchesFilter(filter: StatusFilter, stage: NonNullable<ApplicationState["stage"]>): boolean {
  if (filter === "all") return true;
  if (filter === "inProgress") return stage === "applied" || stage === "written" || stage === "oral";
  if (filter === "completed") return stage === "accepted";
  return stage === "rejected"; // archived
}

function statusBadge(stage: NonNullable<ApplicationState["stage"]>, i: ReturnType<typeof t>["applicationsClient"]) {
  if (stage === "accepted") return { label: i.statusCompleted, tone: "success" as const };
  if (stage === "rejected") return { label: i.statusWithdrawn, tone: "danger" as const };
  return { label: i.statusInProgress, tone: "primary" as const };
}

function nextStepLabel(stage: NonNullable<ApplicationState["stage"]>, i: ReturnType<typeof t>["applicationsClient"]) {
  if (stage === "applied") return i.stepWrittenExam;
  if (stage === "written") return i.stepOralExam;
  if (stage === "oral") return i.stepFinalDecision;
  if (stage === "accepted") return i.stepAccepted;
  return i.stepWithdrawn;
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

interface ApplicationsClientProps {
  opportunities: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
  locale: Locale;
}

export default function ApplicationsClient({ opportunities, applicationsMap, locale }: ApplicationsClientProps) {
  const i = t(locale).applicationsClient;
  const FILTERS = getFilters(i);
  const SORT_OPTIONS: Array<"latest" | "oldest" | "deadline"> = ["latest", "oldest", "deadline"];
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"latest" | "oldest" | "deadline">("latest");
  const [sortOpen, setSortOpen] = useState(false);
  const [detailOffer, setDetailOffer] = useState<Opportunity | null>(null);
  const sortLabels: Record<"latest" | "oldest" | "deadline", string> = {
    latest: i.sortLatest,
    oldest: i.sortOldest,
    deadline: i.sortDeadline,
  };

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: 0, inProgress: 0, completed: 0, archived: 0 };
    for (const offer of opportunities) {
      const stage = applicationsMap[offer.id]?.stage;
      if (!stage) continue;
      for (const f of FILTERS) {
        if (matchesFilter(f.key, stage)) c[f.key] += 1;
      }
    }
    return c;
  }, [opportunities, applicationsMap]);

  const visible = useMemo(() => {
    let list = opportunities.filter((offer) => {
      const stage = applicationsMap[offer.id]?.stage;
      if (!stage) return false;
      if (!matchesFilter(filter, stage)) return false;
      if (query && !offer.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      const stateA = applicationsMap[a.id];
      const stateB = applicationsMap[b.id];
      if (sort === "deadline") return a.daysLeft - b.daysLeft;
      if (sort === "oldest") return (stateA?.createdAt ?? "").localeCompare(stateB?.createdAt ?? "");
      return (stateB?.createdAt ?? "").localeCompare(stateA?.createdAt ?? ""); // Latest
    });

    return list;
  }, [opportunities, applicationsMap, filter, query, sort]);

  return (
    <div className="space-y-5">
      {/* SEARCH + FILTERS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                filter === f.key
                  ? "border-purple-300 bg-purple-100 text-purple-700 dark:border-purple-500/40 dark:bg-purple-500/20 dark:text-purple-300"
                  : "border-black/10 bg-white text-gray-600 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  filter === f.key ? "bg-purple-200 dark:bg-purple-500/30" : "bg-black/5 dark:bg-white/10"
                }`}
              >
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={i.searchPlaceholder}
              className="w-full rounded-xl border border-black/10 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5 sm:w-56"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
            >
              {i.sortPrefix} {sortLabels[sort]}
              <ChevronDown size={14} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 z-10 mt-2 w-32 rounded-xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-[#0b1020]">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSort(s);
                      setSortOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    {sortLabels[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 p-12 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
{opportunities.length === 0 ? i.emptyNoApplications : i.emptyNoMatch}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((offer) => {
            const state = applicationsMap[offer.id]!;
            const stage = state.stage!;
            const badge = statusBadge(stage, i);
            const nextDate =
              stage === "applied"
                ? offer.examDate ?? state.userExamDate
                : stage === "written"
                ? offer.oralExamDate ?? state.userOralExamDate
                : null;

            return (
              <div
                key={offer.id}
                className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <img src={offer.image} alt={`${offer.title} — ${offer.organization}`} loading="lazy" decoding="async" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <h3 className="font-semibold">{offer.title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {offer.location}
                          </span>
                          <Badge tone="primary" className="px-2 py-0.5 text-[10px]">
                            {offer.type}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                          {i.appliedOn} {formatDate(state.createdAt.slice(0, 10))}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <ApplicationStepper stage={stage} />
                    </div>
                  </div>

                  {/* NEXT STEP PANEL */}
                  <div className="w-full shrink-0 rounded-2xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.03] lg:w-64">
                    <Badge tone={badge.tone}>{badge.label}</Badge>
                    <p className="mb-1 mt-3 text-xs text-gray-400">{i.nextStep}</p>
                    <p className="text-sm font-semibold">{nextStepLabel(stage, i)}</p>
                    {nextDate ? (
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{formatDate(nextDate)}</p>
                    ) : stage === "accepted" || stage === "rejected" ? null : (
                      <button
                        onClick={() => setDetailOffer(offer)}
                        className="mt-0.5 text-xs font-medium text-amber-600 underline decoration-dotted hover:text-amber-700 dark:text-amber-400"
                      >
                        {i.addDateLink}
                      </button>
                    )}
                    <button
                      onClick={() => setDetailOffer(offer)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-purple-600 shadow-sm transition hover:scale-[1.02] dark:bg-white/10 dark:text-purple-300"
                    >
                      {i.viewDetails} <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailOffer && (
        <OpportunityDetailModal
          offer={detailOffer}
          onClose={() => setDetailOffer(null)}
          applicationState={applicationsMap[detailOffer.id]}
          locale={locale}
        />
      )}
    </div>
  );
}
