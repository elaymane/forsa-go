import type { Metadata } from "next";
import { FacetedOpportunitiesPage, generateFacetMetadata } from "@/components/facets/FacetedOpportunitiesPage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeURIComponent(city);
  return generateFacetMetadata({ city: cityName, path: `/cities/${city}` });
}

export default async function Page({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const cityName = decodeURIComponent(city);
  return <FacetedOpportunitiesPage config={{ city: cityName, path: `/cities/${city}` }} />;
}
