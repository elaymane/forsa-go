/**
 * Some opportunities are open in multiple cities at once and get stored as
 * one combined string, e.g. "Berkane / Rabat / Marrakech". Every place that
 * does city matching — filters, city badges, city hub links — needs the
 * real individual cities, not the raw combined string. This is the one
 * place that parsing happens, so every consumer stays consistent.
 */
export function parseCities(location: string): string[] {
  return location
    .split("/")
    .map((c) => c.trim())
    .filter(Boolean);
}

/** True if this opportunity is open in more than one city. */
export function isMultiCity(location: string): boolean {
  return parseCities(location).length > 1;
}
