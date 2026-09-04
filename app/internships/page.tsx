import type { Metadata } from "next";
import { FacetedOpportunitiesPage, generateFacetMetadata } from "@/components/facets/FacetedOpportunitiesPage";
import { TYPE_ROUTES } from "@/lib/facetRoutes";

export const dynamic = "force-dynamic";

const CONFIG = { ...TYPE_ROUTES["internships"], path: "/internships" };

export async function generateMetadata(): Promise<Metadata> {
  return generateFacetMetadata(CONFIG);
}

export default async function Page() {
  return <FacetedOpportunitiesPage config={CONFIG} />;
}
