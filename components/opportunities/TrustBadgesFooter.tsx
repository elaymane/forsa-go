import { CheckCircle2, Bell, ShieldCheck, MapPinned } from "lucide-react";

const BADGES = [
  { icon: CheckCircle2, tone: "text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300", title: "100% Free", body: "Every opportunity, no cost to browse" },
  { icon: Bell, tone: "text-purple-500 bg-purple-100 dark:bg-purple-500/20 dark:text-purple-300", title: "Personalized alerts", body: "Get notified about matching offers" },
  { icon: ShieldCheck, tone: "text-blue-500 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300", title: "Verified listings", body: "Checked before they're published" },
  { icon: MapPinned, tone: "text-rose-500 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-300", title: "All over Morocco", body: "Find opportunities near you" },
];

export default function TrustBadgesFooter() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {BADGES.map((badge) => {
        const Icon = badge.icon;
        return (
          <div
            key={badge.title}
            className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${badge.tone}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold">{badge.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{badge.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
