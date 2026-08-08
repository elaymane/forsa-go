import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "./translations";

const LOCALE_COOKIE = "forsa_locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "fr" ? "fr" : "en";
}

export { LOCALE_COOKIE };
