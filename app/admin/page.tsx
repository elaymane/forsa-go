import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { LayoutGrid, Globe2, Lock, Plus, FileSpreadsheet, Table2, Building2, ArrowRight, Pencil, Users } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import OpportunityForm from "@/components/admin/OpportunityForm";
import ExcelImportForm from "@/components/admin/ExcelImportForm";
import CommunitySubmissions from "@/components/admin/CommunitySubmissions";
import AuditLogPanel from "@/components/admin/AuditLogPanel";
import DuplicatesPanel from "@/components/admin/DuplicatesPanel";
import ExportBackupButton from "@/components/admin/ExportBackupButton";
import ImportBackupButton from "@/components/admin/ImportBackupButton";
import ClearOpportunitiesButton from "@/components/admin/ClearOpportunitiesButton";
import DeleteOpportunityButton from "@/components/admin/DeleteOpportunityButton";
import AnalyticsPanel from "@/components/admin/AnalyticsPanel";
import SubscriptionRequests from "@/components/admin/SubscriptionRequests";
import { Badge } from "@/components/ui/Badge";
import { getOpportunities, getPrivateSubmissions, findDuplicateOpportunities } from "@/lib/db/opportunities";
import { getRecentAuditLog } from "@/lib/db/auditLog";
import { getAllOrganizationProfiles } from "@/lib/db/organizationProfiles";
import { getAnalyticsSnapshot, getWeeklyVisitorTrend } from "@/lib/db/analytics";
import { getPendingSubscriptionRequests } from "@/lib/db/auth";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { summarizeOrganizations } from "@/lib/organizations";
import { getLocale } from "@/lib/i18n/getLocale";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  tone = "purple",
}: {
  icon: typeof Plus;
  title: string;
  subtitle: string;
  tone?: "purple" | "emerald" | "indigo" | "slate";
}) {
  const toneClass = {
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300",
    slate: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  }[tone];

  return (
    <div className="mb-5 flex items-center gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon size={18} />
      </div>
      <div>
        <h2 className="font-bold">{title}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

const TYPE_TONE: Record<string, "primary" | "success" | "info" | "warning" | "neutral"> = {
  Concours: "primary",
  Job: "success",
  Internship: "info",
  Training: "warning",
  Scholarship: "warning",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  const [opportunities, submissions, profiles, notifications, analyticsSnapshot, visitorTrend, subscriptionRequests, locale, duplicateGroups, auditLog] = await Promise.all([
    getOpportunities(),
    getPrivateSubmissions(),
    getAllOrganizationProfiles(),
    getNotifications(user.id),
    getAnalyticsSnapshot(),
    getWeeklyVisitorTrend(),
    getPendingSubscriptionRequests(),
    getLocale(),
    findDuplicateOpportunities(),
    getRecentAuditLog(),
  ]);

  const publicCount = opportunities.filter((o) => o.isPublic !== false).length;
  const derivedNames = summarizeOrganizations(opportunities).map((o) => o.name);
  const profileNames = Object.values(profiles).map((p) => p.name);
  const organizationSuggestions = Array.from(new Set([...derivedNames, ...profileNames])).sort();

  return (
    <AppShell
      title="Admin"
      subtitle="Manage every opportunity on Forsa Go"
      notifications={notifications}
      user={user}
      isAdmin
      locale={locale}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <ExportBackupButton />
          <ImportBackupButton />
        </div>
        <ClearOpportunitiesButton totalCount={opportunities.length} />
      </div>

      <AnalyticsPanel snapshot={analyticsSnapshot} trend={visitorTrend} />

      <SubscriptionRequests requests={subscriptionRequests} />

      <DuplicatesPanel groups={duplicateGroups} />

      <AuditLogPanel entries={auditLog} />

      {/* OVERVIEW */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-3xl border border-black/10 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm dark:border-white/10 dark:from-purple-500/10 dark:to-white/5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
            <LayoutGrid size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold">{opportunities.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total opportunities</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-black/10 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm dark:border-white/10 dark:from-emerald-500/10 dark:to-white/5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
            <Globe2 size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold">{publicCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Live and public</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-black/10 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm dark:border-white/10 dark:from-amber-500/10 dark:to-white/5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
            <Lock size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold">{submissions.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting review</p>
          </div>
        </div>
      </div>

      {/* ADD OPPORTUNITIES */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-black/10 bg-white/60 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <SectionHeader icon={Plus} title="Add one opportunity" subtitle="Fill in a single listing by hand" tone="purple" />
          <OpportunityForm organizationSuggestions={organizationSuggestions} />
        </div>

        <div className="rounded-3xl border border-black/10 bg-white/60 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <SectionHeader
            icon={FileSpreadsheet}
            title="Import from Excel"
            subtitle="Add many opportunities at once"
            tone="indigo"
          />
          <ExcelImportForm />
        </div>
      </div>

      <CommunitySubmissions submissions={submissions} organizationSuggestions={organizationSuggestions} />

      <Link
        href="/admin/organizations"
        className="flex items-center gap-4 rounded-3xl border border-black/10 bg-gradient-to-r from-slate-50 to-white p-5 shadow-sm transition hover:scale-[1.005] dark:border-white/10 dark:from-white/5 dark:to-white/[0.02]"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
          <Building2 size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Manage organizations</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Set logos, descriptions and websites for ENSAM, OFPPT, and everyone else
          </p>
        </div>
        <ArrowRight size={16} className="shrink-0 text-gray-400" />
      </Link>

      <Link
        href="/admin/users"
        className="flex items-center gap-4 rounded-3xl border border-black/10 bg-gradient-to-r from-purple-50 to-white p-5 shadow-sm transition hover:scale-[1.005] dark:border-white/10 dark:from-purple-500/10 dark:to-white/[0.02]"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
          <Users size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Manage users</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Search anyone and activate their subscription — for payments received directly, not just requests
          </p>
        </div>
        <ArrowRight size={16} className="shrink-0 text-gray-400" />
      </Link>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/60 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-3 border-b border-black/10 px-6 py-5 dark:border-white/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
            <Table2 size={18} />
          </div>
          <div>
            <h2 className="font-bold">All opportunities</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{opportunities.length} total, live data</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/[0.02] text-xs uppercase tracking-wide text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 font-semibold">Title</th>
                <th className="px-6 py-3 font-semibold">Organization</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Level</th>
                <th className="px-6 py-3 font-semibold">Specialization</th>
                <th className="px-6 py-3 font-semibold">Grade</th>
                <th className="px-6 py-3 font-semibold">Positions</th>
                <th className="px-6 py-3 font-semibold">Deadline</th>
                <th className="px-6 py-3 font-semibold">Written exam</th>
                <th className="px-6 py-3 font-semibold">Oral exam</th>
                <th className="px-6 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-black/5 transition hover:bg-purple-500/[0.03] dark:border-white/5 dark:hover:bg-purple-500/[0.06]"
                >
                  <td className="px-6 py-3.5 font-medium">
                    <div className="flex items-center gap-2">
                      <img src={o.image} alt="" loading="lazy" decoding="async" className="h-7 w-7 shrink-0 rounded-lg object-cover" />
                      {o.title}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-gray-500 dark:text-gray-400">{o.organization}</td>
                  <td className="px-6 py-3.5">
                    <Badge tone={TYPE_TONE[o.type] ?? "neutral"} className="px-2 py-0.5 text-[11px]">
                      {o.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5">{o.level ?? "—"}</td>
                  <td className="px-6 py-3.5">{o.specialization ?? "—"}</td>
                  <td className="px-6 py-3.5">{o.grade ?? "—"}</td>
                  <td className="px-6 py-3.5">{o.positionsCount ?? "—"}</td>
                  <td className="px-6 py-3.5">{o.deadlineDate ? o.date : "Unknown"}</td>
                  <td className="px-6 py-3.5">{o.examDate ? o.examDate : "Unknown"}</td>
                  <td className="px-6 py-3.5">{o.oralExamDate ? o.oralExamDate : "Unknown"}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/opportunities/${o.id}/edit`}
                        className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:underline dark:text-purple-400"
                      >
                        <Pencil size={12} /> Edit
                      </Link>
                      <DeleteOpportunityButton id={o.id} title={o.title} compact />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
