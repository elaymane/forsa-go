"use client";

import { useState } from "react";
import { Users2, Clock, ChevronDown, Briefcase } from "lucide-react";
import type { UserTrackingStats } from "@/lib/db/analytics";

function relativeLabel(iso: string | null): string {
  if (!iso) return "Never active";
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export default function UserTrackingPanel({ users }: { users: UserTrackingStats[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B1220]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
          <Users2 size={18} />
        </div>
        <div>
          <h2 className="font-semibold">User tracking</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click a user to see exactly what they're tracking. Active = seen in the last 30 days.
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-3 text-sm">
        <span className="rounded-lg bg-emerald-100 px-3 py-1.5 font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          {activeCount} active
        </span>
        <span className="rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
          {users.length - activeCount} inactive
        </span>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No users yet.</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const isOpen = expandedId === u.id;
            const canExpand = u.trackedCount > 0;
            return (
              <div key={u.id} className="rounded-xl border border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => canExpand && setExpandedId(isOpen ? null : u.id)}
                  className={`flex w-full items-center justify-between gap-3 p-3 text-left ${
                    canExpand ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5" : "cursor-default"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{u.name}</p>
                    <p className="truncate text-xs text-gray-400">{u.email}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 text-sm">
                    <span className="font-semibold">
                      {u.trackedCount} tracked
                    </span>
                    <span className="hidden items-center gap-1 text-gray-500 dark:text-gray-400 sm:flex">
                      <Clock size={12} /> {relativeLabel(u.lastActiveAt)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                      }`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                    {canExpand && (
                      <ChevronDown size={16} className={`shrink-0 text-gray-400 transition ${isOpen ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 p-3 dark:border-white/5">
                    <div className="space-y-1.5">
                      {u.trackedOpportunities.map((o) => (
                        <div
                          key={o.id}
                          className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-white/5"
                        >
                          <Briefcase size={13} className="shrink-0 text-gray-400" />
                          <span className="truncate">{o.title}</span>
                          <span className="ml-auto shrink-0 text-xs text-gray-400">{o.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
