import type { Opportunity } from "@/types/opportunity";

export interface UserProfileSnippet {
  level: string | null;
  specialization: string | null;
}

/** True when an opportunity's level or specialization matches the user's profile. An opportunity with no specialization set is treated as open to every specialization. */
export function matchesProfile(offer: Opportunity, profile: UserProfileSnippet | null | undefined): boolean {
  if (!profile) return false;

  const levelMatch = Boolean(profile.level) && offer.level === profile.level;
  const specializationMatch =
    Boolean(profile.specialization) &&
    (!offer.specialization || offer.specialization.trim().toLowerCase() === profile.specialization!.trim().toLowerCase());

  return levelMatch || specializationMatch;
}
