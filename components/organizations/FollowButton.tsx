"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell, BellOff, Loader2, Lock } from "lucide-react";
import { followOrganizationAction, unfollowOrganizationAction } from "@/app/actions";

interface FollowButtonProps {
  slug: string;
  name: string;
  initiallyFollowing: boolean;
  isLoggedIn: boolean;
  fullWidth?: boolean;
}

export default function FollowButton({ slug, name, initiallyFollowing, isLoggedIn, fullWidth }: FollowButtonProps) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [isPending, startTransition] = useTransition();
  const widthClass = fullWidth ? "w-full justify-center" : "";

  if (!isLoggedIn) {
    return (
      <Link
        href={`/signup?next=/organizations/${slug}`}
        className={`flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] ${widthClass}`}
      >
        <Lock size={15} /> Sign up to follow
      </Link>
    );
  }

  const toggle = () => {
    const next = !following;
    setFollowing(next); // optimistic
    startTransition(async () => {
      if (next) {
        await followOrganizationAction(slug, name);
      } else {
        await unfollowOrganizationAction(slug);
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${widthClass} ${
        following
          ? "border border-black/10 bg-white text-gray-700 hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          : "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
      }`}
    >
      {isPending ? (
        <Loader2 size={15} className="animate-spin" />
      ) : following ? (
        <BellOff size={15} />
      ) : (
        <Bell size={15} />
      )}
      {following ? "Following" : "Follow"}
    </button>
  );
}
