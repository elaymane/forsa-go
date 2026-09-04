import type { ReactNode } from "react";

type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "danger"
  | "warning"
  | "info";

const TONE_STYLES: Record<BadgeTone, string> = {
  neutral:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-white/80 dark:border-white/10",
  primary:
    "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
  success:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  danger:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  warning:
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30",
  info: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-transform hover:scale-105 ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
