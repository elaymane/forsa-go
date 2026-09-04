interface AdSlotProps {
  /** A stable identifier for this position — useful once real ad code is dropped in (e.g. per-slot targeting). */
  slotId: string;
  size?: "banner" | "square" | "leaderboard";
}

const SIZES: Record<NonNullable<AdSlotProps["size"]>, string> = {
  banner: "h-24 sm:h-28", // ~728x90-ish
  square: "h-64", // ~300x250-ish
  leaderboard: "h-20", // ~970x90-ish
};

/**
 * A reserved, clearly-labeled ad position. Renders an empty placeholder for
 * now — drop real ad network code (Google AdSense, etc.) in here once an
 * account exists. Kept as a single shared component so every position can
 * be wired up in one place later instead of hunting through every page.
 */
export default function AdSlot({ slotId, size = "banner" }: AdSlotProps) {
  return (
    <div
      data-ad-slot={slotId}
      className={`flex w-full items-center justify-center rounded-2xl border border-dashed border-black/10 bg-black/[0.02] text-xs text-gray-400 dark:border-white/10 dark:bg-white/[0.02] dark:text-gray-500 ${SIZES[size]}`}
    >
      Advertisement
    </div>
  );
}
