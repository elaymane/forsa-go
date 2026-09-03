import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { MapPin, Calendar, Clock, Building2, ArrowLeft, ExternalLink, GraduationCap, Layers, Award, Users2, Briefcase, Eye, Tag } from "lucide-react";
import { parseCities } from "@/lib/cities";
import AppShell from "@/components/layout/AppShell";
import PublicShell from "@/components/layout/PublicShell";
import ApplyActions from "@/components/opportunities/ApplyActions";
import ShareButton from "@/components/opportunities/ShareButton";
import MultiProfileSection from "@/components/opportunities/MultiProfileSection";
import DescriptionSection from "@/components/opportunities/DescriptionSection";
import InterestedSaveCard from "@/components/opportunities/InterestedSaveCard";
import TrustBadgesFooter from "@/components/opportunities/TrustBadgesFooter";
import { getOrganizationProfile } from "@/lib/db/organizationProfiles";
import { Badge } from "@/components/ui/Badge";
import { getOpportunityById } from "@/lib/db/opportunities";
import { getOpportunityViewCounts } from "@/lib/db/analytics";
import { getApplicationsMap, type ApplicationState } from "@/lib/db/applications";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { slugifyOrganization } from "@/lib/organizations";
import { trackPageView } from "@/lib/analytics";
import { getLocale } from "@/lib/i18n/getLocale";
import OpportunityViewTracker from "@/components/analytics/OpportunityViewTracker";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const offer = await getOpportunityById(id);
  if (!offer || !offer.isPublic) return { title: "Opportunity" };

  const title = `${offer.title} — ${offer.organization}`;
  const description =
    offer.description ||
    `${offer.title} at ${offer.organization}, ${offer.location}. ${offer.deadline}. Track it on Forsa Go.`;

  return {
    title,
    description,
    keywords: offer.keywords ? offer.keywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined,
    alternates: { canonical: `/opportunities/${id}` },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  Job: "FULL_TIME",
  Internship: "INTERN",
  Training: "OTHER",
};

function buildEducationEventJsonLd(offer: Awaited<ReturnType<typeof getOpportunityById>>, siteUrl: string) {
  if (!offer) return null;
  // EducationEvent is for the concours exam itself — only emit it when we
  // have a real exam date to anchor it to. A concours with no known date
  // yet isn't a schedulable event, and Google penalizes structured data
  // that doesn't match what's actually verifiable on the page.
  if (offer.type !== "Concours") return null;
  if (!offer.examDate) return null;
  if (offer.status === "closed") return null;

  return {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: offer.title,
    description: offer.description || `${offer.title} — ${offer.organization}, ${offer.location}.`,
    startDate: offer.examDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: offer.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: offer.location,
        addressCountry: "MA",
      },
    },
    organizer: {
      "@type": "Organization",
      name: offer.organization,
      sameAs: offer.website || undefined,
    },
    url: `${siteUrl}/opportunities/${offer.id}`,
  };
}

