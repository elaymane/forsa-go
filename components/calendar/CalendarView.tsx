"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileText, Mic, Clock, MapPin, CalendarDays, Sparkles } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import OpportunityDetailModal from "@/components/opportunities/OpportunityDetailModal";
import { t, type Locale } from "@/lib/i18n/translations";

export interface CalendarEvent {
  date: string; // ISO "YYYY-MM-DD"
  offerId: string;
  title: string;
  organization: string;
  kind: "written" | "oral" | "deadline";
}

function getKindStyles(i: ReturnType<typeof t>["calendarView"]) {
  return {
    written: {
      label: i.writtenExam,
      icon: FileText,
      dot: "bg-orange-500",
      tone: "text-orange-600 dark:text-orange-300",
      bg: "bg-orange-500/10 border-orange-500/20",
    },
    oral: {
      label: i.oralExam,
      icon: Mic,
      dot: "bg-purple-500",
      tone: "text-purple-600 dark:text-purple-300",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    deadline: {
      label: i.deadline,
      icon: Clock,
      dot: "bg-red-500",
      tone: "text-red-600 dark:text-red-300",
      bg: "bg-red-500/10 border-red-500/20",
    },
  } as const;
}

function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  opportunities: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
  locale: Locale;
}

export default function CalendarView({ events, opportunities, applicationsMap, locale }: CalendarViewProps) {
  const i = t(locale).calendarView;
  const KIND_STYLES = getKindStyles(i);
  const WEEKDAYS = i.weekdays;
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detailOffer, setDetailOffer] = useState<Opportunity | null>(null);
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const opportunityById = useMemo(() => {
    const map: Record<string, Opportunity> = {};
    for (const o of opportunities) map[o.id] = o;
    return map;
  }, [opportunities]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const event of events) {
      (map[event.date] ??= []).push(event);
    }
    return map;
  }, [events]);

  const monthLabel = cursor.toLocaleDateString(dateLocale, { month: "long", year: "numeric" });

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ date: Date; iso: string; inMonth: boolean } | null> = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ date, iso: toISO(date), inMonth: true });
    }
    return cells;
  }, [cursor]);

  // Every event in the currently-viewed month, grouped by date and sorted chronologically —
  // the whole point of the right panel now, instead of only showing one selected day.
  const monthEventGroups = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const groups: Array<{ iso: string; date: Date; events: CalendarEvent[] }> = [];

    for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++) {
      const date = new Date(year, month, d);
      const iso = toISO(date);
      const dayEvents = eventsByDate[iso];
      if (dayEvents && dayEvents.length > 0) {
        groups.push({ iso, date, events: dayEvents });
      }
    }
    return groups;
  }, [cursor, eventsByDate]);

  const monthEventCount = monthEventGroups.reduce((sum, g) => sum + g.events.length, 0);

  const handleSelectDate = (iso: string) => {
    setSelectedDate(iso);
    dateRefs.current[iso]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    setSelectedDate(null);
  }, [cursor]);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* CALENDAR GRID */}
      <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white/80 to-purple-50/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:from-white/5 dark:to-purple-500/[0.03] xl:col-span-3">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/20">
              <CalendarDays size={17} />
            </div>
            <h2 className="text-lg font-bold">{monthLabel}</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              aria-label={i.previousMonth}
              className="rounded-xl border border-black/10 bg-white/60 p-2 transition hover:scale-105 hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="rounded-xl border border-black/10 bg-white/60 px-3 text-xs font-semibold transition hover:scale-105 hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              {i.today}
            </button>
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              aria-label={i.nextMonth}
              className="rounded-xl border border-black/10 bg-white/60 p-2 transition hover:scale-105 hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-gray-400">
          {WEEKDAYS.map((d) => (
            <div key={d} className="pb-3">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />;
            const dayEvents = eventsByDate[cell.iso] ?? [];
            const isToday = cell.iso === toISO(today);
            const isSelected = cell.iso === selectedDate;

            return (
              <button
                key={cell.iso}
                onClick={() => handleSelectDate(cell.iso)}
                className={`relative flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border text-sm transition-all ${
                  isSelected
                    ? "border-purple-400 bg-purple-500 font-bold text-white shadow-lg shadow-purple-500/30 scale-105"
                    : isToday
                    ? "border-indigo-300 bg-indigo-500/10 font-semibold text-indigo-600 dark:text-indigo-300"
                    : dayEvents.length > 0
                    ? "border-black/5 bg-white/70 hover:scale-105 hover:border-purple-200 dark:border-white/5 dark:bg-white/[0.04]"
                    : "border-transparent text-gray-600 hover:bg-black/[0.03] dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                <span>{cell.date.getDate()}</span>
                {dayEvents.length > 0 && (
                  <span className="flex gap-0.5">
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : KIND_STYLES[e.kind].dot}`}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* LEGEND */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-black/5 pt-4 dark:border-white/5">
          {Object.values(KIND_STYLES).map((style) => (
            <div key={style.label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className={`h-2 w-2 rounded-full ${style.dot}`} />
              {style.label}
            </div>
          ))}
        </div>
      </div>

      {/* ALL EVENTS THIS MONTH */}
      <div className="flex flex-col rounded-3xl border border-black/10 bg-white/60 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 xl:col-span-2 xl:max-h-[640px]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">{i.thisMonth}</h3>
          <span className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-300">
            <Sparkles size={11} /> {monthEventCount} {monthEventCount === 1 ? i.eventSingular : i.eventPlural}
          </span>
        </div>

        {monthEventGroups.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <CalendarDays size={28} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{i.nothingScheduled}</p>
          </div>
        ) : (
          <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto pr-1">
            {monthEventGroups.map((group) => {
              const isToday = group.iso === toISO(today);
              return (
                <div key={group.iso} ref={(el) => { dateRefs.current[group.iso] = el; }}>
                  <div
                    className={`mb-2 flex items-center gap-2 text-xs font-semibold ${
                      isToday ? "text-purple-600 dark:text-purple-300" : "text-gray-400"
                    }`}
                  >
                    {group.date.toLocaleDateString(dateLocale, { weekday: "short", month: "short", day: "numeric" })}
                    {isToday && <span className="rounded-full bg-purple-500/10 px-2 py-0.5">{i.today}</span>}
                  </div>
                  <div className="space-y-2">
                    {group.events.map((event, idx) => {
                      const style = KIND_STYLES[event.kind];
                      const Icon = style.icon;
                      const offer = opportunityById[event.offerId];
                      return (
                        <button
                          key={`${event.offerId}-${idx}`}
                          onClick={() => offer && setDetailOffer(offer)}
                          disabled={!offer}
                          className={`flex w-full items-center gap-2.5 rounded-2xl border p-3 text-left transition hover:scale-[1.01] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${style.bg}`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-black/20 ${style.tone}`}>
                            <Icon size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-[11px] font-semibold ${style.tone}`}>{style.label}</div>
                            <p className="truncate text-sm font-semibold">{event.title}</p>
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <MapPin size={10} /> {event.organization}
                            </div>
                          </div>
                          <ChevronRight size={14} className="shrink-0 text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
