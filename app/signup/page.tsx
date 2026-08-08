import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import AuthForm from "@/components/auth/AuthForm";
import { signupAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell>
      <AuthForm
        variant="signup"
        title="Create your account"
        subtitle="Start tracking concours, jobs and scholarships today."
        submitLabel="Create account"
        action={signupAction}
        footer={{ text: "Already have an account?", linkLabel: "Log in", href: "/login" }}
      />
    </AuthShell>
  );
}
