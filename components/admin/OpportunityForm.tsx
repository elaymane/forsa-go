"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createOpportunityAction, type AdminFormState } from "@/app/admin/actions";
import { EDUCATION_LEVELS } from "@/types/opportunity";
import type { Opportunity, OpportunityProfile } from "@/types/opportunity";
import CityPicker from "./CityPicker";
import SingleCityPicker from "./SingleCityPicker";
import TagPicker from "./TagPicker";
import SingleTagPicker from "./SingleTagPicker";
import { GraduationCap, Layers } from "lucide-react";

const TYPES = ["Concours", "Job", "Internship", "Training", "Scholarship"];

const initialState: AdminFormState = {};

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5";
const labelClass = "mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400";

interface OpportunityFormProps {
  /** Defaults to createOpportunityAction — pass a bound updateOpportunityAction for edit mode. */
  action?: (prevState: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  /** Pre-fills every field — used when editing an existing opportunity. */
  initialValues?: Opportunity;
  submitLabel?: string;
  /** Known organization names, shown as autocomplete suggestions while still allowing a new name. */
  organizationSuggestions?: string[];
  /** Known city names, shown as pickable suggestions in the location field while still allowing a new city. */
  citySuggestions?: string[];
  /** Known education levels (standard + any custom ones already used), pick-existing-or-add-new. */
  levelSuggestions?: string[];
  /** Known specialization values already used elsewhere, pick-existing-or-add-new. */
  specializationSuggestions?: string[];
}

export default function OpportunityForm({
  action = createOpportunityAction,
  initialValues,
  submitLabel = "Add opportunity",
  organizationSuggestions = [],
  citySuggestions = [],
  levelSuggestions = [],
  specializationSuggestions = [],
}: OpportunityFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [profiles, setProfiles] = useState<OpportunityProfile[]>(initialValues?.profiles ?? []);

  const addProfile = () =>
    setProfiles((prev) => [...prev, { title: "", location: "", missions: [], requirements: [] }]);
  const removeProfile = (index: number) => setProfiles((prev) => prev.filter((_, i) => i !== index));
  const updateProfileField = (index: number, field: "title" | "location" | "level" | "specialty", value: string) =>
    setProfiles((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  const updateProfilePositions = (index: number, value: string) =>
    setProfiles((prev) => prev.map((p, i) => (i === index ? { ...p, positionsCount: value ? Number(value) : undefined } : p)));
  const updateProfileList = (index: number, field: "missions" | "requirements", text: string) =>
    setProfiles((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: text.split("\n") } : p))
    );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Title *</label>
          <input
            name="title"
            required
            defaultValue={initialValues?.title}
            className={inputClass}
            placeholder="ENSAM Engineering School"
          />
        </div>
        <div>
          <label className={labelClass}>Organization *</label>
          <input
            name="organization"
            required
            defaultValue={initialValues?.organization}
            list="organization-suggestions"
            autoComplete="off"
            className={inputClass}
            placeholder="Ministry of Higher Education"
          />
          {organizationSuggestions.length > 0 && (
            <datalist id="organization-suggestions">
              {organizationSuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          )}
          <p className="mt-1 text-xs text-gray-400">
            Pick an existing one from the list if it matches, or type a new name — it's created automatically.
          </p>
        </div>
        <div>
          <label className={labelClass}>Location *</label>
          <CityPicker citySuggestions={citySuggestions} defaultValue={initialValues?.location} inputClassName={inputClass} />
          <p className="mt-1 text-xs text-gray-400">
            Pick from your existing cities, or type a new one — it's added automatically.
          </p>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Logo — paste a link, or upload a file (upload wins if both are given)</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input name="image" type="url" defaultValue={initialValues?.image} className={inputClass} placeholder="https://..." />
            <input
              name="logoFile"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-purple-700 hover:file:bg-purple-200 dark:text-gray-300 dark:file:bg-purple-500/20 dark:file:text-purple-300"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">PNG, JPG or WEBP — up to 5MB. Leave both blank to keep the current logo.</p>
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select name="type" className={inputClass} defaultValue={initialValues?.type ?? "Concours"}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Level — select existing or add new (optional)</label>
          <TagPicker
            name="level"
            suggestions={Array.from(new Set([...EDUCATION_LEVELS, ...levelSuggestions]))}
            defaultValue={initialValues?.level ?? ""}
            separator=", "
            inputClassName={inputClass}
            placeholder="Bac+2, Bac+5..."
            icon={GraduationCap}
          />
        </div>
        <div>
          <label className={labelClass}>Written exam date (optional)</label>
          <input name="examDate" type="date" defaultValue={initialValues?.examDate ?? ""} className={inputClass} />
          <p className="mt-1 text-xs text-gray-400">
            Leave blank if unknown — applicants can add their own once they find out.
          </p>
        </div>
        <div>
          <label className={labelClass}>Oral exam date (optional)</label>
          <input name="oralExamDate" type="date" defaultValue={initialValues?.oralExamDate ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Application deadline (optional)</label>
          <input name="deadlineDate" type="date" defaultValue={initialValues?.deadlineDate ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Specialization / تخصص — select existing or add new (optional)</label>
          <TagPicker
            name="specialization"
            suggestions={specializationSuggestions}
            defaultValue={initialValues?.specialization ?? ""}
            separator=", "
            inputClassName={inputClass}
            placeholder="Informatique, Génie Civil..."
            icon={Layers}
          />
          <p className="mt-1 text-xs text-gray-400">
            Pick from existing specializations, or type a new one — it's added automatically.
          </p>
        </div>
        <div>
          <label className={labelClass}>Grade / الدرجة (optional)</label>
          <input name="grade" defaultValue={initialValues?.grade ?? ""} className={inputClass} placeholder="Échelle 10, Cadre..." />
        </div>
        <div>
          <label className={labelClass}>Contract type (optional)</label>
          <select name="contractType" defaultValue={initialValues?.contractType ?? ""} className={inputClass}>
            <option value="">Not specified</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Fonction publique">Fonction publique</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Number of positions / عدد المناصب (optional)</label>
          <input
            name="positionsCount"
            type="number"
            min="1"
            defaultValue={initialValues?.positionsCount ?? ""}
            className={inputClass}
            placeholder="e.g. 25"
          />
        </div>
        <div>
          <label className={labelClass}>Official website (optional)</label>
          <input name="website" type="url" defaultValue={initialValues?.website ?? ""} className={inputClass} placeholder="https://..." />
        </div>
      </div>

      <div>
        <label className={labelClass}>Tags (comma-separated)</label>
        <input name="tags" defaultValue={initialValues?.tags?.join(", ")} className={inputClass} placeholder="Concours, Bac+2, National" />
      </div>

      <div>
        <label className={labelClass}>SEO keywords (comma-separated, optional)</label>
        <input
          name="keywords"
          defaultValue={initialValues?.keywords ?? ""}
          className={inputClass}
          placeholder="e.g. concours ENSA 2026, Cursussup résultats"
        />
        <p className="mt-1 text-xs text-gray-400">Powers this opportunity's own page — helps it get found in search.</p>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initialValues?.description}
          className={inputClass}
          placeholder="What is this opportunity?"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <label className={labelClass}>Multiple profiles (optional)</label>
            <p className="text-xs text-gray-400">
              For a listing covering several distinct roles at once (e.g. one organization posting 3 different jobs)
              — each gets its own title, location and description instead of one combined text block.
            </p>
          </div>
          <button
            type="button"
            onClick={addProfile}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-purple-100 px-2.5 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-200 dark:bg-purple-500/20 dark:text-purple-300"
          >
            <Plus size={13} /> Add profile
          </button>
        </div>

        {profiles.length > 0 && (
          <div className="space-y-3">
            {profiles.map((profile, index) => (
              <div key={index} className="rounded-xl border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Profile {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeProfile(index)}
                    aria-label="Remove profile"
                    className="text-gray-400 transition hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    value={profile.title}
                    onChange={(e) => updateProfileField(index, "title", e.target.value)}
                    className={inputClass}
                    placeholder="Role title, e.g. Chef d'Agence Adjoint"
                  />
                  <SingleCityPicker
                    citySuggestions={citySuggestions}
                    value={profile.location ?? ""}
                    onChange={(val) => updateProfileField(index, "location", val)}
                    className={inputClass}
                    placeholder="Location, e.g. Berkane"
                  />
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <SingleTagPicker
                    suggestions={levelSuggestions}
                    value={profile.level ?? ""}
                    onChange={(val) => updateProfileField(index, "level", val)}
                    className={inputClass}
                    placeholder="Level, e.g. Bac+3"
                    icon={GraduationCap}
                  />
                  <SingleTagPicker
                    suggestions={specializationSuggestions}
                    value={profile.specialty ?? ""}
                    onChange={(val) => updateProfileField(index, "specialty", val)}
                    className={inputClass}
                    placeholder="Specialty, e.g. Finance"
                    icon={Layers}
                  />
                  <input
                    type="number"
                    min={1}
                    value={profile.positionsCount ?? ""}
                    onChange={(e) => updateProfilePositions(index, e.target.value)}
                    className={inputClass}
                    placeholder="Positions"
                  />
                </div>

                <div className="mt-2">
                  <label className="mb-1 block text-xs text-gray-400">Missions — one per line</label>
                  <textarea
                    value={profile.missions.join("\n")}
                    onChange={(e) => updateProfileList(index, "missions", e.target.value)}
                    rows={3}
                    className={inputClass}
                    placeholder={"Gérer le processus de recette et contrôler les opérations financières\nVérifier les fonds et les mouvements de caisse"}
                  />
                </div>

                <div className="mt-2">
                  <label className="mb-1 block text-xs text-gray-400">Profile needed — one per line</label>
                  <textarea
                    value={profile.requirements.join("\n")}
                    onChange={(e) => updateProfileList(index, "requirements", e.target.value)}
                    rows={3}
                    className={inputClass}
                    placeholder={"Bac+3 en gestion ou finance\n2 à 5 ans d'expérience"}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <input type="hidden" name="profiles" value={JSON.stringify(profiles.filter((p) => p.title.trim()))} />
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

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:opacity-60"
      >
        {isPending && <Loader2 size={16} className="animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
