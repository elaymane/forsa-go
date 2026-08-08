"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, MapPin, ChevronDown } from "lucide-react";
import type { OrganizationSummary } from "@/lib/organizations";
import type { OrganizationProfile } from "@/lib/db/organizationProfiles";
import { relativeTime } from "@/lib/formatting";
import { followOrganizationAction, unfollowOrganizationAction } from "@/app/actions";

type SortOption = "Newest" | "Most opportunities" | "Name A-Z";
const SORT_OPTIONS: SortOption[] = ["Newest", "Most opportunities", "Name A-Z"];

interface OrganizationsDirectoryProps {
  organizations: OrganizationSummary[];
  profiles: Record<string, OrganizationProfile>;
  followedSlugs: string[];
  isLoggedIn: boolean;
}

function FollowToggle({
  slug,
  name,
  following: initiallyFollowing,
  isLoggedIn,
}: {
  slug: string;
  name: string;
  following: boolean;
  isLoggedIn: boolean;
}) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Link
        href="/signup?next=/organizations"
        className="rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
      >
        Follow
      </Link>
    );
  }

  return (
    <button
      onClick={() => {
        const next = !following;
        setFollowing(next);
        startTransition(async () => {
          if (next) await followOrganizationAction(slug, name);
          else await unfollowOrganizationAction(slug);
        });
      }}
      disabled={isPending}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
        following
          ? "border border-black/10 bg-white text-gray-700 hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          : "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}

export default function OrganizationsDirectory({
  organizations,
  profiles,
  followedSlugs,
  isLoggedIn,
}: OrganizationsDirectoryProps) {
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
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organizations..."
            className="w-full rounded-xl border border-black/10 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
          >
            {sort}
            <ChevronDown size={14} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 z-10 mt-2 w-44 rounded-xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-[#0b1020]">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSort(s);
                    setSortOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No organizations match "{query}".</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/5">
          {visible.map((org, i) => {
            const profile = profiles[org.slug];
            return (
              <div
                key={org.slug}
                className={`flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between ${
                  i > 0 ? "border-t border-black/5 dark:border-white/5" : ""
                }`}
              >
                <Link href={`/organizations/${org.slug}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <img src={profile?.logo || org.image} alt={org.name} loading="lazy" decoding="async" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{org.name}</p>
                    {profile?.description ? (
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">{profile.description}</p>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin size={11} /> {org.locations.slice(0, 2).join(", ")}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex shrink-0 items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">{org.open}</p>
                    <p className="text-[11px] text-gray-400">open now</p>
                  </div>
                  <p className="hidden text-xs text-gray-400 sm:block">{relativeTime(org.lastUpdatedAt)}</p>
                  <FollowToggle slug={org.slug} name={org.name} following={followedSet.has(org.slug)} isLoggedIn={isLoggedIn} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
