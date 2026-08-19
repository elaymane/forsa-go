"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Crown, CheckCircle2, XCircle, User as UserIcon } from "lucide-react";
import type { UserAccountSummary } from "@/lib/db/auth";
import { activateSubscriptionAction, deactivateSubscriptionAction } from "@/app/admin/actions";
import { hasUnlimitedTracking } from "@/lib/subscription";

/**
 * "Founding member" is a historical badge (were they one of the first 100?),
 * not an access level — their free months expire exactly like a paid
 * subscription does, tracked the same way. Status shown here always
 * reflects real, current access, never just the founding-member flag.
 */
function statusFor(user: UserAccountSummary) {
  if (hasUnlimitedTracking(user)) return { label: "Active", tone: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" };
  return { label: "Free", tone: "bg-black/5 text-gray-500 dark:bg-white/10 dark:text-gray-400" };
}

export default function UsersManager({ users }: { users: UserAccountSummary[] }) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <div className="space-y-4">
      <div className="relative sm:w-80">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-xl border border-black/10 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/5">
        {visible.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">No users match "{query}".</p>
        ) : (
          visible.map((user, i) => {
            const status = statusFor(user);
            const isActive = hasUnlimitedTracking(user);

            return (
              <div
                key={user.id}
                className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${
                  i > 0 ? "border-t border-black/5 dark:border-white/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-gray-500 dark:bg-white/10 dark:text-gray-400">
                    <UserIcon size={16} />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {user.isFoundingMember && (
                    <span
                      title="One of the first 100 signups"
                      className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                    >
                      <Crown size={11} /> Founding
                    </span>
                  )}
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.tone}`}>{status.label}</span>
                  {isActive && user.subscriptionActiveUntil && (
                    <span className="text-xs text-gray-400">
                      until{" "}
                      {new Date(user.subscriptionActiveUntil).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}

                  <button
                    onClick={() => startTransition(async () => { await activateSubscriptionAction(user.id); })}
                    disabled={isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:scale-105 disabled:opacity-60"
                  >
                    <CheckCircle2 size={13} /> +1 month
                  </button>
                  {isActive && (
                    <button
                      onClick={() => startTransition(async () => { await deactivateSubscriptionAction(user.id); })}
                      disabled={isPending}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-500/30 dark:hover:bg-red-500/10"
                    >
                      <XCircle size={13} /> Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
