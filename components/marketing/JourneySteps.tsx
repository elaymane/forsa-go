import { Send, FileText, Mic, CheckCircle2 } from "lucide-react";
import { t, type Locale } from "@/lib/i18n/translations";

export default function JourneySteps({ locale }: { locale: Locale }) {
  const i = t(locale).journey;
  const STEPS = [
    { icon: Send, ...i.applied, tone: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300" },
    { icon: FileText, ...i.written, tone: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300" },
    { icon: Mic, ...i.oral, tone: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300" },
    { icon: CheckCircle2, ...i.accepted, tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300" },
  ];

  return (
    <section id="journey" className="px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-500">{i.eyebrow}</p>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{i.title}</h2>

        <div className="relative mt-12 grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:gap-y-0">
          <div className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-black/10 dark:border-white/10 sm:block" />
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="relative flex flex-col items-center gap-3 px-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${step.tone}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold">{step.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{step.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
