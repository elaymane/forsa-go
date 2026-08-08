"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Users, ArrowRight } from "lucide-react";
import { MANAGER_TIER_LABELS, MANAGER_TIER_LIMITS, type ManagerTier } from "@/lib/managerTiers";

export default function ProfileManagerCode({
  tier,
  code,
  linkedCount,
}: {
  tier: ManagerTier;
  code: string | null;
  linkedCount: number;
}) {
  const [copied, setCopied] = useState(false);
  const limit = MANAGER_TIER_LIMITS[tier];

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 dark:border-purple-500/20 dark:from-purple-500/10 dark:to-indigo-500/10">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-purple-500" />
          <p className="text-sm font-semibold">{MANAGER_TIER_LABELS[tier]}</p>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {linkedCount}{limit !== null ? ` / ${limit}` : ""} linked
        </span>
      </div>

      {code && (
        <div className="mb-3 flex items-center gap-2">
          <code className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 font-mono text-sm font-bold tracking-widest dark:border-white/10 dark:bg-black/20">
            {code}
          </code>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-xl bg-purple-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-600"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      <Link
        href="/manager"
        className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:underline dark:text-purple-400"
      >
        Manage linked accounts <ArrowRight size={12} />
      </Link>
    </div>
  );
}
