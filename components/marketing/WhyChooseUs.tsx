import { ShieldCheck, Zap, Target, Crown, Smartphone } from "lucide-react";
import { t, type Locale } from "@/lib/i18n/translations";

export default function WhyChooseUs({ locale }: { locale: Locale }) {
  const i = t(locale).whyChooseUs;
  const REASONS = [
    { icon: ShieldCheck, ...i.secure },
    { icon: Zap, ...i.realtime },
    { icon: Target, ...i.match },
    { icon: Crown, ...i.builtFor },
    { icon: Smartphone, ...i.everywhere },
  ];

  return (
    <section className="px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-500">{i.eyebrow}</p>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{i.title}</h2>

        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {REASONS.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{r.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{r.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
