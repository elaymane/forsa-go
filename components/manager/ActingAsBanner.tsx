import { UserCog } from "lucide-react";
import { switchBackAction } from "@/app/actions";

export default function ActingAsBanner({ name }: { name: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-500/40 dark:bg-amber-500/10">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
        <UserCog size={16} /> Viewing and acting as {name}
      </div>
      <form action={switchBackAction}>
        <button
          type="submit"
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
        >
          Switch back
        </button>
      </form>
    </div>
  );
}
