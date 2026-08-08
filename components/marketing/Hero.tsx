import Link from "next/link";
import { ArrowRight, Compass, Users, Briefcase, Building2, ClipboardCheck, Bell, PieChart } from "lucide-react";
import { t, type Locale } from "@/lib/i18n/translations";

interface HeroProps {
  loggedIn: boolean;
  userCount: number;
  opportunityCount: number;
  organizationCount: number;
  locale: Locale;
}

function StatChip({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-black/10 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <Icon size={16} className="shrink-0 text-purple-500" />
      <div>
        <p className="text-lg font-bold leading-none">{value.toLocaleString()}</p>
        <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function Hero({ loggedIn, userCount, opportunityCount, organizationCount, locale }: HeroProps) {
  const i = t(locale).hero;

  return (
    <section className="ambient-glow px-6 pb-16 pt-16 sm:px-10 sm:pt-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* LEFT — copy */}
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500" />
            {i.badge}
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {i.titleLine1}
            <br />
            {i.titleLine2}{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              {i.titleHighlight}
            </span>
          </h1>

          <p className="mt-5 max-w-md text-base text-gray-500 dark:text-gray-400">{i.subtitle}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={loggedIn ? "/dashboard" : "/signup"}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#6D28D9]"
            >
              {loggedIn ? i.goToDashboard : i.getStarted}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/opportunities"
              className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-6 py-3 text-sm font-semibold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              <Compass size={16} /> {i.browse}
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3">
            <StatChip icon={Users} value={userCount} label={i.activeUsers} />
            <StatChip icon={Briefcase} value={opportunityCount} label={i.opportunitiesStat} />
            <StatChip icon={Building2} value={organizationCount} label={i.organizationsStat} />
          </div>
        </div>

        {/* RIGHT — illustrative dashboard preview (not a live screenshot) */}
        <div className="relative hidden lg:block">
          <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1020]/90">
            <div className="flex items-center gap-2 border-b border-black/5 px-5 py-3 dark:border-white/5">
              <img src="/logo-icon.png" alt="Forsa Go" className="h-6 w-6 rounded-lg" />
              <span className="text-xs font-semibold">Dashboard</span>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-purple-50 p-3 dark:bg-purple-500/10">
                  <ClipboardCheck size={14} className="mb-1 text-purple-500" />
                  <p className="text-sm font-bold">Applied</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-500/10">
                  <PieChart size={14} className="mb-1 text-blue-500" />
                  <p className="text-sm font-bold">In Progress</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
                  <Bell size={14} className="mb-1 text-emerald-500" />
                  <p className="text-sm font-bold">Reminders</p>
                </div>
              </div>
              <div className="rounded-xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.03]">
                <p className="mb-2 text-xs font-medium text-gray-400">Applications by Stage</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div className="h-full w-[65%] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.03]">
                <div>
                  <p className="text-xs text-gray-400">ENSAM Engineering School</p>
                  <p className="text-sm font-semibold">Written Exam stage</p>
                </div>
                <span className="rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-300">
                  Open
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
