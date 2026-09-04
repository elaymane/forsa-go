"use client";

import { useState, useTransition } from "react";
import { CreditCard, CheckCircle2, XCircle, Clock, User, Users2, Banknote } from "lucide-react";
import type { PendingSubscriptionRequest } from "@/lib/db/auth";
import { activateSubscriptionAction, rejectSubscriptionAction } from "@/app/admin/actions";
import { relativeTime } from "@/lib/formatting";
import { MANAGER_TIER_LABELS, MANAGER_TIER_PRICES_MAD } from "@/lib/managerTiers";
import { MONTHLY_PRICE_MAD } from "@/lib/subscription";
import ReceiptPreview from "./ReceiptPreview";

export default function SubscriptionRequests({ requests }: { requests: PendingSubscriptionRequest[] }) {
  if (requests.length === 0) {
    return (
      <div className="flex items-center gap-4 rounded-3xl border border-dashed border-black/10 bg-white/40 p-6 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-gray-400 dark:bg-white/10">
          <CreditCard size={18} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No pending subscription requests.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/60 to-white shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/[0.06] dark:to-white/5">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
          <CreditCard size={18} />
        </div>
        <div>
          <h2 className="font-bold">Subscription requests ({requests.length})</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Confirm payment was received outside the app, then activate here — 1 month at a time.
          </p>
        </div>
      </div>

      <div className="space-y-2 px-4 pb-4">
        {requests.map((r) => (
          <RequestRow key={r.id} request={r} />
        ))}
      </div>
    </div>
  );
}

function RequestRow({ request: r }: { request: PendingSubscriptionRequest }) {
  const [isPending, startTransition] = useTransition();
  const [confirmingReject, setConfirmingReject] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/70 px-4 py-3.5 dark:border-white/5 dark:bg-white/5">
      <div>
        <p className="font-semibold">{r.name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{r.email}</span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> requested {relativeTime(r.requestedAt)}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Banknote size={11} /> {r.managerTierRequested ? MANAGER_TIER_PRICES_MAD[r.managerTierRequested] : MONTHLY_PRICE_MAD} DH
          </span>
          {r.managerTierRequested && (
            <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Users2 size={11} /> {MANAGER_TIER_LABELS[r.managerTierRequested]}
            </span>
          )}
        </div>
        {(r.paymentFirstName || r.paymentLastName || r.paymentReceiptUrl) && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {(r.paymentFirstName || r.paymentLastName) && (
              <span className="flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                <User size={11} /> Sent as: {r.paymentFirstName} {r.paymentLastName}
              </span>
            )}
            {r.paymentReceiptUrl ? (
              <ReceiptPreview url={r.paymentReceiptUrl} />
            ) : (
              <span className="text-xs italic text-gray-400">No receipt attached</span>
            )}
          </div>
        )}
      </div>

      {confirmingReject ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-red-600 dark:text-red-400">Reject this request?</span>
          <button
            onClick={() => startTransition(async () => { await rejectSubscriptionAction(r.id); })}
            disabled={isPending}
            className="rounded-lg bg-red-500 px-2.5 py-1.5 font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            Yes, reject
          </button>
          <button
            onClick={() => setConfirmingReject(false)}
            disabled={isPending}
            className="rounded-lg border border-black/10 px-2.5 py-1.5 dark:border-white/10"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfirmingReject(true)}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-500/30 dark:hover:bg-red-500/10"
          >
            <XCircle size={15} /> Reject
          </button>
          <button
            onClick={() => startTransition(async () => { await activateSubscriptionAction(r.id); })}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
          >
            <CheckCircle2 size={15} />
            {r.managerTierRequested ? `Activate ${MANAGER_TIER_LABELS[r.managerTierRequested]}` : "Activate 1 month"}
          </button>
        </div>
      )}
    </div>
  );
}
