"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Target,
  Flame,
  TrendingUp,
  Activity,
  BarChart3,
  Users,
  Send,
  type LucideIcon,
} from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import StageOffersModal from "@/components/opportunities/StageOffersModal";

interface DashboardHeroProps {
  opportunities: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
  userName: string;
}

export default function DashboardHero({ opportunities, applicationsMap, userName }: DashboardHeroProps) {
  const [showApplied, setShowApplied] = useState(false);
  const firstName = userName.split(" ")[0];
  const openCount = opportunities.filter((o) => o.status === "open").length;

  const appliedOffers = opportunities.filter((o) => applicationsMap[o.id]?.stage != null);
  const appliedCount = appliedOffers.length;
  const progressPct = opportunities.length
    ? Math.min(100, Math.round((appliedCount / opportunities.length) * 100))
    : 0;

  return (
    <div className="ambient-glow px-6 py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-12 md:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-black/10 bg-white/60 p-7 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
          >
            <div className="mb-6 flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs tracking-wide text-indigo-500 dark:text-indigo-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.7)]" />
                  <span className="font-medium">Intelligent Dashboard</span>
                </div>

                <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  Good evening,{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      {firstName}
                    </span>
                    <span className="absolute -bottom-1 left-0 h-2 w-full rounded-full bg-indigo-500/20 blur-lg" />
                  </span>
                </h1>

                <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  Opportunities don&apos;t wait — make today count and stay ahead of every deadline.
                </p>
              </div>

              <div className="hidden shrink-0 sm:block">
                <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/60 px-6 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10" />
                  <div className="relative flex flex-col items-end">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Open opportunities
                    </p>
                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-4xl font-bold tracking-tight">{openCount}</span>
                      <span className="mb-1 text-xs font-medium text-emerald-500 dark:text-emerald-400">
                        live now
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Updated in real time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-blue-500/10" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-6">
                  <StatusPill icon={Target} tone="text-emerald-500 dark:text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" label="Status" value="Focused" />
                  <div className="hidden h-8 w-px bg-black/10 dark:bg-white/10 sm:block" />
                  <StatusPill icon={Flame} tone="text-orange-500 dark:text-orange-400" bg="bg-orange-500/10 border-orange-500/20" label="Energy" value="High Motivation" />
                  <div className="hidden h-8 w-px bg-black/10 dark:bg-white/10 sm:block" />
                  <StatusPill icon={TrendingUp} tone="text-blue-500 dark:text-blue-400" bg="bg-blue-500/10 border-blue-500/20" label="Progress" value="On Track" />
                </div>

                <div className="flex items-center gap-2 self-start rounded-xl border border-black/10 bg-black/5 px-3 py-2 dark:border-white/10 dark:bg-black/30">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <p className="text-xs text-gray-600 dark:text-gray-300">{firstName} OS Active</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="col-span-12 space-y-4 md:col-span-5">
          <div
            className="cursor-pointer rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
            onClick={() => setShowApplied(true)}
            role="button"
            aria-label="View applications"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Live Performance</p>
                <h2 className="mt-1 text-2xl font-semibold">{appliedCount} Applications</h2>
              </div>
              <ArrowUpRight className="text-gray-400 dark:text-white/60" />
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
              {appliedCount === 0
                ? "Apply to your first opportunity to start tracking progress."
                : `${progressPct}% of tracked opportunities are in motion.`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <MiniStat icon={Activity} tone="text-indigo-500 dark:text-indigo-400" label="Open" value={String(openCount)} />
            <MiniStat icon={Users} tone="text-blue-500 dark:text-blue-400" label="Applied" value={String(appliedCount)} />
            <MiniStat icon={BarChart3} tone="text-purple-500 dark:text-purple-400" label="Progress" value={`${progressPct}%`} />
          </div>
        </div>
      </div>

      {showApplied && (
        <StageOffersModal
          title="Your Applications"
          subtitle={`${appliedCount} opportunit${appliedCount === 1 ? "y" : "ies"} you've applied to`}
          offers={appliedOffers}
          applicationsMap={applicationsMap}
          icon={Send}
          onClose={() => setShowApplied(false)}
        />
      )}
    </div>
  );
}

function StatusPill({
  icon: Icon,
  tone,
  bg,
  label,
  value,
}: {
  icon: LucideIcon;
  tone: string;
  bg: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`rounded-xl border p-2 ${bg}`}>
        <Icon size={18} className={tone} />
      </div>
      <div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: LucideIcon;
  tone: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
      <Icon size={16} className={tone} />
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
