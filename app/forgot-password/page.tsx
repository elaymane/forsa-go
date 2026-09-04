import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/getLocale";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const locale = await getLocale();

  return (
    <AuthShell>
      <ForgotPasswordForm locale={locale} />
    </AuthShell>
  );
}
