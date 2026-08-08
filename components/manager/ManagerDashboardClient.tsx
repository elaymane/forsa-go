"use client";

import { useState, useTransition } from "react";
import { Copy, Check, Users, TrendingUp, Trophy, Send, LogIn, Loader2 } from "lucide-react";
import type { ManagerStatus } from "@/lib/db/managers";
import type { LinkedAccountWithStats } from "@/lib/db/managers";
import { MANAGER_TIER_LABELS, MANAGER_TIER_LIMITS } from "@/lib/managerTiers";
import { switchToAccountAction } from "@/app/actions";

export default function ManagerDashboardClient({
  status,
  linkedAccounts,
}: {
  status: ManagerStatus;
  linkedAccounts: LinkedAccountWithStats[];
}) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const limit = status.tier ? MANAGER_TIER_LIMITS[status.tier] : null;

  const handleCopy = () => {
    if (!status.code) return;
    navigator.clipboard.writeText(status.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitch = (accountId: string) => {
    setError(null);
    setSwitchingId(accountId);
    startTransition(async () => {
      const result = await switchToAccountAction(accountId);
      if (result?.error) {
        setError(result.error);
        setSwitchingId(null);
      }
      // On success, switchToAccountAction redirects — no further state update needed here.
    });
  };

  return (
    <div className="space-y-6">
      {/* TIER + CODE CARD */}
      <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 dark:border-purple-500/20 dark:from-purple-500/10 dark:to-indigo-500/10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">
              {status.tier ? MANAGER_TIER_LABELS[status.tier] : "Manager"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {linkedAccounts.length} linked{limit !== null ? ` / ${limit} max` : " (unlimited)"}
            </p>
          </div>
        </div>

        {status.code && (
          <div>
            <p className="mb-1.5 text-xs text-gray-500 dark:text-gray-400">
              Share this code — anyone who enters it during signup links their account to you.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 font-mono text-lg font-bold tracking-widest dark:border-white/10 dark:bg-black/20">
                {status.code}
              </code>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-600"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LINKED ACCOUNTS */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 font-bold">
          <Users size={18} /> Linked accounts
        </h2>

        {error && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        {linkedAccounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 p-8 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
            Nobody has linked their account with your code yet.
          </div>
        ) : (
          <div className="space-y-2">
            {linkedAccounts.map((account) => (
              <div
                key={account.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/70 p-4 dark:border-white/5 dark:bg-white/5"
              >
                <div>
                  <p className="font-semibold">{account.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{account.email}</p>
                </div>
                <div className="flex w-full flex-wrap items-center gap-3 text-sm sm:w-auto">
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <TrendingUp size={14} /> {account.trackedCount} tracked
                  </span>
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Send size={14} /> {account.appliedCount} applied
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Trophy size={14} /> {account.acceptedCount} accepted
                  </span>
                  <button
                    onClick={() => handleSwitch(account.id)}
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-purple-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-600 disabled:opacity-60 sm:w-auto"
                  >
                    {isPending && switchingId === account.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <LogIn size={13} />
                    )}
                    Switch to
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
