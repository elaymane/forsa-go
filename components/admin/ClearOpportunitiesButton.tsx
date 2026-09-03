"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { clearAllOpportunitiesAction } from "@/app/admin/actions";

const CONFIRM_PHRASE = "DELETE ALL";

export default function ClearOpportunitiesButton({ totalCount }: { totalCount: number }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<{ error?: string; deletedCount?: number } | null>(null);

  const canConfirm = typed === CONFIRM_PHRASE;

  const handleConfirm = () => {
    startTransition(async () => {
      const res = await clearAllOpportunitiesAction();
      setResult(res);
      setConfirming(false);
      setTyped("");
    });
  };

  if (confirming) {
    return (
      <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-4 dark:border-red-500/50 dark:bg-red-500/10">
        <div className="mb-2 flex items-center gap-2 font-bold text-red-700 dark:text-red-300">
          <AlertTriangle size={18} />
          This deletes all {totalCount} opportunities. Permanently.
        </div>
        <p className="mb-3 text-sm text-red-600 dark:text-red-300">
          User accounts, organization logos, and organization descriptions are kept. This cannot be undone —
          export a backup first if you're not sure. Type <strong>{CONFIRM_PHRASE}</strong> to confirm.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm dark:border-red-500/40 dark:bg-black/20"
          />
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isPending}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending ? "Deleting…" : `Yes, delete all ${totalCount}`}
          </button>
          <button
            onClick={() => {
              setConfirming(false);
              setTyped("");
            }}
            disabled={isPending}
            className="rounded-lg border border-black/10 px-3 py-1.5 text-sm dark:border-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => {
          setConfirming(true);
          setResult(null);
        }}
        className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
      >
        <Trash2 size={15} /> Clear all opportunities
      </button>
      {result?.error && <p className="mt-1 text-xs text-red-500">{result.error}</p>}
      {result?.deletedCount !== undefined && (
        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
          Deleted {result.deletedCount} opportunit{result.deletedCount === 1 ? "y" : "ies"}.
        </p>
      )}
    </div>
  );
}
