"use client";

import { useState, useTransition } from "react";
import { MapPin, Lock, CheckCircle2, Users, Pencil, ChevronDown } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import { promoteOpportunityAction, updateOpportunityAction } from "@/app/admin/actions";
import { Badge } from "@/components/ui/Badge";
import OpportunityForm from "./OpportunityForm";
import DeleteOpportunityButton from "./DeleteOpportunityButton";

interface CommunitySubmissionsProps {
  submissions: Opportunity[];
  organizationSuggestions: string[];
}

export default function CommunitySubmissions({ submissions, organizationSuggestions }: CommunitySubmissionsProps) {
  const [publishPending, startPublishTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(null);

  if (submissions.length === 0) {
    return (
      <div className="flex items-center gap-4 rounded-3xl border border-dashed border-black/10 bg-white/40 p-6 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-gray-400 dark:bg-white/10">
          <Users size={18} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No private submissions from users yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50/60 to-white shadow-sm dark:border-amber-500/20 dark:from-amber-500/[0.06] dark:to-white/5">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
          <Lock size={18} />
        </div>
        <div>
          <h2 className="font-bold">Community submissions ({submissions.length})</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Added privately by users for their own tracking — review, fix anything that needs it, then publish.
          </p>
        </div>
      </div>

      <div className="space-y-2 px-4 pb-4">
        {submissions.map((offer) => {
          const isOpen = openId === offer.id;
          const boundUpdate = updateOpportunityAction.bind(null, offer.id);

          return (
            <div
              key={offer.id}
              className="overflow-hidden rounded-2xl border border-black/5 bg-white/70 dark:border-white/5 dark:bg-white/5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                <button
                  onClick={() => setOpenId(isOpen ? null : offer.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <ChevronDown size={15} className={`shrink-0 text-gray-400 transition ${isOpen ? "rotate-180" : ""}`} />
                  <div className="min-w-0">
                    <p className="font-semibold">{offer.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{offer.organization}</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {offer.location}
                      </span>
                      <Badge tone="neutral" className="px-2 py-0.5 text-[10px]">
                        {offer.type}
                      </Badge>
                    </div>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => setOpenId(isOpen ? null : offer.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => startPublishTransition(async () => { await promoteOpportunityAction(offer.id); })}
                    disabled={publishPending}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
                  >
                    <CheckCircle2 size={15} /> Publish
                  </button>
                  <DeleteOpportunityButton id={offer.id} title={offer.title} compact />
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-black/5 p-5 dark:border-white/5">
                  <OpportunityForm
                    action={boundUpdate}
                    initialValues={offer}
                    submitLabel="Save changes"
                    organizationSuggestions={organizationSuggestions}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
