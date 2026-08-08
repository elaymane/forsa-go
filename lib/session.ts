import "server-only";
import { cookies } from "next/headers";
import { getUserBySessionToken, type User } from "@/lib/db/auth";

export const SESSION_COOKIE = "forsa_session";
export const ACTING_AS_COOKIE = "forsa_acting_as";

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getUserBySessionToken(token);
}

/**
 * The account whose data should actually be shown/acted on right now — the
 * real logged-in user by default, or a linked account the manager has
 * switched into. The cookie only ever names a candidate; this always
 * re-verifies that account is genuinely linked to the current real user
 * before trusting it; a stale or tampered cookie just falls back to the
 * real user, it never grants access to someone else's account.
 */
export async function getActingUser(realUser: User): Promise<User> {
  if (!realUser.managerTier) return realUser;
  const store = await cookies();
  const actingAsId = store.get(ACTING_AS_COOKIE)?.value;
  if (!actingAsId) return realUser;

  const { getLinkedAccounts } = await import("@/lib/db/managers");
  const linked = await getLinkedAccounts(realUser.id);
  if (!linked.some((account) => account.id === actingAsId)) return realUser;

  const { getUserById } = await import("@/lib/db/auth");
  const target = await getUserById(actingAsId);
  return target ?? realUser;
}
