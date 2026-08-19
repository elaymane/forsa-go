"use client";

import { useActionState, useState } from "react";
import { Send, Loader2, Copy, Check, Upload, CheckCircle2, AlertTriangle, Users, Sparkles } from "lucide-react";
import { requestSubscriptionAction, type SubscribeRequestState } from "@/app/actions";
import { MONTHLY_PRICE_MAD } from "@/lib/subscription";
import { MANAGER_TIER_PRICES_MAD, MANAGER_TIER_LABELS, MANAGER_TIER_LIMITS, type ManagerTier } from "@/lib/managerTiers";
import LinkedText from "@/components/ui/LinkedText";

const initialState: SubscribeRequestState = {};
const inputClass =
  "w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5";
const labelClass = "mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400";

const BANK_ACCOUNT = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "000 000 0000000000000 00";
const BANK_NAME = process.env.NEXT_PUBLIC_BANK_NAME || "Your Bank Name";

type PlanChoice = "individual" | ManagerTier;
const MANAGER_TIER_ORDER: ManagerTier[] = ["basic", "pro", "unlimited"];

const PLAN_BENEFITS: Record<PlanChoice, string[]> = {
  individual: ["Unlimited tracked opportunities", "Everything in the free plan", "Priority support"],
  basic: ["Up to 5 linked accounts", "Unlimited tracking for each linked account", "Apply and track on their behalf"],
  pro: ["Up to 20 linked accounts", "Unlimited tracking for each linked account", "Apply and track on their behalf"],
  unlimited: ["Unlimited linked accounts", "Unlimited tracking for each linked account", "Apply and track on their behalf"],
};

export default function SubscribeButton() {
  const [state, formAction, isPending] = useActionState(requestSubscriptionAction, initialState);
  const [copied, setCopied] = useState(false);
  const [plan, setPlan] = useState<PlanChoice>("individual");

  const price = plan === "individual" ? MONTHLY_PRICE_MAD : MANAGER_TIER_PRICES_MAD[plan];

  const copyAccount = async () => {
    await navigator.clipboard.writeText(BANK_ACCOUNT.replace(/\s+/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (state.success) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-600 dark:text-emerald-300" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Request sent! We'll confirm your payment and activate your account within 24 hours.
          </p>
        </div>
        {state.warning && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-500/40 dark:bg-amber-500/10">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              <LinkedText text={state.warning} />
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* DYNAMIC HEADER — reflects whatever plan is currently selected below */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <Sparkles size={18} className="text-purple-500" />
          <h2 className="font-bold">{plan === "individual" ? "Premium" : MANAGER_TIER_LABELS[plan]}</h2>
        </div>
        <p className="text-2xl font-bold">
          {price} DH<span className="text-sm font-normal text-gray-500 dark:text-gray-400"> / month</span>
        </p>
        <ul className="mt-3 space-y-1.5">
          {PLAN_BENEFITS[plan].map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm">
              <Check size={14} className="shrink-0 text-emerald-500" /> {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* PLAN SELECTION */}
      <div>
        <p className={labelClass}>Choose a plan</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => setPlan("individual")}
            className={`rounded-xl border p-2.5 text-left text-xs transition ${
              plan === "individual"
                ? "border-purple-400 bg-purple-50 dark:border-purple-500/50 dark:bg-purple-500/10"
                : "border-black/10 dark:border-white/10"
            }`}
          >
            <p className="font-semibold">Premium</p>
            <p className="text-gray-500 dark:text-gray-400">{MONTHLY_PRICE_MAD} DH/mo</p>
          </button>
          {MANAGER_TIER_ORDER.map((tier) => {
            const limit = MANAGER_TIER_LIMITS[tier];
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setPlan(tier)}
                className={`rounded-xl border p-2.5 text-left text-xs transition ${
                  plan === tier
                    ? "border-purple-400 bg-purple-50 dark:border-purple-500/50 dark:bg-purple-500/10"
                    : "border-black/10 dark:border-white/10"
                }`}
              >
                <p className="flex items-center gap-1 font-semibold">
                  <Users size={11} /> {MANAGER_TIER_LABELS[tier].replace("Manager ", "")}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {MANAGER_TIER_PRICES_MAD[tier]} DH/mo · {limit ?? "∞"} accounts
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* PAYMENT INSTRUCTIONS */}
      <div className="rounded-xl border border-purple-200 bg-white/70 p-4 dark:border-purple-500/20 dark:bg-white/5">
        <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          Send {price} DH to this account, then fill in the form below:
        </p>
        <div className="flex items-center justify-between gap-2 rounded-lg bg-black/5 px-3 py-2 dark:bg-white/10">
          <div>
            <p className="font-mono text-sm font-semibold">{BANK_ACCOUNT}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{BANK_NAME}</p>
          </div>
          <button
            onClick={copyAccount}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-purple-500 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-purple-600"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* REQUEST FORM */}
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="managerTier" value={plan === "individual" ? "" : plan} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>First name *</label>
            <input name="firstName" required className={inputClass} placeholder="As sent on the transfer" />
          </div>
          <div>
            <label className={labelClass}>Last name *</label>
            <input name="lastName" required className={inputClass} placeholder="As sent on the transfer" />
          </div>
        </div>
        <p className="text-[11px] text-gray-400">
          Use the exact name shown on the bank transfer — it may not be the same as your account name — so we can
          match your payment.
        </p>

        <div>
          <label className={labelClass}>Payment receipt (optional but speeds things up — under 3MB)</label>
          <input
            name="receipt"
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-purple-700 hover:file:bg-purple-200 dark:text-gray-300 dark:file:bg-purple-500/20 dark:file:text-purple-300"
          />
        </div>

        {state.error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          I've sent the payment
        </button>
      </form>
    </div>
  );
}
