import "server-only";
import type { Locale } from "./translations";

const LOCALE_COOKIE = "forsa_locale";

export async function getLocale(): Promise<Locale> {
  return "fr";
}

export { LOCALE_COOKIE };
