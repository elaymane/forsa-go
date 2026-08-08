"use client";

import { useState } from "react";
import Link from "next/link";
import type { TimelineEvent } from "@/types/opportunity";

export default function UpcomingTimeline({ events }: { events: TimelineEvent[] }) {
  const [selected, setSelected] = useState<TimelineEvent | null>(null);

  return (
    <div>
      <div>
        <h2 className="font-semibold">📅 Your Timeline</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Applications you're actively pursuing</p>
      </div>

      <div className="relative space-y-6 pl-6 pt-6">
        <div className="absolute bottom-2 left-2 top-8 w-[2px] bg-black/10 dark:bg-white/10" />

        {events.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nothing here yet — apply to an opportunity below and it'll show up here with its next
            deadline.
          </p>
        ) : (
          events.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="min-w-[90px]">
              <div className="rounded-lg border border-black/10 bg-black/5 px-2 py-1 text-center text-xs text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                {item.date}
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="mt-3 h-2 w-2 rounded-full bg-indigo-400/60" />
            </div>

            <button
              onClick={() => setSelected(item)}
              className={`flex-1 rounded-2xl border p-3 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-black/[0.03] hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.35)] dark:hover:bg-white/10 ${
                selected?.id === item.id
                  ? "border-indigo-400/40 bg-indigo-500/5"
                  : "border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{item.opportunity}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.organization}</div>
                </div>

                <div className="whitespace-nowrap rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-300">
                  {item.daysLeft} days left
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-indigo-600 dark:text-indigo-300">{item.phase}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {selected?.id === item.id ? "Selected" : "Click for details →"}
                </div>
              </div>
            </button>
          </div>
          ))
        )}
      </div>

      {selected && (
        <div className="mt-4 rounded-2xl border border-indigo-400/30 bg-indigo-500/5 p-4 text-sm">
          <p className="font-semibold">{selected.opportunity}</p>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {selected.phase} · {selected.organization} · {selected.date}
          </p>
        </div>
      )}

      <Link
        href="/calendar"
        className="mt-5 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 text-sm font-medium text-white transition hover:scale-[1.02]"
      >
        Open Full Calendar →
      </Link>
    </div>
  );
}
