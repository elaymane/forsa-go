import Link from "next/link";
import { Instagram, Crown } from "lucide-react";
import { hasUnlimitedTracking, FOUNDING_MEMBER_CAP } from "@/lib/subscription";
import type { User } from "@/lib/db/auth";

interface HouseAdProps {
  user: User;
  foundingSpotsLeft?: number;
}

/**
 * Fills the ad space with real self-promotion instead of an empty
 * placeholder, until there's enough traffic to actually run AdSense —
 * ad networks require real content/traffic before approval anyway, so this
 * isn't just a stopgap, it's the actual sequencing that has to happen.
 *
 * To switch to real ads later: swap this back for <AdSlot /> — same slot,
 * same spot, no layout changes needed.
 */
export default function HouseAd({ user, foundingSpotsLeft }: HouseAdProps) {
  const showFoundingPromo = !hasUnlimitedTracking(user) && (foundingSpotsLeft ?? 0) > 0;

  if (showFoundingPromo) {
    return (
      <Link
        href="/subscribe"
        className="flex items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-5 text-center transition hover:scale-[1.01] dark:border-amber-500/20 dark:from-amber-500/10 dark:to-yellow-500/10 sm:text-left"
      >
        <Crown size={20} className="shrink-0 text-amber-500" />
        <p className="text-sm">
          <span className="font-semibold">Only {foundingSpotsLeft}/{FOUNDING_MEMBER_CAP} founding member spots left</span>
          <span className="text-gray-500 dark:text-gray-400"> — free months of Premium, just for signing up early.</span>
        </p>
      </Link>
    );
  }

  return (
    <a
      href="https://www.instagram.com/forsago__"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-3 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-5 text-center transition hover:scale-[1.01] dark:border-purple-500/20 dark:from-purple-500/10 dark:to-indigo-500/10 sm:text-left"
    >
      <Instagram size={20} className="shrink-0 text-purple-500" />
      <p className="text-sm">
        <span className="font-semibold">Follow @forsago__</span>
        <span className="text-gray-500 dark:text-gray-400"> — new opportunities and tips, straight on Instagram.</span>
      </p>
    </a>
  );
}
