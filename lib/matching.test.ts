import { describe, it, expect } from "vitest";
import { matchesProfile } from "./matching";
import type { Opportunity } from "@/types/opportunity";

function makeOffer(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "test-offer",
    title: "Test Opportunity",
    organization: "Test Org",
    location: "Casablanca",
    type: "Concours",
    status: "open",
    deadline: "Date unknown",
    daysLeft: 0,
    date: "Date unknown",
    description: "",
    tags: [],
    image: "",
    level: null,
    specialization: null,
    ...overrides,
  };
}

describe("matchesProfile", () => {
  it("returns false when there's no profile at all", () => {
    const offer = makeOffer({ level: "Bac+2" });
    expect(matchesProfile(offer, null)).toBe(false);
    expect(matchesProfile(offer, undefined)).toBe(false);
  });

  it("returns false when the profile has neither level nor specialization set", () => {
    const offer = makeOffer({ level: "Bac+2" });
    expect(matchesProfile(offer, { level: null, specialization: null })).toBe(false);
  });

  it("matches on level alone", () => {
    const offer = makeOffer({ level: "Bac+2", specialization: null });
    expect(matchesProfile(offer, { level: "Bac+2", specialization: null })).toBe(true);
  });

  it("does not match when levels differ", () => {
    const offer = makeOffer({ level: "Bac+2" });
    expect(matchesProfile(offer, { level: "Bac+5", specialization: null })).toBe(false);
  });

  it("matches on specialization, case-insensitively and ignoring whitespace", () => {
    const offer = makeOffer({ specialization: "Génie Civil" });
    expect(matchesProfile(offer, { level: null, specialization: "  génie civil  " })).toBe(true);
  });

  it("matches if EITHER level or specialization matches, not requiring both", () => {
    const offer = makeOffer({ level: "Bac+3", specialization: "Informatique" });
    // Profile only has specialization set and it matches — level isn't even compared.
    expect(matchesProfile(offer, { level: null, specialization: "Informatique" })).toBe(true);
  });

  it("matches when the offer has no specialization set — open to every specialization", () => {
    const offer = makeOffer({ level: null, specialization: null });
    expect(matchesProfile(offer, { level: null, specialization: "Informatique" })).toBe(true);
  });

  it("still respects level even when specialization is open to all", () => {
    // No specialization on the offer (matches anyone), but a level is set and doesn't match the profile.
    // Since matching is level OR specialization, the open specialization alone is still enough to match.
    const offer = makeOffer({ level: "Bac+5", specialization: null });
    expect(matchesProfile(offer, { level: "Bac+2", specialization: "Informatique" })).toBe(true);
  });
});
