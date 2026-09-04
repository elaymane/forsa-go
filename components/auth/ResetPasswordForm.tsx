"use client";

import Image from "next/image";
import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Lock, CheckCircle2 } from "lucide-react";
import { resetPasswordAction, type ResetPasswordState } from "@/app/actions";
import { t, type Locale } from "@/lib/i18n/translations";

const initialState: ResetPasswordState = {};

export default function ResetPasswordForm({ token, locale }: { token: string; locale: Locale }) {
  const i = t(locale).resetPasswordForm;
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  if (state.success) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
          <CheckCircle2 size={22} />
        </div>
        <h1 className="font-display text-xl font-semibold">{i.passwordUpdated}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{i.loggedOutBody}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
        >
          {i.logIn} <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <Image src="/logo-icon.png" alt="Forsa Go" width={48} height={48} className="mx-auto mb-4 h-12 w-12 rounded-xl" />
        <h1 className="font-display text-2xl font-semibold">{i.title}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{i.subtitle}</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="password"
            type="password"
            placeholder={i.newPasswordPlaceholder}
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-gray-300 bg-gray-100 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5"
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:opacity-60"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : i.resetPassword}
          {!isPending && <ArrowRight size={16} />}
        </button>
      </form>
    </div>
  );
}
