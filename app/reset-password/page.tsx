import Link from "next/link";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translations";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const locale = await getLocale();

  if (!token) {
    const i = t(locale).resetPasswordPage;
    return (
      <AuthShell>
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-xl font-semibold">{i.missingLink}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{i.missingLinkBody}</p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-block text-sm font-medium text-purple-600 hover:underline dark:text-purple-400"
          >
            {i.requestNew}
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <ResetPasswordForm token={token} locale={locale} />
    </AuthShell>
  );
}
