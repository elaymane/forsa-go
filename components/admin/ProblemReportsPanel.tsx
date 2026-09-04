"use client";

import { useState, useTransition } from "react";
import { Bug, CheckCircle2, ExternalLink } from "lucide-react";
import type { ProblemReport } from "@/lib/db/problemReports";
import { markReportResolvedAction } from "@/app/admin/actions";
import { relativeTime } from "@/lib/formatting";

export default function ProblemReportsPanel({ reports }: { reports: ProblemReport[] }) {
  const newCount = reports.filter((r) => r.status === "new").length;

  if (reports.length === 0) return null;

  return (
    <div className="rounded-3xl border border-red-200 bg-red-50/50 p-6 dark:border-red-500/20 dark:bg-red-500/[0.03]">
      <div className="mb-4 flex items-center gap-2">
        <Bug size={18} className="text-red-500" />
        <h2 className="font-bold">Problem reports</h2>
        {newCount > 0 && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">{newCount} new</span>
        )}
      </div>

      <div className="space-y-2">
        {reports.map((report) => (
          <ReportRow key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
}

function ReportRow({ report }: { report: ProblemReport }) {
  const [isPending, startTransition] = useTransition();
  const [resolved, setResolved] = useState(report.status === "resolved");

  return (
    <div
      className={`rounded-2xl border p-4 ${
        resolved
          ? "border-black/5 bg-white/40 opacity-60 dark:border-white/5 dark:bg-white/[0.02]"
          : "border-red-200 bg-white dark:border-red-500/20 dark:bg-white/5"
      }`}
    >
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-700 dark:text-gray-200">{report.userName}</span> ({report.userEmail}) ·{" "}
          {relativeTime(report.createdAt)}
        </div>
        {!resolved && (
          <button
            onClick={() =>
              startTransition(async () => {
                await markReportResolvedAction(report.id);
                setResolved(true);
              })
            }
            disabled={isPending}
            className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
          >
            <CheckCircle2 size={12} /> Mark resolved
          </button>
        )}
        {resolved && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={12} /> Resolved
          </span>
        )}
      </div>
      <p className="text-sm">{report.description}</p>
      {report.pageUrl && (
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
          <ExternalLink size={10} /> {report.pageUrl}
        </p>
      )}
    </div>
  );
}
