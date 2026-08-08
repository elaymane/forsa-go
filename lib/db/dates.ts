import "server-only";

/**
 * Postgres `DATE` columns come back from the driver as native JS `Date`
 * objects, not strings — even though our TypeScript row types optimistically
 * say `string | null`. Rendering a Date object directly in JSX throws
 * ("Objects are not valid as a React child"), and string operations like
 * template-interpolating it produce garbage (`.toString()` output, not
 * "YYYY-MM-DD"). Every DATE column read from the database must go through
 * this before it's used anywhere else.
 */
export function toISODateString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return null;
}

/** Same idea, but keeps full date+time precision (for TIMESTAMPTZ columns like created_at). */
export function toISOTimestamp(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
}
