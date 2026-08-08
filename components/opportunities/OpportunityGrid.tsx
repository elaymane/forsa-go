"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Columns2, Columns } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import type { UserProfileSnippet } from "@/lib/matching";
import OpportunityCard from "./OpportunityCard";

const ITEMS_PER_PAGE = 12;

const LAYOUTS = [
  { value: 1, icon: Columns, gridClass: "grid-cols-1" },
  { value: 2, icon: Columns2, gridClass: "grid-cols-1 sm:grid-cols-2" },
  { value: 3, icon: LayoutGrid, gridClass: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" },
] as const;

interface OpportunityGridProps {
  offers: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
  userProfile: UserProfileSnippet;
  guestMode?: boolean;
}

export default function OpportunityGrid({ offers, applicationsMap, userProfile, guestMode }: OpportunityGridProps) {
  const [layout, setLayout] = useState<1 | 2 | 3>(2);
  const [page, setPage] = useState(1);

  const idsSignature = offers.map((o) => o.id).join(",");

  // Reset to page 1 only when the actual result *set* changes (new filters/sort) —
  // not on every server revalidation, which returns a new array reference even
  // when the ids are identical (e.g. after clicking Save on the current page).
  useEffect(() => setPage(1), [idsSignature]);

  const totalPages = Math.max(1, Math.ceil(offers.length / ITEMS_PER_PAGE));
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentOffers = offers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const activeGridClass = LAYOUTS.find((l) => l.value === layout)!.gridClass;

  return (
    <div className="space-y-6">
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold">Latest Opportunities</h1>

        <div className="flex items-center gap-1 rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
          {LAYOUTS.map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setLayout(value)}
              aria-label={`Show ${value} column${value > 1 ? "s" : ""}`}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                layout === value
                  ? "bg-[#EDE9FE] text-[#7C3AED] dark:bg-purple-500/20 dark:text-purple-300"
                  : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {currentOffers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E2E8F0] p-16 text-center dark:border-white/10">
          <p className="font-medium">No opportunities match your filters.</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try clearing a filter or checking back later — new opportunities are added often.
          </p>
        </div>
      ) : (
        <div className={`grid gap-6 transition-all duration-500 ${activeGridClass}`}>
          {currentOffers.map((offer) => (
            <OpportunityCard
              key={offer.id}
              offer={offer}
              applicationState={applicationsMap[offer.id]}
              userProfile={userProfile}
              guestMode={guestMode}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <div className="flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:text-[#0F172A] disabled:pointer-events-none disabled:opacity-30 dark:hover:text-white"
              aria-label="Previous page"
            >
              ←
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              const isActive = page === pageNumber;

              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`relative rounded-xl px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                      : "text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:text-[#0F172A] disabled:pointer-events-none disabled:opacity-30 dark:hover:text-white"
              aria-label="Next page"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
