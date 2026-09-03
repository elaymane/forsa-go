export type ManagerTier = "basic" | "pro" | "unlimited";

export const MANAGER_TIER_PRICES_MAD: Record<ManagerTier, number> = {
  basic: 99,
  pro: 199,
  unlimited: 399,
};

/** Max linked accounts per tier — null means no limit. */
export const MANAGER_TIER_LIMITS: Record<ManagerTier, number | null> = {
  basic: 5,
  pro: 20,
  unlimited: null,
};

export const MANAGER_TIER_LABELS: Record<ManagerTier, string> = {
  basic: "Manager Basic",
  pro: "Manager Pro",
  unlimited: "Manager Unlimited",
};

export function isManagerTier(value: string | null | undefined): value is ManagerTier {
  return value === "basic" || value === "pro" || value === "unlimited";
}
