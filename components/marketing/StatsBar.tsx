import { Users, Briefcase, Building2 } from "lucide-react";
import { t, type Locale } from "@/lib/i18n/translations";

interface StatsBarProps {
  userCount: number;
  opportunityCount: number;
  organizationCount: number;
  locale: Locale;
}

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-purple-600 shadow-sm dark:bg-white/10 dark:text-purple-300">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function StatsBar({ userCount, opportunityCount, organizationCount, locale }: StatsBarProps) {
  const i = t(locale).statsBar;
  return (
    <section className="px-6 sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-10 gap-y-6 rounded-3xl border border-black/10 bg-white/50 px-8 py-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <Stat icon={Users} value={userCount} label={i.students} />
        <Stat icon={Briefcase} value={opportunityCount} label={i.opportunities} />
        <Stat icon={Building2} value={organizationCount} label={i.organizations} />
      </div>
    </section>
  );
}
