import type { Metadata } from "next";
import { FacetedOpportunitiesPage, generateFacetMetadata } from "@/components/facets/FacetedOpportunitiesPage";
import { TYPE_ROUTES } from "@/lib/facetRoutes";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeURIComponent(city);
  return generateFacetMetadata({ ...TYPE_ROUTES["trainings"], city: cityName, path: `/trainings/${city}` });
}

export default async function Page({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const cityName = decodeURIComponent(city);
  return (
    <FacetedOpportunitiesPage
      config={{ ...TYPE_ROUTES["trainings"], city: cityName, path: `/trainings/${city}` }}
    />
  );
}
