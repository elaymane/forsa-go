"use client";

import { useMemo, useState } from "react";
import { Search, MapPin, ChevronDown, ArrowRight } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import { Badge } from "@/components/ui/Badge";
import ApplicationStepper from "./ApplicationStepper";
import OpportunityDetailModal from "@/components/opportunities/OpportunityDetailModal";

type StatusFilter = "all" | "inProgress" | "completed" | "archived";

const FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "inProgress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

const SORT_OPTIONS = ["Latest", "Oldest", "Deadline"];

function matchesFilter(filter: StatusFilter, stage: NonNullable<ApplicationState["stage"]>): boolean {
  if (filter === "all") return true;
  if (filter === "inProgress") return stage === "applied" || stage === "written" || stage === "oral";
  if (filter === "completed") return stage === "accepted";
  return stage === "rejected"; // archived
}

function statusBadge(stage: NonNullable<ApplicationState["stage"]>) {
  if (stage === "accepted") return { label: "Completed", tone: "success" as const };
  if (stage === "rejected") return { label: "Withdrawn", tone: "danger" as const };
  return { label: "In Progress", tone: "primary" as const };
}

function nextStepLabel(stage: NonNullable<ApplicationState["stage"]>) {
  if (stage === "applied") return "Written Exam";
  if (stage === "written") return "Oral Exam";
  if (stage === "oral") return "Final Decision";
  if (stage === "accepted") return "Accepted 🎉";
  return "Withdrawn";
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

interface ApplicationsClientProps {
  opportunities: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
}

export default function ApplicationsClient({ opportunities, applicationsMap }: ApplicationsClientProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Latest");
  const [sortOpen, setSortOpen] = useState(false);
  const [detailOffer, setDetailOffer] = useState<Opportunity | null>(null);

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
      if (sort === "Deadline") return a.daysLeft - b.daysLeft;
      if (sort === "Oldest") return (stateA?.createdAt ?? "").localeCompare(stateB?.createdAt ?? "");
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
              placeholder="Search applications..."
              className="w-full rounded-xl border border-black/10 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5 sm:w-56"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
            >
              Sort: {sort}
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
                    {s}
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
          {opportunities.length === 0
            ? "You haven't applied to anything yet — browse opportunities and hit Apply to start tracking."
            : "No applications match this filter."}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((offer) => {
            const state = applicationsMap[offer.id]!;
            const stage = state.stage!;
            const badge = statusBadge(stage);
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
                      <img src={offer.image} alt={offer.title} loading="lazy" decoding="async" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
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
                          Applied on {formatDate(state.createdAt.slice(0, 10))}
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
                    <p className="mb-1 mt-3 text-xs text-gray-400">Next Step</p>
                    <p className="text-sm font-semibold">{nextStepLabel(stage)}</p>
                    {nextDate ? (
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{formatDate(nextDate)}</p>
                    ) : stage === "accepted" || stage === "rejected" ? null : (
                      <button
                        onClick={() => setDetailOffer(offer)}
                        className="mt-0.5 text-xs font-medium text-amber-600 underline decoration-dotted hover:text-amber-700 dark:text-amber-400"
                      >
                        No date yet — add yours →
                      </button>
                    )}
                    <button
                      onClick={() => setDetailOffer(offer)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-purple-600 shadow-sm transition hover:scale-[1.02] dark:bg-white/10 dark:text-purple-300"
                    >
                      View Details <ArrowRight size={14} />
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
        />
      )}
    </div>
  );
}
