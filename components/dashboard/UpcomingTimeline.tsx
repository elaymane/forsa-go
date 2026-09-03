"use client";

import Link from "next/link";
import type { TimelineEvent } from "@/types/opportunity";
import { t, type Locale } from "@/lib/i18n/translations";

export default function UpcomingTimeline({ events, locale }: { events: TimelineEvent[]; locale: Locale }) {
  const i = t(locale).upcomingTimeline;

  return (
    <div>
      <div>
        <h2 className="font-semibold">{i.title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{i.subtitle}</p>
      </div>

      <div className="fancy-scrollbar relative max-h-[360px] space-y-6 overflow-y-auto pl-6 pt-6">
        <div className="absolute bottom-2 left-2 top-8 w-[2px] bg-black/10 dark:bg-white/10" />

        {events.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{i.empty}</p>
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

            <Link
              href={`/opportunities/${item.id}`}
              className="flex-1 rounded-2xl border border-black/10 bg-white/60 p-3 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-indigo-500/5 hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.35)] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{item.opportunity}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.organization}</div>
                </div>

                <div className="whitespace-nowrap rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-300">
                  {item.daysLeft} {i.daysLeft}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-indigo-600 dark:text-indigo-300">{item.phase}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{i.clickForDetails}</div>
              </div>
            </Link>
          </div>
          ))
        )}
      </div>

      <Link
        href="/calendar"
        className="mt-5 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 text-sm font-medium text-white transition hover:scale-[1.02]"
      >
        {i.openFullCalendar}
      </Link>
    </div>
  );
}
