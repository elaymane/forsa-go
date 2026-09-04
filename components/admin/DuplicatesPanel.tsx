import { Copy } from "lucide-react";
import type { DuplicateGroup } from "@/lib/db/opportunities";
import DeleteOpportunityButton from "./DeleteOpportunityButton";

export default function DuplicatesPanel({ groups }: { groups: DuplicateGroup[] }) {
  if (groups.length === 0) return null;

  const totalExtra = groups.reduce((sum, g) => sum + (g.opportunities.length - 1), 0);

  return (
    <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-500/30 dark:bg-amber-500/10">
      <div className="mb-4 flex items-center gap-2">
        <Copy size={18} className="text-amber-600 dark:text-amber-400" />
        <h2 className="font-bold">
          {groups.length} possible duplicate{groups.length === 1 ? "" : "s"} found
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({totalExtra} extra row{totalExtra === 1 ? "" : "s"} beyond the first of each)
        </span>
      </div>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Same organization + title (case-insensitive). Review each group and delete the extras —
        keep whichever one has the most complete info.
      </p>

      <div className="space-y-4">
        {groups.map((group, i) => (
          <div
            key={`${group.organization}-${group.title}-${i}`}
            className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
          >
            <p className="mb-2 text-sm font-semibold">
              {group.title}{" "}
              <span className="font-normal text-gray-500 dark:text-gray-400">
                — {group.organization} · {group.opportunities[0].location}
                {group.opportunities[0].level && <> · {group.opportunities[0].level}</>}
              </span>
            </p>
            <div className="space-y-2">
              {group.opportunities.map((o) => (
                <div
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/5 px-3 py-2 dark:border-white/5"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-mono">{o.id}</span>
                    {o.deadlineDate && <span> · deadline {o.deadlineDate}</span>}
                    {o.website && <span> · has website</span>}
                  </div>
                  <DeleteOpportunityButton id={o.id} title={o.title} compact />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
