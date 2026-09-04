"use client";

import Image from "next/image";
import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Mail, MailCheck } from "lucide-react";
import { requestPasswordResetAction, type ForgotPasswordState } from "@/app/actions";
import { t, type Locale } from "@/lib/i18n/translations";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const i = t(locale).forgotPasswordForm;
  const auth = t(locale).authForm;
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);

  if (state.submitted) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
          <MailCheck size={22} />
        </div>
        <h1 className="font-display text-xl font-semibold">{i.checkEmail}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{i.checkEmailBody}</p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-purple-600 hover:underline dark:text-purple-400"
        >
          {i.backToLogin}
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
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="email"
            type="email"
            placeholder={auth.emailPlaceholder}
            autoComplete="email"
            required
            className="w-full rounded-xl border border-gray-300 bg-gray-100 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:opacity-60"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : i.sendResetLink}
          {!isPending && <ArrowRight size={16} />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {i.rememberedIt}{" "}
        <Link href="/login" className="font-medium text-purple-600 hover:underline dark:text-purple-400">
          {i.logIn}
        </Link>
      </p>
    </div>
  );
}
