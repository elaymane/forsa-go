import { Sparkles, Award, Briefcase, GraduationCap, Wallet, ArrowRight, Search, Bell } from "lucide-react";
import Link from "next/link";
import type { Opportunity } from "@/types/opportunity";
import { t, type Locale } from "@/lib/i18n/translations";

export default function AboutSection({ opportunities, locale }: { opportunities: Opportunity[]; locale: Locale }) {
  const i = t(locale).aboutSection;
  const typeLabels = t(locale).typeLabels;

  // Real counts per type — never fabricated, computed from the same data
  // driving every other number on this page.
  const countOf = (type: Opportunity["type"]) => opportunities.filter((o) => o.type === type).length;

  const cards = [
    {
      icon: Award,
      title: typeLabels.Concours,
      count: countOf("Concours"),
      href: "/concours",
      tone: "purple",
    },
    {
      icon: Briefcase,
      title: `${typeLabels.Job} & ${typeLabels.Internship}`,
      count: countOf("Job") + countOf("Internship"),
      href: "/jobs",
      tone: "red",
    },
    {
      icon: GraduationCap,
      title: typeLabels.Training,
      count: countOf("Training"),
      href: "/trainings",
      tone: "blue",
    },
    {
      icon: Wallet,
      title: typeLabels.Scholarship,
      count: countOf("Scholarship"),
      href: "/scholarships",
      tone: "emerald",
    },
  ];

  const toneClasses: Record<string, { bg: string; icon: string; link: string }> = {
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-white dark:from-purple-500/10 dark:to-white/[0.02]",
      icon: "bg-gradient-to-br from-purple-500 to-indigo-500 text-white",
      link: "text-purple-600 dark:text-purple-400",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-white dark:from-red-500/10 dark:to-white/[0.02]",
      icon: "bg-gradient-to-br from-red-500 to-orange-500 text-white",
      link: "text-red-600 dark:text-red-400",
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-white dark:from-blue-500/10 dark:to-white/[0.02]",
      icon: "bg-gradient-to-br from-blue-500 to-cyan-500 text-white",
      link: "text-blue-600 dark:text-blue-400",
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/10 dark:to-white/[0.02]",
      icon: "bg-gradient-to-br from-emerald-500 to-teal-500 text-white",
      link: "text-emerald-600 dark:text-emerald-400",
    },
  };

  return (
    <section className="px-6 py-16 sm:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        {/* LEFT — intro copy + illustrated dashboard mockup */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-purple-500">
            <Sparkles size={13} /> {i.title}
          </p>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            {i.introHighlight1}{" "}
            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              {opportunities.length}
            </span>{" "}
            {i.introHighlight2}
          </h2>

          {/* Illustrated mockup — decorative preview, not a real live embed, same
              spirit as the ProductShowcase mockup already used elsewhere on this page. */}
          <div className="relative mt-10 max-w-md">
            <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1020]/90">
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-black/5 bg-black/[0.03] px-3 py-2 text-xs text-gray-400 dark:border-white/5 dark:bg-white/5">
                <Search size={13} /> {i.mockSearchPlaceholder}
              </div>
              <div className="space-y-2">
                {[
                  { name: i.mockItem1, days: 3 },
                  { name: i.mockItem2, days: 8 },
                  { name: i.mockItem3, days: 15 },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between rounded-xl border border-black/5 bg-black/[0.02] px-3 py-2.5 dark:border-white/5 dark:bg-white/[0.03]"
                  >
                    <span className="text-sm font-medium">{row.name}</span>
                    <span className="text-xs text-purple-500">
                      {row.days} {i.mockDaysLeft}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -right-4 -top-4 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
                1
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — real per-type counts, one colored card each */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;
            const tone = toneClasses[card.tone];
            return (
              <Link
                key={card.title}
                href={card.href}
                className={`rounded-2xl border border-black/10 p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 ${tone.bg}`}
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tone.icon}`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-bold">{card.count}</p>
                <h3 className="mt-0.5 text-sm font-semibold text-gray-700 dark:text-gray-200">{card.title}</h3>
                <span className={`mt-3 flex items-center gap-1 text-xs font-medium ${tone.link}`}>
                  {i.explore} <ArrowRight size={12} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
