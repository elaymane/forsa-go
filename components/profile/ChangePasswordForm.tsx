"use client";

import { useActionState } from "react";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { changePasswordAction, type ChangePasswordState } from "@/app/actions";
import { t, type Locale } from "@/lib/i18n/translations";

const initialState: ChangePasswordState = {};
const inputClass =
  "w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5";
const labelClass = "mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400";

export default function ChangePasswordForm({ locale }: { locale: Locale }) {
  const i = t(locale).changePasswordForm;
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  return (
    <div className="max-w-lg rounded-2xl border border-black/10 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
      <div className="mb-4 flex items-center gap-2">
        <Lock size={16} className="text-purple-500" />
        <h2 className="font-semibold">{i.title}</h2>
      </div>

      <form action={formAction} className="space-y-3" key={state.success ? "done" : "form"}>
        <div>
          <label className={labelClass}>{i.currentPassword}</label>
          <input name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{i.newPassword}</label>
          <input name="newPassword" type="password" required autoComplete="new-password" className={inputClass} placeholder={i.newPasswordPlaceholder} />
        </div>
        <div>
          <label className={labelClass}>{i.confirmPassword}</label>
          <input name="confirmPassword" type="password" required autoComplete="new-password" className={inputClass} />
        </div>

        {state.error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
            <CheckCircle2 size={15} /> {i.updated}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:opacity-60"
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {i.updatePassword}
        </button>
      </form>
    </div>
  );
}
