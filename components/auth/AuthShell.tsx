import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="ambient-glow flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12 dark:bg-[#020617]">
      <Link
        href="/"
        className="mb-8 text-sm text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        ← Back to Forsa Go
      </Link>
      <div className="w-full max-w-sm rounded-3xl border border-black/10 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        {children}
      </div>
    </div>
  );
}
