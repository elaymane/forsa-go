import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import AuthForm from "@/components/auth/AuthForm";
import { signupAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translations";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const locale = await getLocale();
  const i = t(locale).signupPage;

  return (
    <AuthShell>
      <AuthForm
        variant="signup"
        title={i.title}
        subtitle={i.subtitle}
        submitLabel={i.submitLabel}
        action={signupAction}
        footer={{ text: i.footerText, linkLabel: i.footerLink, href: "/login" }}
        locale={locale}
      />
    </AuthShell>
  );
}
