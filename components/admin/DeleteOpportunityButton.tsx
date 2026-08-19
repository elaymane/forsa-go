"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteOpportunityAction } from "@/app/admin/actions";

interface DeleteOpportunityButtonProps {
  id: string;
  title: string;
  /** If true, redirects away after deleting (used on the standalone edit page, which no longer has anything to show). */
  redirectAfter?: string;
  compact?: boolean;
}

export default function DeleteOpportunityButton({ id, title, redirectAfter, compact }: DeleteOpportunityButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteOpportunityAction(id);
      if (redirectAfter) router.push(redirectAfter);
    });
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-red-600 dark:text-red-400">Delete "{title}"?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-lg bg-red-500 px-2 py-1 font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-lg border border-black/10 px-2 py-1 dark:border-white/10"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className={
        compact
          ? "flex items-center gap-1 text-xs font-medium text-red-500 hover:underline"
          : "flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
      }
    >
      <Trash2 size={compact ? 12 : 14} /> Delete
    </button>
  );
}
