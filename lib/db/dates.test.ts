import { describe, it, expect } from "vitest";
import { toISODateString, toISOTimestamp } from "./dates";

describe("toISODateString", () => {
  it("returns null for null or undefined", () => {
    expect(toISODateString(null)).toBeNull();
    expect(toISODateString(undefined)).toBeNull();
  });

  it("converts a Date object to YYYY-MM-DD — this is the exact bug that broke exam dates in production", () => {
    // Postgres DATE columns come back as Date objects from the driver, not
    // strings. Rendering one directly in JSX throws "Objects are not valid
    // as a React child" — this test exists specifically to catch a
    // regression of that bug.
    const date = new Date(Date.UTC(2026, 4, 25)); // May 25, 2026
    expect(toISODateString(date)).toBe("2026-05-25");
  });

  it("passes through a plain YYYY-MM-DD string unchanged", () => {
    expect(toISODateString("2026-05-25")).toBe("2026-05-25");
  });

  it("truncates a full timestamp string down to just the date portion", () => {
    expect(toISODateString("2026-05-25T14:30:00.000Z")).toBe("2026-05-25");
  });

  it("returns null for anything else (numbers, objects, etc.)", () => {
    expect(toISODateString(12345)).toBeNull();
    expect(toISODateString({})).toBeNull();
  });
});

describe("toISOTimestamp", () => {
  it("returns null for null or undefined", () => {
    expect(toISOTimestamp(null)).toBeNull();
    expect(toISOTimestamp(undefined)).toBeNull();
  });

  it("converts a Date object to a full ISO timestamp, keeping time precision", () => {
    const date = new Date(Date.UTC(2026, 4, 25, 14, 30, 0));
    expect(toISOTimestamp(date)).toBe("2026-05-25T14:30:00.000Z");
  });

  it("passes through a string unchanged (no truncation, unlike toISODateString)", () => {
    expect(toISOTimestamp("2026-05-25T14:30:00.000Z")).toBe("2026-05-25T14:30:00.000Z");
  });
});
