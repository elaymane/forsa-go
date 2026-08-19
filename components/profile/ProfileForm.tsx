"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfileAction, type ProfileFormState } from "@/app/profile/actions";
import { EDUCATION_LEVELS } from "@/types/opportunity";
import type { User } from "@/lib/db/auth";
import { t, type Locale } from "@/lib/i18n/translations";

const initialState: ProfileFormState = {};

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5";
const labelClass = "mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400";

export default function ProfileForm({ user, locale }: { user: User; locale: Locale }) {
  const i = t(locale).profileForm;
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelClass}>{i.name}</label>
        <input value={user.name} disabled className={`${inputClass} cursor-not-allowed opacity-70`} />
      </div>
      <div>
        <label className={labelClass}>{i.email}</label>
        <input value={user.email} disabled className={`${inputClass} cursor-not-allowed opacity-70`} />
      </div>

      <div>
        <label className={labelClass}>{i.yourLevel}</label>
        <select name="level" className={inputClass} defaultValue={user.level ?? ""}>
          <option value="">{i.notSpecified}</option>
          {EDUCATION_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>{i.yourSpecialization}</label>
        <input
          name="specialization"
          defaultValue={user.specialization ?? ""}
          className={inputClass}
          placeholder="Informatique, Génie Civil..."
        />
      </div>

      <div>
        <label className={labelClass}>{i.yourLocation}</label>
        <input
          name="location"
          defaultValue={user.location ?? ""}
          className={inputClass}
          placeholder="Casablanca"
        />
      </div>

      <p className="text-xs text-gray-400">{i.matchNote}</p>

      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:opacity-60"
      >
        {isPending && <Loader2 size={16} className="animate-spin" />}
        {i.saveProfile}
      </button>
    </form>
  );
}
