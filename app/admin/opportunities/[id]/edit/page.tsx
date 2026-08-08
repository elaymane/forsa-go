import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import OpportunityForm from "@/components/admin/OpportunityForm";
import DeleteOpportunityButton from "@/components/admin/DeleteOpportunityButton";
import { getOpportunityById, getOpportunities } from "@/lib/db/opportunities";
import { getAllOrganizationProfiles } from "@/lib/db/organizationProfiles";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { summarizeOrganizations } from "@/lib/organizations";
import { updateOpportunityAction } from "@/app/admin/actions";
import { getLocale } from "@/lib/i18n/getLocale";

export const metadata: Metadata = {
  title: "Edit Opportunity",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  const [offer, allOpportunities, profiles, notifications, locale] = await Promise.all([
    getOpportunityById(id),
    getOpportunities(),
    getAllOrganizationProfiles(),
    getNotifications(user.id),
    getLocale(),
  ]);

  if (!offer) notFound();

  const derivedNames = summarizeOrganizations(allOpportunities).map((o) => o.name);
  const profileNames = Object.values(profiles).map((p) => p.name);
  const organizationSuggestions = Array.from(new Set([...derivedNames, ...profileNames])).sort();

  const boundUpdate = updateOpportunityAction.bind(null, id);

  return (
    <AppShell title="Edit Opportunity" notifications={notifications} user={user} isAdmin locale={locale}>
      <Link href="/admin" className="flex w-fit items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
        <ArrowLeft size={14} /> Back to admin
      </Link>

      <div className="max-w-3xl rounded-3xl border border-black/10 bg-white/60 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="font-bold">{offer.title}</h1>
          <DeleteOpportunityButton id={offer.id} title={offer.title} redirectAfter="/admin" />
        </div>
        <OpportunityForm
          action={boundUpdate}
          initialValues={offer}
          submitLabel="Save changes"
          organizationSuggestions={organizationSuggestions}
        />
      </div>
    </AppShell>
  );
}
