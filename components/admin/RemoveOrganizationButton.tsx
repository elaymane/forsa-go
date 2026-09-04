"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteOrganizationProfileAction } from "@/app/admin/actions";

export default function RemoveOrganizationButton({ slug, name }: { slug: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) {
    return <p className="text-xs text-emerald-600 dark:text-emerald-400">Removed {name}.</p>;
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 dark:border-red-500/30 dark:bg-red-500/10">
        <span className="text-sm text-red-600 dark:text-red-300">
          Remove {name}'s profile? Any real opportunities from them are kept.
        </span>
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await deleteOrganizationProfileAction(slug, name);
              setDone(true);
            })
          }
          disabled={isPending}
          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : "Yes, remove"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-lg border border-black/10 px-3 py-1 text-xs dark:border-white/10"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
    >
      <Trash2 size={15} /> Remove organization
    </button>
  );
}
