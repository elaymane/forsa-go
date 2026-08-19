import { Search, Bookmark, TrendingUp, BellRing } from "lucide-react";
import { t, type Locale } from "@/lib/i18n/translations";

export default function Features({ locale }: { locale: Locale }) {
  const i = t(locale).features;
  const FEATURES = [
    { icon: Search, ...i.discover, tone: "text-orange-600 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-500/20" },
    { icon: Bookmark, ...i.save, tone: "text-pink-600 dark:text-pink-300", bg: "bg-pink-100 dark:bg-pink-500/20" },
    { icon: TrendingUp, ...i.track, tone: "text-indigo-600 dark:text-indigo-300", bg: "bg-indigo-100 dark:bg-indigo-500/20" },
    { icon: BellRing, ...i.neverMiss, tone: "text-emerald-600 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
  ];

  return (
    <section className="px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-500">{i.eyebrow}</p>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            {i.titleStart} <span className="text-purple-500">{i.titleHighlight}</span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">{i.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg}`}>
                  <Icon size={22} className={feature.tone} />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{feature.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
