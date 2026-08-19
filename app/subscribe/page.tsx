import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Crown, Clock } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import SubscribeButton from "@/components/subscription/SubscribeButton";
import { getNotifications } from "@/lib/db/notifications";
import { getTrackedOpportunityCount } from "@/lib/db/applications";
import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { FREE_TRACK_LIMIT, FOUNDING_MEMBER_FREE_MONTHS, hasUnlimitedTracking } from "@/lib/subscription";
import { getLocale } from "@/lib/i18n/getLocale";

export const metadata: Metadata = {
  title: "Subscribe",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function SubscribePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/subscribe");

  const [notifications, trackedCount, locale] = await Promise.all([
    getNotifications(user.id),
    getTrackedOpportunityCount(user.id),
    getLocale(),
  ]);

  const unlimited = hasUnlimitedTracking(user);
  const isPendingApproval = Boolean(user.subscriptionRequestedAt);
  // A founding member whose 2 free months have already run out — their free
  // window used subscriptionActiveUntil too, so "expired" looks the same as
  // any other lapsed plan. This just tracks whether to explain why.
  const founderPeriodLapsed = user.isFoundingMember && !unlimited;

  return (
    <AppShell title="Subscribe" notifications={notifications} user={user} isAdmin={isAdminEmail(user.email)} locale={locale}>
      {unlimited ? (
        <div className="flex items-center gap-4 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-yellow-500/10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
            <Crown size={22} />
          </div>
          <div>
            <p className="font-bold">
              {user.isFoundingMember ? "You're a founding member 🎉" : "Your subscription is active ✓"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {user.isFoundingMember
                ? `One of our first 100 users — ${FOUNDING_MEMBER_FREE_MONTHS} months of unlimited tracking, completely free.`
                : "Unlimited tracked opportunities, active right now."}
              {user.subscriptionActiveUntil && ` Active until ${formatDate(user.subscriptionActiveUntil)}.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {founderPeriodLapsed && (
            <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              <Crown size={16} className="shrink-0 text-amber-500" />
              Your {FOUNDING_MEMBER_FREE_MONTHS} free founding-member months have ended — you're on the free plan
              below unless you subscribe.
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* CURRENT STATUS */}
            <div className="rounded-3xl border border-black/10 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
              <h2 className="mb-1 font-bold">Your plan</h2>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Free — {trackedCount}/{FREE_TRACK_LIMIT} opportunities tracked
              </p>

              <div className="mb-4 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  style={{ width: `${Math.min(100, (trackedCount / FREE_TRACK_LIMIT) * 100)}%` }}
                />
              </div>
            </div>

            {/* UPGRADE CARD */}
            <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 dark:border-purple-500/20 dark:from-purple-500/10 dark:to-indigo-500/10">
              {isPendingApproval ? (
                <p className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  <Clock size={15} /> Request sent — we'll activate it once payment is confirmed.
                </p>
              ) : (
                <SubscribeButton />
              )}

              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Payments aren't automatic yet — after requesting, you'll get instructions to complete payment, and
                we'll activate your account by hand within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
