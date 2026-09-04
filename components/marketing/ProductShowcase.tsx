import { Search, Send, Calendar, Bell, MapPin, Clock } from "lucide-react";
import { t, type Locale } from "@/lib/i18n/translations";

function BrowseMock({ locale }: { locale: Locale }) {
  const m = t(locale).showcaseMocks;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2 dark:border-white/10 dark:bg-white/5">
        <Search size={13} className="text-gray-400" />
        <span className="text-xs text-gray-400">{m.searchPlaceholder}</span>
      </div>
      {[
        { name: m.engineeringSchool, tag: m.concours, tone: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300" },
        { name: m.trainingOrg, tag: m.training, tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" },
      ].map((row) => (
        <div key={row.name} className="flex items-center justify-between rounded-lg border border-black/5 bg-white/60 px-3 py-2 dark:border-white/5 dark:bg-white/[0.03]">
          <span className="text-xs font-medium">{row.name}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${row.tone}`}>{row.tag}</span>
        </div>
      ))}
    </div>
  );
}

function TrackMock({ locale }: { locale: Locale }) {
  const m = t(locale).showcaseMocks;
  const stages = [m.stageApplied, m.stageWritten, m.stageOral, m.stageAccepted];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        {stages.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-1">
            <div className={`h-1.5 flex-1 rounded-full ${i < 2 ? "bg-purple-500" : "bg-black/10 dark:bg-white/10"}`} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-gray-400">
        {stages.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 dark:border-purple-500/20 dark:bg-purple-500/10">
        <Send size={13} className="text-purple-500" />
        <span className="text-xs font-medium text-purple-700 dark:text-purple-300">{m.writtenExamStage}</span>
      </div>
    </div>
  );
}

function CalendarMock({ locale: _locale }: { locale: Locale }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 21 }, (_, i) => {
        const marked = [4, 11, 16].includes(i);
        const tone = i === 4 ? "bg-amber-400" : i === 11 ? "bg-purple-400" : "bg-red-400";
        return (
          <div
            key={i}
            className={`flex h-6 items-center justify-center rounded text-[9px] ${
              marked ? `${tone} text-white font-semibold` : "bg-black/[0.03] text-gray-400 dark:bg-white/5"
            }`}
          >
            {i + 1}
          </div>
        );
      })}
    </div>
  );
}

function NotifyMock({ locale }: { locale: Locale }) {
  const m = t(locale).showcaseMocks;
  return (
    <div className="space-y-2">
      {[
        { icon: Bell, text: m.writtenExamIn5Days, tone: "text-amber-500" },
        { icon: Clock, text: m.deadlineIn3Days, tone: "text-red-500" },
        { icon: MapPin, text: m.newOpportunityFrom, tone: "text-purple-500" },
      ].map((n) => {
        const Icon = n.icon;
        return (
          <div key={n.text} className="flex items-center gap-2 rounded-lg border border-black/5 bg-white/60 px-3 py-2 dark:border-white/5 dark:bg-white/[0.03]">
            <Icon size={13} className={n.tone} />
            <span className="text-[11px]">{n.text}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProductShowcase({ locale }: { locale: Locale }) {
  const i = t(locale).showcase;
  const PANELS = [
    { ...i.browse, Mock: BrowseMock },
    { ...i.track, Mock: TrackMock },
    { ...i.calendar, Mock: CalendarMock },
    { ...i.notify, Mock: NotifyMock },
  ];

  return (
    <section className="px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-500">{i.eyebrow}</p>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{i.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PANELS.map((panel) => (
            <div
              key={panel.title}
              className="overflow-hidden rounded-2xl border border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/5"
            >
              <div className="border-b border-black/5 p-5 dark:border-white/5">
                <panel.Mock locale={locale} />
              </div>
              <div className="p-4">
                <p className="font-semibold">{panel.title}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{panel.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
