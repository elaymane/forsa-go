"use client";

import { useState } from "react";
import { useActionState } from "react";
import { ChevronDown, Loader2, Building2 } from "lucide-react";
import { updateOrganizationProfileAction, type AdminFormState } from "@/app/admin/actions";
import type { OrganizationSummary } from "@/lib/organizations";
import type { OrganizationProfile } from "@/lib/db/organizationProfiles";
import CreateOrganizationButton from "./CreateOrganizationButton";
import RemoveOrganizationButton from "./RemoveOrganizationButton";

const initialState: AdminFormState = {};
const inputClass =
  "w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5";
const labelClass = "mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400";

function OrgEditForm({ org, profile }: { org: OrganizationSummary; profile?: OrganizationProfile }) {
  const [state, formAction, isPending] = useActionState(updateOrganizationProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4 border-t border-black/5 p-5 dark:border-white/5">
      <input type="hidden" name="slug" value={org.slug} />
      <input type="hidden" name="name" value={org.name} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Logo — paste a link, or upload a file (upload wins if both)</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input name="logo" type="url" defaultValue={profile?.logo ?? ""} className={inputClass} placeholder="https://..." />
            <input
              name="logoFile"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-purple-700 hover:file:bg-purple-200 dark:text-gray-300 dark:file:bg-purple-500/20 dark:file:text-purple-300"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Leave both blank to keep using the auto-picked image from one of their opportunities.
          </p>
        </div>

        <div>
          <label className={labelClass}>Official website</label>
          <input name="website" type="url" defaultValue={profile?.website ?? ""} className={inputClass} placeholder="https://..." />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={profile?.description ?? ""}
          className={inputClass}
          placeholder="A short line about this organization"
        />
      </div>

      <div>
        <label className={labelClass}>SEO keywords (comma-separated)</label>
        <input
          name="keywords"
          defaultValue={profile?.keywords ?? ""}
          className={inputClass}
          placeholder="e.g. concours OFPPT, formation professionnelle Maroc"
        />
        <p className="mt-1 text-xs text-gray-400">Helps this organization's page rank for these searches.</p>
      </div>

      <div>
        <label className={labelClass}>Page label (Recrutement / Concours et admissions)</label>
        <select name="typeLabelOverride" defaultValue={profile?.typeLabelOverride ?? ""} className={inputClass}>
          <option value="">Auto — based on their most common opportunity type</option>
          <option value="Recrutement">Recrutement</option>
          <option value="Concours et admissions">Concours et admissions</option>
        </select>
        <p className="mt-1 text-xs text-gray-400">
          Overrides the auto-picked label on their page title and heading. Leave on Auto unless it's genuinely wrong.
        </p>
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
          {state.success}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:opacity-60"
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          Save
        </button>
        <RemoveOrganizationButton slug={org.slug} name={org.name} />
      </div>
    </form>
  );
}

interface OrganizationsManagerProps {
  organizations: OrganizationSummary[];
  profiles: Record<string, OrganizationProfile>;
}

export default function OrganizationsManager({ organizations, profiles }: OrganizationsManagerProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/60 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-6 py-5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="font-bold">Organizations ({organizations.length})</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Set a proper logo, description, and website for each — otherwise they use auto-picked defaults.
            </p>
          </div>
        </div>
        <CreateOrganizationButton />
      </div>

      <div className="divide-y divide-black/5 dark:divide-white/5">
        {organizations.map((org) => {
          const profile = profiles[org.slug];
          const isOpen = openSlug === org.slug;

          return (
            <div key={org.slug}>
              <button
                onClick={() => setOpenSlug(isOpen ? null : org.slug)}
                className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition hover:bg-black/[0.02] dark:hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={profile?.logo || org.image}
                    alt={`Logo ${org.name}`}
                    className="h-10 w-10 shrink-0 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {org.total} opportunit{org.total === 1 ? "y" : "ies"}
                      {profile ? " · profile set" : " · using defaults"}
                    </p>
                  </div>
                </div>
                <ChevronDown size={16} className={`shrink-0 text-gray-400 transition ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && <OrgEditForm org={org} profile={profile} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
