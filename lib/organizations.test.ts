import { describe, it, expect } from "vitest";
import { slugifyOrganization, summarizeOrganizations, getOrganizationOpportunities } from "./organizations";
import type { Opportunity } from "@/types/opportunity";

function makeOffer(overrides: Partial<Opportunity>): Opportunity {
  return {
    id: overrides.id ?? "offer",
    title: "Test",
    organization: "ENSAM",
    location: "Casablanca",
    type: "Concours",
    status: "open",
    deadline: "Date unknown",
    daysLeft: 0,
    date: "Date unknown",
    description: "",
    tags: [],
    image: "img.png",
    ...overrides,
  };
}

describe("slugifyOrganization", () => {
  it("produces the same slug regardless of casing", () => {
    expect(slugifyOrganization("ENSAM")).toBe(slugifyOrganization("ensam"));
  });

  it("strips accents (École → Ecole)", () => {
    expect(slugifyOrganization("École Nationale")).toBe("ecole-nationale");
  });

  it("collapses spaces and punctuation into single dashes", () => {
    expect(slugifyOrganization("Bank  Al-Maghrib")).toBe("bank-al-maghrib");
  });
});

describe("summarizeOrganizations", () => {
  it("groups multiple offers from the same organization into one summary", () => {
    const offers = [
      makeOffer({ id: "1", organization: "ENSAM", location: "Rabat" }),
      makeOffer({ id: "2", organization: "ENSAM", location: "Agadir" }),
      makeOffer({ id: "3", organization: "OFPPT", location: "Casablanca" }),
    ];
    const summaries = summarizeOrganizations(offers);
    expect(summaries).toHaveLength(2);

    const ensam = summaries.find((s) => s.slug === "ensam");
    expect(ensam?.total).toBe(2);
    expect(ensam?.locations.sort()).toEqual(["Agadir", "Rabat"]);
  });

  it("counts only open offers toward the open count", () => {
    const offers = [
      makeOffer({ id: "1", organization: "ENSAM", status: "open" }),
      makeOffer({ id: "2", organization: "ENSAM", status: "closed" }),
    ];
    const [ensam] = summarizeOrganizations(offers);
    expect(ensam.total).toBe(2);
    expect(ensam.open).toBe(1);
  });
});

describe("getOrganizationOpportunities", () => {
  it("returns only offers matching the given slug", () => {
    const offers = [
      makeOffer({ id: "1", organization: "ENSAM" }),
      makeOffer({ id: "2", organization: "OFPPT" }),
    ];
    const result = getOrganizationOpportunities(offers, "ensam");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});
