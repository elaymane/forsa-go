import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Send, FileText, Mic, CheckCircle2, Sparkles } from "lucide-react";
import { t, type Locale } from "@/lib/i18n/translations";

const STAGE_ICONS = [Send, FileText, Mic, CheckCircle2];

export default function PublicShell({
  children,
  title,
  subtitle,
  locale,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  locale: Locale;
}) {
  const nav = t(locale).nav;
  const journey = t(locale).journey;
  const stages = [journey.applied, journey.written, journey.oral, journey.accepted];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8FAFC] dark:bg-[#020617]">
      <nav className="flex flex-col gap-4 border-b border-black/10 px-6 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo-icon.png" alt="Forsa Go" width={36} height={36} className="h-9 w-9 rounded-xl" />
            <span className="font-display font-semibold">Forsa Go</span>
          </Link>
          <div className="hidden items-center gap-6 sm:flex">
            <Link href="/opportunities" className="text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              {nav.opportunities}
            </Link>
            <Link href="/organizations" className="text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              {nav.organizations}
            </Link>
            <Link href="/#journey" className="text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              {nav.howItWorks}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            {nav.login}
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
          >
            {nav.signup} <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Compact "how it works" strip — every guest sees this, not just people who start on the homepage */}
      <div className="border-b border-purple-200/50 bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 dark:border-purple-500/10 dark:from-purple-500/[0.06] dark:to-indigo-500/[0.06] sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {stages.map((stage, i) => {
            const Icon = STAGE_ICONS[i];
            return (
              <div key={stage.label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                  <Icon size={13} /> {stage.label}
                </div>
                {i < stages.length - 1 && <ArrowRight size={11} className="text-purple-300 dark:text-purple-600" />}
              </div>
            );
          })}
          <Link
            href="/signup"
            className="ml-2 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-purple-600 shadow-sm transition hover:scale-105 dark:bg-white/10 dark:text-purple-300"
          >
            <Sparkles size={11} /> {nav.signup}
          </Link>
        </div>
      </div>

      <div className="px-6 py-8 sm:px-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
