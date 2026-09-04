import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import AuthForm from "@/components/auth/AuthForm";
import { loginAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translations";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const locale = await getLocale();
  const i = t(locale).loginPage;

  return (
    <AuthShell>
      <AuthForm
        variant="login"
        title={i.title}
        subtitle={i.subtitle}
        submitLabel={i.submitLabel}
        action={loginAction}
        footer={{ text: i.footerText, linkLabel: i.footerLink, href: "/signup" }}
        locale={locale}
      />
      <p className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="text-gray-500 hover:underline dark:text-gray-400">
          {i.forgotPassword}
        </Link>
      </p>
    </AuthShell>
  );
}
