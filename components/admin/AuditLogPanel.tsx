import { ScrollText } from "lucide-react";
import type { AuditLogEntry } from "@/lib/db/auditLog";
import { relativeTime } from "@/lib/formatting";

export default function AuditLogPanel({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
      <div className="mb-4 flex items-center gap-2">
        <ScrollText size={18} className="text-gray-500 dark:text-gray-400" />
        <h2 className="font-bold">Recent admin activity</h2>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Nothing logged yet.</p>
      ) : (
        <div className="max-h-80 space-y-1.5 overflow-y-auto">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 rounded-lg px-2 py-1.5 text-xs hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
            >
              <span>
                <span className="font-semibold">{entry.adminEmail}</span> — {entry.action}
                {entry.details && <span className="text-gray-500 dark:text-gray-400"> ({entry.details})</span>}
              </span>
              <span className="shrink-0 text-gray-400">{relativeTime(entry.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
