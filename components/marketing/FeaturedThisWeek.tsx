"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, ChevronLeft, ChevronRight, MapPin, Calendar, Award, Briefcase, FileText, BookOpen, GraduationCap } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import { t, type Locale } from "@/lib/i18n/translations";

const TYPE_ICON: Record<string, typeof Award> = {
  Concours: Award,
  Job: Briefcase,
  Internship: FileText,
  Training: BookOpen,
  Scholarship: GraduationCap,
};

const TYPE_TONE: Record<string, string> = {
  Concours: "bg-purple-600",
  Job: "bg-emerald-600",
  Internship: "bg-blue-600",
  Training: "bg-orange-600",
  Scholarship: "bg-rose-600",
};

export default function FeaturedThisWeek({ opportunities, locale }: { opportunities: Opportunity[]; locale: Locale }) {
  const i = t(locale).featuredThisWeek;
  const typeLabels = t(locale).typeLabels;
  const [page, setPage] = useState(0);

  // Real, honest featured set — the closest-deadline open opportunities,
  // never fabricated or hand-picked.
  const featured = [...opportunities]
    .filter((o) => o.status === "open")
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 8);

  if (featured.length === 0) return null;

  const perPage = 4;
  const totalPages = Math.ceil(featured.length / perPage);
  const visible = featured.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="flex items-center gap-2 text-lg font-bold">
            <Crown size={20} className="text-amber-500" /> {i.title}
          </p>
          <div className="flex items-center gap-2">
            <Link href="/opportunities" className="text-sm font-medium text-purple-600 hover:underline dark:text-purple-400">
              {i.seeAll}
            </Link>
            {totalPages > 1 && (
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-full border border-black/10 p-1.5 transition hover:bg-black/5 disabled:opacity-30 dark:border-white/10 dark:hover:bg-white/10"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="rounded-full border border-purple-500 bg-purple-500 p-1.5 text-white transition hover:bg-purple-600 disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((offer) => {
            const TypeIcon = TYPE_ICON[offer.type] ?? Award;
            const tone = TYPE_TONE[offer.type] ?? "bg-purple-600";
            return (
              <Link
                key={offer.id}
                href={`/opportunities/${offer.id}`}
                className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
              >
                <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gray-50 p-4 dark:bg-white/[0.03]">
                  <img src={offer.image} alt={`Logo ${offer.organization}`} className="h-full w-full object-contain" />
                  <span className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white ${tone}`}>
                    <TypeIcon size={11} /> {typeLabels[offer.type as keyof typeof typeLabels]}
                  </span>
                </div>
                <div className="p-4">
                  <p className="mb-1 line-clamp-2 text-sm font-bold leading-snug">{offer.title}</p>
                  <p className="mb-2 truncate text-xs text-gray-500 dark:text-gray-400">{offer.organization}</p>
                  <p className="mb-3 flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} /> {offer.location}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                    <Calendar size={11} /> {offer.deadline}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
