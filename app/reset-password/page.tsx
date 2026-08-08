import Link from "next/link";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

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

  if (!token) {
    return (
      <AuthShell>
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-xl font-semibold">Missing reset link</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This page needs a valid reset link from your email.
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-block text-sm font-medium text-purple-600 hover:underline dark:text-purple-400"
          >
            Request a new one
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
