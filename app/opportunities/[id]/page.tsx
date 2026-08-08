import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Calendar, Clock, Building2, ArrowLeft, ExternalLink } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PublicShell from "@/components/layout/PublicShell";
import ApplyActions from "@/components/opportunities/ApplyActions";
import { Badge } from "@/components/ui/Badge";
import { getOpportunityById } from "@/lib/db/opportunities";
import { getApplicationsMap } from "@/lib/db/applications";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { slugifyOrganization } from "@/lib/organizations";
import { trackPageView } from "@/lib/analytics";
import { getLocale } from "@/lib/i18n/getLocale";

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

  const applicationsMap = user ? await getApplicationsMap(user.id) : {};
  const applicationState = applicationsMap[offer.id];
  const isClosed = offer.status === "closed";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jobPostingJsonLd = buildJobPostingJsonLd(offer, siteUrl);

  const backLink = (
    <Link
      href="/opportunities"
      className="mb-4 flex w-fit items-center gap-1 text-sm text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
    >
      <ArrowLeft size={15} /> All opportunities
    </Link>
  );

  const content = (
    <div className="mx-auto max-w-2xl">
      {backLink}
      <div className="rounded-3xl border border-black/10 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5 sm:p-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={isClosed ? "danger" : "success"}>{isClosed ? "Closed" : "Open"}</Badge>
          <Badge tone="neutral">{offer.type}</Badge>
          {offer.level && <Badge tone="info">{offer.level}</Badge>}
        </div>

        <h1 className="text-2xl font-bold sm:text-3xl">{offer.title}</h1>
        <Link
          href={`/organizations/${slugifyOrganization(offer.organization)}`}
          className="mt-2 flex w-fit items-center gap-1.5 text-sm text-purple-600 hover:underline dark:text-purple-400"
        >
          <Building2 size={14} /> {offer.organization}
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {offer.location}
          </span>
          {offer.deadlineDate && (
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {offer.date}
            </span>
          )}
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Clock size={14} /> {offer.deadline}
          </span>
        </div>

        {offer.description && (
          <p className="mt-5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{offer.description}</p>
        )}

        {offer.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {offer.tags.map((tag) => (
              <Badge key={tag} tone="neutral" className="px-2 py-0.5 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ApplyActions offer={offer} applicationState={applicationState} guestMode={!user} />
          {offer.website && (
            <a
              href={offer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
            >
              Official site <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  if (!user) {
    const locale = await getLocale();
    return (
      <PublicShell title={offer.title} subtitle={offer.organization} locale={locale}>
        {jobPostingJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
          />
        )}
        {content}
      </PublicShell>
    );
  }

  const [notifications, locale] = await Promise.all([getNotifications(user.id), getLocale()]);
  return (
    <AppShell title={offer.title} notifications={notifications} user={user} isAdmin={isAdminEmail(user.email)} locale={locale}>
      {jobPostingJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
        />
      )}
      {content}
    </AppShell>
  );
}
