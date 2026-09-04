import { Eye, Radio, Users, UserPlus, BarChart3 } from "lucide-react";
import type { AnalyticsSnapshot } from "@/lib/db/analytics";

function StatCard({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Eye;
  value: number;
  label: string;
  tone: "purple" | "emerald" | "amber" | "indigo";
}) {
  const toneClass = {
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300",
  }[tone];

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon size={19} />
      </div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPanel({
  snapshot,
  trend,
}: {
  snapshot: AnalyticsSnapshot;
  trend: Array<{ date: string; visitors: number }>;
}) {
  const maxVisitors = Math.max(1, ...trend.map((t) => t.visitors));

  return (
    <div className="rounded-3xl border border-black/10 bg-white/60 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
          <BarChart3 size={18} />
        </div>
        <div>
          <h2 className="font-bold">Traffic</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Real visits, tracked automatically — no external service.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard icon={Eye} value={snapshot.visitorsToday} label="Visitors today" tone="purple" />
        <StatCard icon={Radio} value={snapshot.activeNow} label="Active now (15m)" tone="emerald" />
        <StatCard icon={BarChart3} value={snapshot.pageViewsToday} label="Page views today" tone="indigo" />
        <StatCard icon={Users} value={snapshot.totalUsers} label="Total registered users" tone="amber" />
        <StatCard icon={UserPlus} value={snapshot.newUsersToday} label="New signups today" tone="purple" />
      </div>

      {trend.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">Visitors, last 7 days</p>
          <div className="flex h-24 items-end gap-2">
            {trend.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-purple-500 to-indigo-400"
                  style={{ height: `${Math.max(4, (day.visitors / maxVisitors) * 100)}%` }}
                  title={`${day.visitors} visitors`}
                />
                <p className="text-[10px] text-gray-400">
                  {new Date(`${day.date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
