"use client";

import { useMemo, useState } from "react";
import { MapPin, GraduationCap, Briefcase, Globe, Calendar, Users, ChevronDown } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import type { OrganizationSummary } from "@/lib/organizations";
import type { OrganizationProfile } from "@/lib/db/organizationProfiles";
import { formatMonthYear } from "@/lib/formatting";
import OrganizationOpportunityList from "./OrganizationOpportunityList";

type Tab = "overview" | "opportunities" | "about" | "followers";

const TABS: Array<{ key: Tab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "opportunities", label: "Opportunities" },
  { key: "about", label: "About" },
  { key: "followers", label: "Followers" },
];

interface OrganizationTabsProps {
  org: OrganizationSummary;
  profile: OrganizationProfile | null;
  current: Opportunity[];
  past: Opportunity[];
  applicationsMap: Record<string, ApplicationState>;
  followerCount: number;
  guestMode?: boolean;
}

function StatChip({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-black/5 bg-black/[0.02] px-3 py-2 text-xs dark:border-white/5 dark:bg-white/[0.03]">
      <Icon size={13} className="text-purple-500" />
      <span className="text-gray-500 dark:text-gray-400">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function OrganizationTabs({
  org,
  profile,
  current,
  past,
  applicationsMap,
  followerCount,
  guestMode,
}: OrganizationTabsProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [typeOpen, setTypeOpen] = useState(false);

  const allOpportunities = useMemo(() => [...current, ...past], [current, past]);
  const filteredCurrent = useMemo(
    () => (typeFilter === "All Types" ? current : current.filter((o) => o.type === typeFilter)),
    [current, typeFilter]
  );

  return (
    <div>
      {/* TAB BAR */}
      <div className="mb-6 flex gap-6 border-b border-black/10 dark:border-white/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition ${
              tab === t.key
                ? "border-purple-500 text-purple-600 dark:text-purple-300"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {t.label}
            {t.key === "opportunities" && (
              <span className="rounded-full bg-black/5 px-1.5 text-xs dark:bg-white/10">{allOpportunities.length}</span>
            )}
            {t.key === "followers" && (
              <span className="rounded-full bg-black/5 px-1.5 text-xs dark:bg-white/10">{followerCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
            <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">Eligibility patterns</h2>
            <div className="flex flex-wrap gap-2">
              {org.levels.length > 0 && <StatChip icon={GraduationCap} label="Levels seen" value={org.levels.join(", ")} />}
              <StatChip icon={MapPin} label="Locations" value={org.locations.join(", ")} />
              <StatChip icon={Briefcase} label="Types" value={org.types.join(", ")} />
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Latest Opportunities</h2>
              {current.length > 3 && (
                <button onClick={() => setTab("opportunities")} className="text-sm text-purple-600 hover:underline dark:text-purple-400">
                  View all opportunities
                </button>
              )}
            </div>
            <OrganizationOpportunityList offers={current.slice(0, 3)} applicationsMap={applicationsMap} guestMode={guestMode} />
          </div>
        </div>
      )}

      {/* OPPORTUNITIES */}
      {tab === "opportunities" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Current opportunities ({filteredCurrent.length})</h2>
            <div className="relative">
              <button
                onClick={() => setTypeOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              >
                {typeFilter} <ChevronDown size={14} />
              </button>
              {typeOpen && (
                <div className="absolute right-0 z-10 mt-2 w-40 rounded-xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-[#0b1020]">
                  {["All Types", ...org.types].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTypeFilter(t);
                        setTypeOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <OrganizationOpportunityList offers={filteredCurrent} applicationsMap={applicationsMap} guestMode={guestMode} />

          {past.length > 0 && (
            <div className="pt-4">
              <h2 className="mb-3 font-semibold text-gray-500 dark:text-gray-400">Past opportunities ({past.length})</h2>
              <OrganizationOpportunityList offers={past} applicationsMap={applicationsMap} guestMode={guestMode} />
            </div>
          )}
        </div>
      )}

      {/* ABOUT */}
      {tab === "about" && (
        <div className="space-y-4">
          {profile?.description && (
            <div className="rounded-2xl border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm text-gray-600 dark:text-gray-300">{profile.description}</p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatChip icon={MapPin} label="Locations" value={org.locations.join(", ")} />
            {profile?.website && <StatChip icon={Globe} label="Website" value={profile.website.replace(/^https?:\/\//, "")} />}
            <StatChip icon={Calendar} label="Joined Forsa Go" value={formatMonthYear(org.joinedAt)} />
            <StatChip icon={Users} label="Followers" value={String(followerCount)} />
          </div>
        </div>
      )}

      {/* FOLLOWERS */}
      {tab === "followers" && (
        <div className="rounded-2xl border border-black/10 bg-white/60 p-8 text-center dark:border-white/10 dark:bg-white/5">
          <Users size={28} className="mx-auto mb-3 text-purple-500" />
          <p className="text-2xl font-bold">{followerCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {followerCount === 1 ? "person is" : "people are"} following {org.name}
          </p>
        </div>
      )}
    </div>
  );
}
