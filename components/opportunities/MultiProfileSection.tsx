"use client";

import { useState } from "react";
import {
  Briefcase,
  MapPin,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Layers,
  Users2,
  ListChecks,
  UserCheck,
  LayoutGrid,
  List,
} from "lucide-react";
import type { OpportunityProfile } from "@/types/opportunity";
import { t, type Locale } from "@/lib/i18n/translations";

// Rotating palette so each profile gets its own visual identity instead of
// every card looking identical — purely cosmetic, cycles through regardless
// of how many profiles there are.
const PALETTE = [
  {
    icon: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300",
    ring: "border-purple-400 dark:border-purple-500/50",
    top: "bg-purple-500",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  {
    icon: "bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300",
    ring: "border-teal-400 dark:border-teal-500/50",
    top: "bg-teal-500",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
    dot: "bg-teal-500",
  },
  {
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300",
    ring: "border-amber-400 dark:border-amber-500/50",
    top: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  {
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
    ring: "border-blue-400 dark:border-blue-500/50",
    top: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  {
    icon: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300",
    ring: "border-rose-400 dark:border-rose-500/50",
    top: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
    dot: "bg-rose-500",
  },
];

function ProfileDetail({ profile, tone }: { profile: OpportunityProfile; tone: (typeof PALETTE)[number] }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
      <div className="mb-4 flex items-center gap-3 border-b border-black/5 pb-4 dark:border-white/5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
          <Briefcase size={19} />
        </div>
        <div>
          <h3 className="text-lg font-bold">{profile.title}</h3>
          {profile.location && (
            <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={11} /> {profile.location}
            </p>
          )}
        </div>
      </div>

      {profile.missions.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-purple-500">
            <ListChecks size={13} /> Missions principales
          </p>
          <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {profile.missions.map((mission, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-purple-500" />
                <span>{mission}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(profile.level || profile.positionsCount || profile.requirements.length > 0) && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-purple-500">
            <UserCheck size={13} /> Profil recherché
          </p>
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {profile.level && (
              <div className="rounded-xl bg-black/[0.03] p-2.5 dark:bg-white/5">
                <p className="flex items-center gap-1 text-[10px] text-gray-400">
                  <GraduationCap size={11} /> Niveau
                </p>
                <p className="text-sm font-semibold">{profile.level}</p>
              </div>
            )}
            {profile.specialty && (
              <div className="rounded-xl bg-black/[0.03] p-2.5 dark:bg-white/5">
                <p className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Layers size={11} /> Spécialité
                </p>
                <p className="text-sm font-semibold">{profile.specialty}</p>
              </div>
            )}
            {profile.positionsCount && (
              <div className="rounded-xl bg-black/[0.03] p-2.5 dark:bg-white/5">
                <p className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Users2 size={11} /> Postes
                </p>
                <p className="text-sm font-semibold">{profile.positionsCount}</p>
              </div>
            )}
          </div>
          {profile.requirements.length > 0 && (
            <div className="space-y-1.5">
              {profile.requirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MultiProfileSection({ profiles, locale }: { profiles: OpportunityProfile[]; locale: Locale }) {
  const i = t(locale).multiProfileSection;
  const [view, setView] = useState<"cards" | "list">("cards");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex !== null ? profiles[selectedIndex] : null;
  const selectedTone = PALETTE[(selectedIndex ?? 0) % PALETTE.length];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-purple-500">
          <Briefcase size={13} /> {profiles.length} {i.profilesAvailable}
        </p>
        <div className="flex rounded-xl border border-black/10 bg-white/60 p-1 dark:border-white/10 dark:bg-white/5">
          <button
            onClick={() => setView("cards")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              view === "cards" ? "bg-purple-500 text-white" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <LayoutGrid size={13} /> Cartes
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              view === "list" ? "bg-purple-500 text-white" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <List size={13} /> Liste
          </button>
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile, idx) => {
            const tone = PALETTE[idx % PALETTE.length];
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                onClick={() => setSelectedIndex(isSelected ? null : idx)}
                className={`flex flex-col overflow-hidden rounded-2xl border bg-white/60 text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-white/5 ${
                  isSelected ? tone.ring : "border-black/10 dark:border-white/10"
                }`}
              >
                <div className={`h-1 ${tone.top}`} />
                <div className="flex flex-1 flex-col p-4">
                  <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${tone.icon}`}>
                    <Briefcase size={18} />
                  </div>
                  <h3 className="font-bold leading-snug">{profile.title}</h3>
                  {profile.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin size={11} /> {profile.location}
                    </p>
                  )}
                  {(profile.level || profile.specialty) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {profile.level && (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.badge}`}>{profile.level}</span>
                      )}
                    </div>
                  )}
                  {profile.specialty && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`} /> {profile.specialty}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-3 mt-4 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Users2 size={13} />
                      <span>
                        Poste
                        <br />
                        {profile.positionsCount ?? 1} position{(profile.positionsCount ?? 1) === 1 ? "" : "s"}
                      </span>
                    </div>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${tone.icon} ${isSelected ? "rotate-90" : ""}`}>
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {profiles.map((profile, idx) => {
            const tone = PALETTE[idx % PALETTE.length];
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                onClick={() => setSelectedIndex(isSelected ? null : idx)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  isSelected ? `${tone.ring} bg-purple-50/50 dark:bg-purple-500/5` : "border-black/10 bg-white/60 hover:border-purple-200 dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
                  <Briefcase size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{profile.title}</p>
                  {profile.location && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin size={11} /> {profile.location}
                    </p>
                  )}
                </div>
                <ChevronRight size={16} className={`shrink-0 text-gray-400 transition ${isSelected ? "rotate-90" : ""}`} />
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        {selected ? (
          <ProfileDetail profile={selected} tone={selectedTone} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/10 py-8 text-center dark:border-white/10">
            <Sparkles size={22} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{i.selectProfile}</p>
          </div>
        )}
      </div>
    </div>
  );
}
