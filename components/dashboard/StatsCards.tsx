"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, FileText, Mic, Bookmark, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import StageOffersModal from "@/components/opportunities/StageOffersModal";

type StatKey = "applied" | "inProgress" | "written" | "oral" | "saved" | "accepted";

interface StatConfig {
  key: StatKey;
  title: string;
  note: string;
  icon: LucideIcon;
  bg: string;
  iconColor: string;
  iconBg: string;
  glow: string;
  match: (offer: Opportunity, state: ApplicationState | undefined) => boolean;
}

const STAT_CONFIG: StatConfig[] = [
  {
    key: "applied",
    title: "Applied",
    note: "Total applications submitted",
    icon: CheckCircle2,
    bg: "bg-green-50 dark:bg-green-500/10",
    iconColor: "text-green-600 dark:text-green-300",
    iconBg: "bg-green-100 dark:bg-green-500/20",
    glow: "hover:shadow-green-500/25",
    match: (_offer, state) =>
      state?.stage === "applied" || state?.stage === "written" || state?.stage === "oral" || state?.stage === "accepted",
  },
  {
    key: "inProgress",
    title: "In Progress",
    note: "Applied, written or oral",
    icon: Clock3,
    bg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-300",
    iconBg: "bg-blue-100 dark:bg-blue-500/20",
    glow: "hover:shadow-blue-500/25",
    match: (_offer, state) => state?.stage === "applied" || state?.stage === "written" || state?.stage === "oral",
  },
  {
    key: "written",
    title: "Written Exam",
    note: "Preparing or done",
    icon: FileText,
    bg: "bg-orange-50 dark:bg-orange-500/10",
    iconColor: "text-orange-600 dark:text-orange-300",
    iconBg: "bg-orange-100 dark:bg-orange-500/20",
    glow: "hover:shadow-orange-500/25",
    match: (_offer, state) => state?.stage === "written",
  },
  {
    key: "oral",
    title: "Oral Exam",
    note: "Next interviews",
    icon: Mic,
    bg: "bg-purple-50 dark:bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-300",
    iconBg: "bg-purple-100 dark:bg-purple-500/20",
    glow: "hover:shadow-purple-500/25",
    match: (_offer, state) => state?.stage === "oral",
  },
  {
    key: "saved",
    title: "Saved",
    note: "Bookmarked for later",
    icon: Bookmark,
    bg: "bg-yellow-50 dark:bg-yellow-500/10",
    iconColor: "text-yellow-600 dark:text-yellow-300",
    iconBg: "bg-yellow-100 dark:bg-yellow-500/20",
    glow: "hover:shadow-yellow-500/25",
    match: (_offer, state) => Boolean(state?.saved),
  },
  {
    key: "accepted",
    title: "Accepted",
    note: "Congratulations 🎉",
    icon: Trophy,
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-300",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    glow: "hover:shadow-emerald-500/25",
    match: (_offer, state) => state?.stage === "accepted",
  },
];

interface StatsCardsProps {
  opportunities: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
}

export default function StatsCards({ opportunities, applicationsMap }: StatsCardsProps) {
  const [openKey, setOpenKey] = useState<StatKey | null>(null);

  const listFor = (stat: StatConfig) =>
    opportunities.filter((offer) => stat.match(offer, applicationsMap[offer.id]));

  const openStat = STAT_CONFIG.find((s) => s.key === openKey);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-6">
        {STAT_CONFIG.map((stat) => {
          const Icon = stat.icon;
          const count = listFor(stat).length;

          return (
            <button
              key={stat.key}
              onClick={() => setOpenKey(stat.key)}
              className={`group flex items-center gap-5 rounded-2xl border border-gray-200 px-6 py-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 ${stat.bg} ${stat.glow}`}
            >
              <div
                className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl transition group-hover:scale-110 ${stat.iconBg}`}
              >
                <Icon size={28} className={stat.iconColor} />
              </div>

              <div className="flex min-w-0 flex-col">
                <p className="truncate text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{count}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.note}</p>
              </div>
            </button>
          );
        })}
      </div>

      {openStat && (
        <StageOffersModal
          title={openStat.title}
          subtitle={openStat.note}
          offers={listFor(openStat)}
          applicationsMap={applicationsMap}
          icon={openStat.icon}
          onClose={() => setOpenKey(null)}
        />
      )}
    </>
  );
}
