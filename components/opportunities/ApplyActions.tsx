"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, Bookmark, Lock } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import { toggleSaveAction, advanceStageAction } from "@/app/actions";
import { trackOpportunityEvent } from "@/lib/gtm";

interface ApplyActionsProps {
  offer: Opportunity;
  applicationState?: ApplicationState;
  guestMode?: boolean;
}

export default function ApplyActions({ offer, applicationState, guestMode }: ApplyActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isClosed = offer.status === "closed";
  const saved = applicationState?.saved ?? false;
  const stage = applicationState?.stage ?? null;

  if (guestMode) {
    return (
      <Link
        href={`/signup?next=/opportunities/${offer.id}`}
        className="flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
      >
        <Lock size={15} /> Sign up to apply
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={() =>
          startTransition(async () => {
            const result = await advanceStageAction(offer.id);

            if (result.limitReached) {
              router.push("/subscribe");
              return;
            }

            if (result.expired) {
              alert("This opportunity's deadline has passed — you can no longer apply.");
              return;
            }

            if (result.ok && stage === null) {
              trackOpportunityEvent("apply_opportunity", {
                opportunity_id: offer.id,
                opportunity_title: offer.title,
                opportunity_type: offer.type,
                organization: offer.organization,
                location: offer.location,
              });
            }
          })
        }
        disabled={isClosed || stage !== null || isPending}
        className="flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={15} /> {stage ? "Applied ✓" : "Apply"}
      </button>
      <button
        onClick={() =>
          startTransition(async () => {
            const result = await toggleSaveAction(offer.id);

            if (result.limitReached) {
              router.push("/subscribe");
              return;
            }

            if (result.ok && !saved) {
              trackOpportunityEvent("save_opportunity", {
                opportunity_id: offer.id,
                opportunity_title: offer.title,
                opportunity_type: offer.type,
                organization: offer.organization,
                location: offer.location,
              });
            }
          })
        }
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
      >
        <Bookmark size={15} className={saved ? "fill-yellow-500 text-yellow-500" : ""} /> {saved ? "Saved" : "Save"}
      </button>
    </>
  );
}
