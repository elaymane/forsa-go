export const FREE_TRACK_LIMIT = 10;
export const FREE_CONCOURS_ADD_LIMIT = 4;
export const FOUNDING_MEMBER_CAP = 100;
export const FOUNDING_MEMBER_FREE_MONTHS = 2;
export const MONTHLY_PRICE_MAD = 40;

export interface SubscriptionSnapshot {
  isFoundingMember: boolean;
  plan: "free" | "premium";
  subscriptionActiveUntil: string | null;
}

/**
 * True if this user can track unlimited opportunities right now — either an
 * active paid subscription, or a founding member still inside their 2 free
 * months (both use subscriptionActiveUntil; a founding member's free period
 * expires exactly like a subscription would, unless they then pay to extend it).
 */
export function hasUnlimitedTracking(user: SubscriptionSnapshot): boolean {
  if (!user.subscriptionActiveUntil) return false;
  return new Date(user.subscriptionActiveUntil).getTime() > Date.now();
}
