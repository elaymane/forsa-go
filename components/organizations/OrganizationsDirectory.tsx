"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, MapPin, ChevronDown, ChevronRight, Building2, Briefcase, Zap, Clock, Bookmark, BadgeCheck, Plus } from "lucide-react";
import type { OrganizationSummary } from "@/lib/organizations";
import type { OrganizationProfile } from "@/lib/db/organizationProfiles";
import { relativeTime } from "@/lib/formatting";
import { followOrganizationAction, unfollowOrganizationAction } from "@/app/actions";
import { t, type Locale } from "@/lib/i18n/translations";

type SortOption = "Newest" | "Most opportunities" | "Name A-Z";
const SORT_OPTIONS: SortOption[] = ["Newest", "Most opportunities", "Name A-Z"];

interface OrganizationsDirectoryProps {
  organizations: OrganizationSummary[];
  profiles: Record<string, OrganizationProfile>;
  followedSlugs: string[];
  isLoggedIn: boolean;
  locale: Locale;
  stats: { totalOrganizations: number; openOpportunities: number; newToday: number };
}

function StatCard({
  icon: Icon,
  iconClass,
  value,
  label,
  sublabel,
}: {
  icon: typeof Building2;
  iconClass: string;
  value: number;
  label: string;
  sublabel: string;
}) {
  return (
    <div className="group rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur-xl transition hover:border-purple-300/60 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-purple-500/40">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-110 ${iconClass}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold leading-tight">{value.toLocaleString()}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{sublabel}</p>
        </div>
      </div>
    </div>
  );
}

function FollowToggle({
  slug,
  name,
  following: initiallyFollowing,
  isLoggedIn,
  labels,
}: {
  slug: string;
  name: string;
  following: boolean;
  isLoggedIn: boolean;
  labels: { follow: string; following: string };
}) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Link
        href="/signup?next=/organizations"
        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.03] hover:shadow-purple-500/30"
      >
        {labels.follow} <Plus size={14} className="rounded-full bg-white/20 p-0.5" />
      </Link>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        const next = !following;
        setFollowing(next);
        startTransition(async () => {
          if (next) await followOrganizationAction(slug, name);
          else await unfollowOrganizationAction(slug);
        });
      }}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
        following
          ? "border border-black/10 bg-white text-gray-700 hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.03] hover:shadow-purple-500/30"
      }`}
    >
      {following ? labels.following : labels.follow}
      {!following && <Plus size={14} className="rounded-full bg-white/20 p-0.5" />}
    </button>
  );
}

export default function OrganizationsDirectory({
  organizations,
  profiles,
  followedSlugs,
  isLoggedIn,
  locale,
  stats,
}: OrganizationsDirectoryProps) {
  const i = t(locale).organizationsDirectory;
  const typeLabels = t(locale).typeLabels;
  const sortLabels: Record<SortOption, string> = {
    Newest: i.sortNewest,
    "Most opportunities": i.sortMostOpportunities,
    "Name A-Z": i.sortNameAZ,
  };
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("Newest");
  const [sortOpen, setSortOpen] = useState(false);
  const followedSet = useMemo(() => new Set(followedSlugs), [followedSlugs]);

  const visible = useMemo(() => {
    let list = organizations.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()));

    list = [...list].sort((a, b) => {
      if (sort === "Most opportunities") return b.total - a.total;
      if (sort === "Name A-Z") return a.name.localeCompare(b.name);
      return b.lastUpdatedAt.localeCompare(a.lastUpdatedAt); // Newest
    });

    return list;
  }, [organizations, query, sort]);

  return (
    <div className="space-y-6">
      {/* 3 REAL STAT CARDS — no charts, no fabricated numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Building2}
          iconClass="bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300"
          value={stats.totalOrganizations}
          label={i.totalOrganizations}
          sublabel={i.allOrganizationsCombined}
        />
        <StatCard
          icon={Briefcase}
          iconClass="bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
          value={stats.openOpportunities}
          label={i.openOpportunities}
          sublabel={i.availableNow}
        />
        <StatCard
          icon={Zap}
          iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
          value={stats.newToday}
          label={i.newToday}
          sublabel={i.addedToday}
        />
      </div>

      {/* SEARCH + SORT */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={i.searchPlaceholder}
            className="w-full rounded-2xl border border-black/10 bg-white/60 py-3 pl-11 pr-4 text-sm outline-none backdrop-blur-xl transition focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-purple-500/50"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm backdrop-blur-xl transition hover:border-purple-300/60 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-purple-500/40"
          >
            {sortLabels[sort]} <ChevronDown size={14} className={`transition ${sortOpen ? "rotate-180" : ""}`} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-2xl border border-black/10 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#0b1020]">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSort(s);
                    setSortOpen(false);
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {sortLabels[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ORGANIZATION LIST */}
      <div>
        <h2 className="mb-3 text-lg font-bold">{i.allOrganizations}</h2>

        {visible.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {i.noMatch} "{query}".
          </p>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02]">
            {visible.map((org, idx) => {
              const profile = profiles[org.slug];
              const isFollowing = followedSet.has(org.slug);
              const tag = org.primaryType ? typeLabels[org.primaryType as keyof typeof typeLabels] : null;

              return (
                <Link
                  key={org.slug}
                  href={`/organizations/${org.slug}`}
                  className={`group flex flex-col gap-4 p-5 transition hover:bg-purple-50/40 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-purple-500/[0.04] ${
                    idx > 0 ? "border-t border-black/5 dark:border-white/5" : ""
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <img
                      src={profile?.logo || org.image}
                      alt={`Logo ${org.name}`}
                      loading="lazy"
                      decoding="async"
                      className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-black/5 transition group-hover:ring-purple-300/60 dark:ring-white/10"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-semibold">{org.name}</p>
                        {profile && <BadgeCheck size={15} className="shrink-0 text-purple-500" />}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {tag && (
                          <span className="rounded-md bg-black/5 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                            {tag}
                          </span>
                        )}
                        {profile?.description ? (
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{profile.description}</p>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin size={11} /> {org.locations.slice(0, 2).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-5">
                    <div className="text-center">
                      <p className="text-lg font-bold leading-none text-emerald-600 dark:text-emerald-400">{org.open}</p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {i.open}
                        {org.open === 1 ? "" : "s"}
                      </p>
                    </div>
                    <p className="hidden items-center gap-1 text-xs text-gray-400 sm:flex">
                      <Clock size={11} /> {relativeTime(org.lastUpdatedAt)}
                    </p>
                    <Bookmark
                      size={16}
                      className={`hidden transition sm:block ${
                        isFollowing ? "fill-purple-400 text-purple-400" : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                    <FollowToggle
                      slug={org.slug}
                      name={org.name}
                      following={isFollowing}
                      isLoggedIn={isLoggedIn}
                      labels={{ follow: i.follow, following: i.following }}
                    />
                    <ChevronRight size={16} className="hidden text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-purple-500 sm:block dark:text-gray-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
