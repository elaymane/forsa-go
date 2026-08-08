import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import AuthForm from "@/components/auth/AuthForm";
import { loginAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell>
      <AuthForm
        variant="login"
        title="Welcome back"
        subtitle="Log in to keep tracking your opportunities."
        submitLabel="Log in"
        action={loginAction}
        footer={{ text: "New to Forsa Go?", linkLabel: "Create an account", href: "/signup" }}
      />
      <p className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="text-gray-500 hover:underline dark:text-gray-400">
          Forgot your password?
        </Link>
      </p>
    </AuthShell>
  );
}