function buildJobPostingJsonLd(offer: Awaited<ReturnType<typeof getOpportunityById>>, siteUrl: string) {
  if (!offer) return null;
  // JobPosting schema is specifically for employment — using it for a school
  // admission concours or a scholarship would be inaccurate markup, which
  // Google explicitly penalizes (mismatched visible-vs-structured data).
  const employmentType = EMPLOYMENT_TYPE_MAP[offer.type];
  if (!employmentType) return null;
  // Expired listings with active JobPosting schema damage a domain's
  // trust score with Google Jobs over time — never emit it once closed.
  if (offer.status === "closed") return null;

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: offer.title,
    description: offer.description || `${offer.title} at ${offer.organization}, ${offer.location}.`,
    datePosted: offer.createdAt,
    validThrough: offer.deadlineDate || undefined,
    employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: offer.organization,
      sameAs: offer.website || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: offer.location,
        addressCountry: "MA",
      },
    },
    directApply: false,
    url: `${siteUrl}/opportunities/${offer.id}`,
  };
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  await trackPageView(`/opportunities/${id}`, user?.id ?? null);

  const offer = await getOpportunityById(id);
  if (!offer || !offer.isPublic) notFound();

  const [applicationsMap, orgProfile] = await Promise.all([
    user ? getApplicationsMap(user.id) : Promise.resolve({} as Record<string, ApplicationState>),
    getOrganizationProfile(slugifyOrganization(offer.organization)),
  ]);
  const applicationState = applicationsMap[offer.id];
  const isClosed = offer.status === "closed";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const jobPostingJsonLd = buildJobPostingJsonLd(offer, siteUrl);
  const educationEventJsonLd = buildEducationEventJsonLd(offer, siteUrl);
  const locale = await getLocale();
  const viewCounts = await getOpportunityViewCounts([offer.id]);
  const viewCount = viewCounts[offer.id];

  const backLink = (
    <Link
      href="/opportunities"
      className="mb-4 flex w-fit items-center gap-1 text-sm text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
    >
      <ArrowLeft size={15} /> All opportunities
    </Link>
  );

  const content = (
    <div className="mx-auto max-w-6xl">
      <OpportunityViewTracker
        opportunity={{
          id: offer.id,
          title: offer.title,
          type: offer.type,
          organization: offer.organization,
          location: offer.location,
        }}
      />
      {backLink}
      <div className="rounded-3xl border border-black/10 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-1 flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
              <img src={offer.image} alt={`Logo ${offer.organization}`} className="h-full w-full object-contain p-3" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <Badge tone={isClosed ? "danger" : "success"}>{isClosed ? "Closed" : "Open"}</Badge>
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">{offer.title}</h1>
              <Link
                href={`/organizations/${slugifyOrganization(offer.organization)}`}
                className="mt-2 flex w-fit items-center gap-1.5 text-sm text-purple-600 hover:underline dark:text-purple-400"
              >
                <Building2 size={14} /> {offer.organization}
              </Link>

              {offer.description && (
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{offer.description}</p>
              )}
            </div>
          </div>

          <div className="lg:w-72 lg:shrink-0">
            <InterestedSaveCard offer={offer} applicationState={applicationState} guestMode={!user} />
          </div>
        </div>

        {/* ROW 1 — DATES, given real visual weight since this drives action */}
        <div
          className={`relative mt-4 overflow-hidden rounded-2xl border p-4 ${
            isClosed
              ? "border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:border-red-500/25 dark:from-red-500/[0.08] dark:to-rose-500/[0.04]"
              : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-500/25 dark:from-emerald-500/[0.08] dark:to-teal-500/[0.04]"
          }`}
        >
          <Clock
            size={72}
            className={`pointer-events-none absolute -right-3 -top-3 ${
              isClosed ? "text-red-900/[0.04] dark:text-white/[0.04]" : "text-emerald-900/[0.04] dark:text-white/[0.04]"
            }`}
          />
          <div className="no-scrollbar relative flex items-center gap-4 overflow-x-auto">
            <div className="flex shrink-0 items-center gap-2.5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isClosed
                    ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                }`}
              >
                <Clock size={18} />
              </div>
              <div>
                <p className={`text-[11px] font-medium ${isClosed ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  Deadline
                </p>
                <p className="text-sm font-bold">{offer.deadline}</p>
              </div>
            </div>

            {offer.deadlineDate && offer.date && offer.date !== offer.deadline && (
              <div className="flex shrink-0 items-center gap-2.5 border-l border-black/10 pl-4 dark:border-white/10">
                <Calendar size={16} className="text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300">{offer.date}</p>
              </div>
            )}

            <div className="flex shrink-0 items-center gap-2.5 border-l border-black/10 pl-4 dark:border-white/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300">
                <Tag size={18} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400">Type</p>
                <p className="text-sm font-bold">{offer.type}</p>
              </div>
            </div>

            {offer.contractType && (
              <div className="flex shrink-0 items-center gap-2.5 border-l border-black/10 pl-4 dark:border-white/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
                  <Briefcase size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-purple-500 dark:text-purple-400">Contrat</p>
                  <p className="text-sm font-bold">{offer.contractType}</p>
                </div>
              </div>
            )}

            {offer.positionsCount && (
              <div className="flex shrink-0 items-center gap-2.5 border-l border-black/10 pl-4 dark:border-white/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                  <Users2 size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-blue-500 dark:text-blue-400">Postes</p>
                  <p className="text-sm font-bold">{offer.positionsCount}</p>
                </div>
              </div>
            )}

            {offer.specialization && (
              <div className="flex shrink-0 items-center gap-2.5 border-l border-black/10 pl-4 dark:border-white/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
                  <Layers size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-amber-500 dark:text-amber-400">Spécialité</p>
                  <p className="text-sm font-bold">{offer.specialization}</p>
                </div>
              </div>
            )}

            {viewCount != null && (
              <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
                <Eye size={16} /> {viewCount}
              </div>
            )}
          </div>
        </div>

        {/* ROW 1.5 — NIVEAU — Type, Contract Type, Positions, and Specialty
            now live in the dates row above, filling what used to be empty
            space there */}
        {offer.level && (
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {offer.level &&
              offer.level
                .split(",")
                .map((l) => l.trim())
                .filter(Boolean)
                .map((l) => (
                  <span
                    key={l}
                    className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300"
                  >
                    <GraduationCap size={14} /> {l}
                  </span>
                ))}
            {offer.positionsCount && (
              <span className="flex items-center gap-2 rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <Users2 size={14} /> {offer.positionsCount} position{offer.positionsCount === 1 ? "" : "s"}
              </span>
            )}
          </div>
        )}

        {/* ROW 2 — LOCATION(S) */}
        {parseCities(offer.location).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {parseCities(offer.location).map((city) => (
              <Link
                key={city}
                href={`/cities/${encodeURIComponent(city)}`}
                className="flex items-center gap-2 rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 dark:border-white/10 dark:bg-white/5 dark:hover:border-purple-500/40 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
              >
                <MapPin size={14} />
                {city}
              </Link>
            ))}
          </div>
        )}

        {offer.profiles && offer.profiles.length > 0 ? (
          <div className="mt-5">
            <MultiProfileSection profiles={offer.profiles} locale={locale} />
          </div>
        ) : (
          offer.description && (
            <div className="mt-5">
              <DescriptionSection description={offer.description} />
            </div>
          )
        )}

        {/* ROW 4 — GRADE — Spécialité now lives in the dates row above */}
        {!offer.profiles?.length && offer.grade && (
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {offer.grade && (
              <span className="flex items-center gap-2 rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <Award size={14} />
                {offer.grade}
              </span>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <ApplyActions offer={offer} applicationState={applicationState} guestMode={!user} />
          <ShareButton title={offer.title} organization={offer.organization} />
          {offer.website && (
            <a
              href={offer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
            >
              Apply on site <ExternalLink size={14} />
            </a>
          )}
        </div>

        {orgProfile?.description && (
          <div className="mt-6 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-5 dark:border-purple-500/20 dark:from-purple-500/10 dark:to-indigo-500/10">
            <p className="mb-1 text-sm font-bold">Why {offer.organization}?</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{orgProfile.description}</p>
          </div>
        )}
      </div>

      <TrustBadgesFooter />
    </div>
  );

  if (!user) {
    return (
      <PublicShell title={offer.title} subtitle={offer.organization} locale={locale}>
        {jobPostingJsonLd && (
          <Script
            id="jobposting-jsonld-guest"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
          />
        )}
        {educationEventJsonLd && (
          <Script
            id="educationevent-jsonld-guest"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(educationEventJsonLd) }}
          />
        )}
        {content}
      </PublicShell>
    );
  }

  const notifications = await getNotifications(user.id);
  return (
    <AppShell title={offer.title} notifications={notifications} user={user} isAdmin={isAdminEmail(user.email)} locale={locale}>
      {jobPostingJsonLd && (
        <Script
          id="jobposting-jsonld-app"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
        />
      )}
      {educationEventJsonLd && (
        <Script
          id="educationevent-jsonld-app"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(educationEventJsonLd) }}
        />
      )}
      {content}
    </AppShell>
  );
}
