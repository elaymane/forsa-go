"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import { toggleSaveAction } from "@/app/actions";

export default function InterestedSaveCard({
  offer,
  applicationState,
  guestMode,
}: {
  offer: Opportunity;
  applicationState?: ApplicationState;
  guestMode?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const saved = applicationState?.saved ?? false;

  if (guestMode) return null;

  const handleSave = () =>
    startTransition(async () => {
      const result = await toggleSaveAction(offer.id);
      if (result.limitReached) {
        router.push("/subscribe");
      }
    });

  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Intéressé par cette opportunité ?</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Enregistrez-la pour la retrouver plus tard.
          </p>
        </div>
        <Bookmark size={16} className={saved ? "shrink-0 fill-purple-500 text-purple-500" : "shrink-0 text-gray-300 dark:text-gray-600"} />
      </div>
      <button
        onClick={handleSave}
        disabled={isPending}
        className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
          saved
            ? "border border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300"
            : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02]"
        }`}
      >
        {saved ? <Check size={15} /> : <Bookmark size={15} />}
        {saved ? "Enregistré" : "Enregistrer"}
      </button>
    </div>
  );
}
